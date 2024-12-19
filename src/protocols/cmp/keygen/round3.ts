import { CustomError } from "ts-custom-error"
import { Hasher } from "../../../hasher"
import type { PartyId } from "../../../types"
import type { Round } from "../../common/round"
import type { CmpKeygenRound2Message, CmpKeygenSession } from "./index"

export class CmpKeygenInvalidRound2DecommitmentError extends CustomError {
  public constructor(sender: PartyId, e: Error) {
    super(`Invalid round 2 decommitment from ${sender}: ${e.message}`)
  }
}

export class CmpKeygenRound3 implements Round {
  public readonly commitments: Record<PartyId, Uint8Array>
  public constructor({
    commitments,
  }: {
    commitments: Record<PartyId, Uint8Array>
  }) {
    this.commitments = commitments
  }

  public async process(session: CmpKeygenSession): Promise<Round> {
    session.logger.info(`Processing round 3`)

    const messages = await session.networking.fetchReceivedMessages({ session })

    for (const msg of messages) {
      const { rid, chainKey, vssPolynomial, schnorrCommitment, elGamalPublic, pedersonParams, decommitment } = msg.data as CmpKeygenRound2Message

      try {
        Hasher.validateDecommitment(decommitment)
      } catch (e: any) {
        throw new CmpKeygenInvalidRound2DecommitmentError(msg.sender, e)
      }

      
    }
  }
}
