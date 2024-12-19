import { CustomError } from "ts-custom-error"
import type { AffinePoint } from "../../../curves/types"
import { Hasher } from "../../../hasher"
import type { PaillierSecretKey } from "../../../paillier"
import type { PedersenParams } from "../../../pedersen"
import type { Exponent } from "../../../polynomial/exponent"
import type { PartyId } from "../../../types"
import type { SchnorrRandomness } from "../../../zk/sch"
import type { Round } from "../../common/round"
import { CmpKeygenRound3, type CmpKeygenSession } from "./index"


export class CmpKeygenInvalidRound1CommitmentError extends CustomError {
  public constructor(sender: PartyId, e: Error) {
    super(`Invalid round 1 commitment from ${sender}: ${e.message}`)
  }
}

export class CmpKeygenRound2 implements Round {
  public readonly vssPolynomial: Exponent
  public readonly commitment: Uint8Array
  public readonly rid: bigint
  public readonly chainKey: bigint
  public readonly selfShare: bigint
  public readonly paillierSecret: PaillierSecretKey
  public readonly pedersenParams: PedersenParams
  public readonly elGamalSecret: bigint
  public readonly elGamalPublic: AffinePoint
  public readonly schnorrRand: SchnorrRandomness
  public readonly decommitment: Uint8Array
  public readonly commitments: Record<PartyId, Uint8Array> = {}

  public constructor({
    vssPolynomial,
    commitment,
    rid,
    chainKey,
    selfShare,
    paillierSecret,
    pedersenParams,
    elGamalSecret,
    elGamalPublic,
    schnorrRand,
    decommitment,
  }: {
    vssPolynomial: Exponent
    commitment: Uint8Array
    rid: bigint
    chainKey: bigint
    selfShare: bigint
    paillierSecret: PaillierSecretKey
    pedersenParams: PedersenParams
    elGamalSecret: bigint
    elGamalPublic: AffinePoint
    schnorrRand: SchnorrRandomness
    decommitment: Uint8Array
  }) {
    this.vssPolynomial = vssPolynomial
    this.commitment = commitment
    this.rid = rid
    this.chainKey = chainKey
    this.selfShare = selfShare
    this.paillierSecret = paillierSecret
    this.pedersenParams = pedersenParams
    this.elGamalSecret = elGamalSecret
    this.elGamalPublic = elGamalPublic
    this.schnorrRand = schnorrRand
    this.decommitment = decommitment
  }

  public async process(session: CmpKeygenSession): Promise<Round> {
    session.logger.info(`Processing round 2`)

    const messages = await session.networking.fetchReceivedMessages({
      session,
    })

    messages.forEach((msg) => {
      const { commitment } = msg.data as { commitment: Uint8Array }

      try {
        Hasher.validateCommitment(commitment)
      } catch (e: any) {
        throw new CmpKeygenInvalidRound1CommitmentError(msg.sender, e)
      }
      
      this.commitments[msg.sender] = commitment
      if (!session.allPartyIds.includes(msg.sender)) {
        session.logger.info(`Discovered new party id: ${msg.sender}`)

        session.allPartyIds.push(msg.sender)
      }
    })

    Object.freeze(this.commitments)
    Object.freeze(session.allPartyIds)

    await session.networking.sendMessage({
      session,
      data: {
        rid: this.rid,
        chainKey: this.chainKey,
        vssPolynomial: this.vssPolynomial,
        schnorrCommitment: this.schnorrRand.commitment,
        elGamalPublic: this.elGamalPublic,
        pedersenPublicN: this.pedersenParams.n,
        decommitment: this.decommitment,
      },
    })

    return new CmpKeygenRound3({
      commitments: this.commitments,
    })
  }
}
