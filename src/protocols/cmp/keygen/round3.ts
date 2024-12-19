import type { PartyId } from "../../../types"
import type { Round } from "../../common/round"
import type { CmpKeygenSession } from "./index"

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
  }
}
