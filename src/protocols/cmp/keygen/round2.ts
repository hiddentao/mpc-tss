import { CustomError } from "ts-custom-error"
import type { AffinePoint } from "../../../curves/types"
import { Hasher } from "../../../hasher"
import { SerializableObject } from "../../../object"
import type { PaillierSecretKey } from "../../../paillier"
import type { PedersenParams, PedersenPublicParams } from "../../../pedersen"
import type { Exponent } from "../../../polynomial/exponent"
import type { PartyId } from "../../../types"
import type { SchnorrCommitment, SchnorrRandomness } from "../../../zk/sch"
import type { Round } from "../../common/round"
import { type CmpKeygenRound1Message, CmpKeygenRound3, type CmpKeygenSession } from "./index"


export class CmpKeygenInvalidRound1CommitmentError extends CustomError {
  public constructor(sender: PartyId, e: Error) {
    super(`Invalid round 1 commitment from ${sender}: ${e.message}`)
  }
}

export type CmpKeygenRound2Message = {
  rid: bigint
  chainKey: bigint
  vssPolynomial: Exponent
  schnorrCommitment: SchnorrCommitment
  elGamalPublic: AffinePoint
  pedersonPublicParams: PedersenPublicParams
  decommitment: Uint8Array
}

export class CmpKeygenRound2 extends SerializableObject implements Round {
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
    super()

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
      const { commitment } = msg.data as CmpKeygenRound1Message

      try {
        Hasher.validateCommitment(commitment)
      } catch (e: any) {
        throw new CmpKeygenInvalidRound1CommitmentError(msg.sender, e)
      }
      
      this.commitments[msg.sender] = commitment
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
        pedersonPublicParams: this.pedersenParams.publicParams,
        decommitment: this.decommitment,
      } as CmpKeygenRound2Message,
    })

    return new CmpKeygenRound3({
      commitments: this.commitments,
    })
  }
}
