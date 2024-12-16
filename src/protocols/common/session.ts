/**
 * Protocol Session.
 */
export interface Session {
  /** Protocol ID. */
  readonly protocolId: string;
  /** Current round number. */
  readonly currentRound: number;
  /** Final round number. */
  readonly finalRound: number;
} 