import type { Logger } from "../../logging";

/**
 * Protocol Session.
 */
export interface Session {
  /** Logger. */
  readonly logger: Logger;
  /** Protocol ID. */
  readonly protocolId: string;
  /** Current round number. */
  readonly currentRound: number;
  /** Final round number. */
  readonly finalRound: number;
  /** Party ID of the current party. */
  readonly partyId: string;
  /** All party IDs. */
  readonly allPartyIds: string[];
  /** Number of parties. */
  readonly numParties: number;
} 
