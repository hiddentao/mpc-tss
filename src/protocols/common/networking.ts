import { CustomError } from 'ts-custom-error';
import { NETWORKING_TIMEOUT } from '../../constants';
import type { PartyId } from '../../types';
import type { Session } from "./session";

export class InvalidTargetError extends CustomError {
  constructor(msg: string) {
    super(msg);
  }
}

export type ProtocolMessageData = any

export type ProtocolMessage = {
  readonly targetRound: TargetRoundNum
  readonly protocolId: string;
  readonly sender: PartyId
  readonly timestamp: number;
  readonly data: ProtocolMessageData;
}

export class NetworkingTimeoutError extends CustomError {
  constructor(msg: string) {
    super(msg);
  }
}

type TargetRoundNum = number

export type BroadcasterCallback = (message: ProtocolMessage) => Promise<void>

export class ProtocolNetworking {
  protected readonly sentMessages: Record<TargetRoundNum, ProtocolMessage[]> = {}
  protected readonly receivedMessages: Record<TargetRoundNum, ProtocolMessage[]> = {}
  protected readonly broadcaster: BroadcasterCallback

  public constructor({ broadcaster }: { broadcaster: BroadcasterCallback }) {  
    this.broadcaster = broadcaster
  }

  public async sendMessage({ session, data }: { session: Session, data: ProtocolMessageData }) {
    const sender = session.partyId;

    session.logger.info(`Broadcasting message to round ${session.currentRound + 1}`)

    await this.broadcaster({ sender, data, targetRound: session.currentRound + 1, timestamp: Date.now(), protocolId: session.protocolId })
  }

  public async onReceiveMessage({ message }: { message: ProtocolMessage }) {
    this.receivedMessages[message.targetRound] = this.receivedMessages[message.targetRound] || []
    this.receivedMessages[message.targetRound].push(message)
  }

  public async fetchReceivedMessages({ session, targetRound }: { session: Session, targetRound?: TargetRoundNum }) {
    targetRound = targetRound || session.currentRound
    
    session.logger.info(`Fetching received broadcast messages for round ${targetRound}`)

    return await new Promise<ProtocolMessage[]>((resolve, reject) => {
      const timeElapsed = 0
      const expectedMessages = session.numParties - 1

      session.logger.debug(`Expecting ${expectedMessages} messages for round ${targetRound}...`)

      const interval = setInterval(() => {
        if (!this.receivedMessages[targetRound]) {
          return
        }

        const msgs = this.receivedMessages[targetRound].filter(({ sender }) => sender !== session.partyId)
        if (msgs.length === expectedMessages) {
          clearInterval(interval)

          session.logger.info(`Received ${msgs.length} messages for round ${targetRound}`)

          resolve(msgs)
        } else {
          if (timeElapsed > NETWORKING_TIMEOUT) {
            session.logger.error(`Timed out waiting for ${expectedMessages} messages for round ${targetRound}`)

            reject(new NetworkingTimeoutError(`[${session.protocolId}/${session.partyId}]: Timeout waiting for ${expectedMessages} messages for round ${targetRound}`))
          }
        }
      }, 1000)
    })
  }
}


/*
    this.broadcastMesssages[session.currentRound + 1] = this.broadcastMesssages[session.currentRound + 1] || []
    this.broadcastMesssages[session.currentRound + 1].push({
      protocolId: session.protocolId,
      sender,
      timestamp: Date.now(),
      message
    })
*/

