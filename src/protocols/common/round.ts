import type { Session } from "./session";

/**
 * Protocol Round.
 */
export interface Round {
  /**
   * Process the round.
   * @param session - Protocol session.
   * @returns Next round.
   */
  process(session: Session): Promise<Round>;
}

