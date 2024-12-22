import { CustomError } from "ts-custom-error"
import type { AffinePoint } from "../../../curves/types"
import { Hasher } from "../../../hasher"
import { SerializableObject } from "../../../object"
import { PaillierPublicKey, validatePaillierModulus } from "../../../paillier"
import { PedersenParams, PedersenPublicParams } from "../../../pedersen"
import type { Exponent } from "../../../polynomial"
import type { PartyId } from "../../../types"
import type { SchnorrCommitment } from "../../../zk/sch"
import type { Round } from "../../common/round"
import type { CmpKeygenRound2Message, CmpKeygenSession } from "./index"

export class CmpKeygenInvalidRound2DecommitmentError extends CustomError {
  public constructor(sender: PartyId, e: Error) {
    super(`Party ${sender} has invalid round 2 decommitment: ${e.message}`)
  }
}

export class CmpKeygenInvalidVssPolynomialConstantError extends CustomError {
  public constructor(sender: PartyId) {
    super(`Party ${sender} has incorrect vss polynomial constant`)
  }
}

export class CmpKeygenInvalidVssPolynomialDegreeError extends CustomError {
  public constructor(sender: PartyId, degree: number, threshold: number) {
    super(`Party ${sender} vss polynomial has incorrect degree ${degree} (threshold = ${threshold})`)
  }
}

export class CmpKeygenRound3 extends SerializableObject implements Round {
  public readonly commitments: Record<PartyId, Uint8Array>
  public readonly rids: Record<PartyId, bigint> = {}
  public readonly chainKeys: Record<PartyId, bigint> = {}
  public readonly elGamalPublics: Record<PartyId, AffinePoint> = {}
  public readonly schnorrCommitments: Record<PartyId, SchnorrCommitment> = {}
  public readonly vssPolynomials: Record<PartyId, Exponent> = {}
  public readonly paillierPublicKeys: Record<PartyId, PaillierPublicKey> = {}
  public readonly pedersonPublicParams: Record<PartyId, PedersenPublicParams> = {}

  public constructor({
    commitments,
  }: {
    commitments: Record<PartyId, Uint8Array>
  }) {
    super()
    this.commitments = commitments
  }

  public async process(session: CmpKeygenSession): Promise<Round> {
    session.logger.info(`Processing round 3`)

    const messages = await session.networking.fetchReceivedMessages({ session })

    for (const msg of messages) {
      const { rid, chainKey, vssPolynomial, schnorrCommitment, elGamalPublic, pedersonPublicParams, decommitment } = msg.data as CmpKeygenRound2Message

      try {
        Hasher.validateDecommitment(decommitment)
      } catch (e: any) {
        throw new CmpKeygenInvalidRound2DecommitmentError(msg.sender, e)
      }

      if ((session.vssSecret.constant === 0n) !== (vssPolynomial.isConstant)) {
        throw new CmpKeygenInvalidVssPolynomialConstantError(msg.sender)
      }

      if (vssPolynomial.degree !== session.threshold) {
        throw new CmpKeygenInvalidVssPolynomialDegreeError(msg.sender, vssPolynomial.degree, session.threshold)
      }

      await validatePaillierModulus(pedersonPublicParams.n)
      await PedersenPublicParams.validate(pedersonPublicParams)

      const valid = session.hasher.clone().update(msg.sender).decommit(
        this.commitments[msg.sender],
        decommitment,
        [
          rid,
          chainKey,
          vssPolynomial,
          schnorrCommitment.C,
          elGamalPublic,
          pedersonPublicParams
        ]
      )
      if (!valid) {
        throw new CmpKeygenInvalidRound2DecommitmentError(msg.sender, new Error("decommitment failed"))
      }

      this.rids[msg.sender] = rid
      this.chainKeys[msg.sender] = chainKey
      this.elGamalPublics[msg.sender] = elGamalPublic
      this.schnorrCommitments[msg.sender] = schnorrCommitment
      this.vssPolynomials[msg.sender] = vssPolynomial
      this.paillierPublicKeys[msg.sender] = new PaillierPublicKey({ n: pedersonPublicParams.n })
      this.pedersonPublicParams[msg.sender] = pedersonPublicParams
    }

    Object.freeze(this.rids)
    Object.freeze(this.chainKeys)
    Object.freeze(this.elGamalPublics)
    Object.freeze(this.schnorrCommitments)
    Object.freeze(this.vssPolynomials)
    Object.freeze(this.paillierPublicKeys)
    Object.freeze(this.pedersonPublicParams)
  }
}
