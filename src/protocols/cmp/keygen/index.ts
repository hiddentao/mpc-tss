import { CustomError } from "ts-custom-error";
import { Secp256k1 } from "../../../curves/index.js";
import { Hasher } from "../../../hasher.js";
import { Polynomial } from "../../../polynomial.js";
import type { Session } from "../../common/session.js";
import { CmpInvalidThresholdError, CmpMinimumPartiesError } from "../common.js";


class CmpKeygenSessionPartyNotFoundError extends CustomError {
  constructor() {
    super("Self party ID not found in the list of all party IDs");
  }
}

/**
 * CMP Keygen session.
 * 
 * Each party has an instance of this class.
 */
export class CmpKeygenSession implements Session {
  /** Protocol ID. */
  public readonly protocolId = 'cmp/keygen';
  /** Current round number. */
  public currentRound = 1
  /** Final round number. */
  public finalRound = 5
  /** Curve used for the protocol. */
  public readonly curve = Secp256k1
  /** Party ID of the current party. */
  public readonly selfPartyId: string;
  /** All party IDs. */
  public readonly allPartyIds: string[];
  /** Maximum number of parties assumed to be corrupted during protocol execution. */
  public readonly threshold: number;
  /** Hasher instance. */
  public readonly hasher: Hasher;
  /** VSS constant. */
  public readonly vssConstant: bigint;
  /** VSS secret polynomial. */
  public readonly vssSecret: Polynomial;

  public constructor({
    selfPartyId,
    allPartyIds,
    threshold,
  }: {
    selfPartyId: string,
    allPartyIds: string[],
    threshold: number,
  }) {
    if (allPartyIds.length < 2) {
      throw new CmpMinimumPartiesError();
    }

    if (!allPartyIds.includes(selfPartyId)) {
      throw new CmpKeygenSessionPartyNotFoundError();
    }

    if (threshold < 1 || threshold >= allPartyIds.length) {
      throw new CmpInvalidThresholdError();
    }

    this.selfPartyId = selfPartyId
    this.allPartyIds = allPartyIds
    this.threshold = threshold
    
    this.hasher = Hasher.create().update('CMP-SESSION')
    this.hasher.update(this.protocolId);
    this.hasher.update(this.curve.name);
    this.hasher.update(BigInt(this.threshold));
    for (let partyId of this.allPartyIds) {
      this.hasher.update(partyId);
    }

    this.vssConstant = this.curve.sampleScalar();
    this.vssSecret = new Polynomial({ curve: this.curve, degree: this.threshold, constant: this.vssConstant });
  }
}
