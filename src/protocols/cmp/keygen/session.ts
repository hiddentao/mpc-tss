import { CustomError } from "ts-custom-error";
import { Secp256k1 } from "../../../curves/index";
import { Hasher } from "../../../hasher";
import type { Logger } from "../../../logging";
import { SerializableObject } from "../../../object";
import { Polynomial } from "../../../polynomial";
import { randomChars, randomPartyId } from "../../../rand";
import type { PartyId } from "../../../types";
import type { ProtocolNetworking } from "../../common/networking";
import type { Session } from "../../common/session";
import { CmpInvalidThresholdError, CmpMinimumPartiesError } from "../common";

export class CmpKeygenInvalidPartyListError extends CustomError {
  public constructor(msg: string) {
    super(msg)
  }
}

/**
 * CMP Keygen session.
 * 
 * Each party has an instance of this class.
 */
export class CmpKeygenSession extends SerializableObject implements Session {
  /** Logger. */
  public readonly logger: Logger;
  /** Protocol ID. */
  public readonly protocolId = 'cmp/keygen';
  /** Current round number. */
  public currentRound = 1
  /** Final round number. */
  public finalRound = 5
  /** Curve used for the protocol. */
  public readonly curve = Secp256k1
  /** Party ID of the current party. */
  public readonly partyId: PartyId;
  /** All party IDs. */
  public readonly allPartyIds: PartyId[] = [];
  /** Maximum number of parties assumed to be corrupted during protocol execution. */
  public readonly threshold: number;
  /** No. of parties in the protocol. */
  public readonly numParties: number;
  /** Hasher instance. */
  public readonly hasher: Hasher;
  /** VSS constant. */
  public readonly vssConstant: bigint;
  /** VSS secret polynomial. */
  public readonly vssSecret: Polynomial;
  /** Networking layer. */
  public readonly networking: ProtocolNetworking;

  public override getSerializableValues() {
    const values = super.getSerializableValues()
    delete values.logger
    delete values.networking  
    delete values.hasher
    delete values.curve
    return values
  }

  public constructor({
    logger,
    selfPartyId,
    allPartyIds,
    threshold,
    numParties,
    networking,
  }: {
    logger: Logger,
    selfPartyId?: string,
    allPartyIds?: PartyId[],
    threshold: number,
    numParties: number,
    networking: ProtocolNetworking,
  }) {
    super()

    this.numParties = numParties
    this.threshold = threshold

    if (numParties < 2) {
      throw new CmpMinimumPartiesError();
    }

    if (threshold < 1 || threshold > numParties - 1) {
      throw new CmpInvalidThresholdError();
    }

    this.partyId = selfPartyId ? `${selfPartyId}-${randomChars(8)}` : randomPartyId()

    this.logger = logger.createSub(this.partyId)

    if (allPartyIds) {
      if (allPartyIds.length !== numParties) {
        throw new CmpKeygenInvalidPartyListError(`Expected ${numParties} party ids, got ${allPartyIds.length}`)
      }

      if (!this.allPartyIds.includes(this.partyId)) {
        throw new CmpKeygenInvalidPartyListError(`Party ${this.partyId} is not in the provided list of all party ids`)
      }

      this.allPartyIds = allPartyIds

      this.logger.info(`Setting all party ids: ${this.allPartyIds.join('|')}`)
    }

    this.hasher = Hasher.create().update('CMP-SESSION')
    this.hasher.update(this.protocolId);
    this.hasher.update(this.curve.name);
    this.hasher.update(BigInt(this.threshold));
    this.hasher.update(BigInt(this.numParties));
    if (this.allPartyIds.length) {
      this.hasher.update(this.allPartyIds.join('|'))
    }

    this.vssConstant = this.curve.sampleScalar();
    this.vssSecret = new Polynomial({ curve: this.curve, degree: this.threshold, constant: this.vssConstant });
    
    this.networking = networking;
  }
}
