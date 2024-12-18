import { CustomError } from 'ts-custom-error';
import type { Session } from "./session";

export class InvalidTargetError extends CustomError {
  constructor(msg: string) {
    super(msg);
  }
}

export type ProtocolMessage = {
  readonly protocolId: string;
  readonly round: number;
  readonly timestamp: number;
  readonly message: any;
}

export abstract class ProtocolNetworking {
  public async broadcastMessage({ session, message }: { session: Session, message: any }) {
    const sender = session.selfPartyId;

    for (const id of session.allPartyIds) {
      if (id === sender) continue;

      await this._sendMessage({
        sender,
        receiver: id,
        message: {
          protocolId: session.protocolId,
          round: session.currentRound,
          timestamp: Date.now(),
          message
        }
      });
    }
  }

  public async unicastMessage({ session, target: receiver, message }: { session: Session, target: string, message: any }) {
    const sender = session.selfPartyId;

    if (!session.allPartyIds.includes(receiver)) {
      throw new InvalidTargetError('Target is not in the session');
    }

    if (receiver === sender) {
      throw new InvalidTargetError('Target cannot be the same as the sender');
    }

    await this._sendMessage({
      sender,
      receiver,
      message: {
        protocolId: session.protocolId,
        round: session.currentRound,
        timestamp: Date.now(),
        message
      }
    });
  }

  protected abstract _sendMessage({ sender, receiver, message }: { sender: string, receiver: string, message: ProtocolMessage }): Promise<void>;
}

