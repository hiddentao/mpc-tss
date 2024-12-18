import type { AffinePoint } from "../../../curves/types.js";
import type { PaillierSecretKey } from "../../../paillier.js";
import type { PedersenParams } from "../../../pedersen";
import type { Exponent } from "../../../polynomial/exponent.js";
import type { SchnorrRandomness } from "../../../zk/sch.js";
import type { Round } from "../../common/round.js";
import type { CmpKeygenSession } from "./index.js";

export class CmpKeygenRound2 implements Round {
  public readonly vssPolynomial: Exponent;
  public readonly commitment: Uint8Array;
  public readonly rid: bigint;
  public readonly chainKey: bigint;
  public readonly selfShare: bigint;
  public readonly paillierSecret: PaillierSecretKey;
  public readonly pedersenParams: PedersenParams;
  public readonly elGamalSecret: bigint;
  public readonly elGamalPublic: AffinePoint;
  public readonly schnorrRand: SchnorrRandomness;
  public readonly decommitment: Uint8Array;

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
    vssPolynomial: Exponent,
    commitment: Uint8Array,
    rid: bigint,
    chainKey: bigint,
    selfShare: bigint,
    paillierSecret: PaillierSecretKey,
    pedersenParams: PedersenParams,
    elGamalSecret: bigint,
    elGamalPublic: AffinePoint,
    schnorrRand: SchnorrRandomness,
    decommitment: Uint8Array,
  }) {
    this.vssPolynomial = vssPolynomial;
    this.commitment = commitment;
    this.rid = rid;
    this.chainKey = chainKey;
    this.selfShare = selfShare;
    this.paillierSecret = paillierSecret;
    this.pedersenParams = pedersenParams;
    this.elGamalSecret = elGamalSecret;
    this.elGamalPublic = elGamalPublic;
    this.schnorrRand = schnorrRand;
    this.decommitment = decommitment;
  }

  public async process(_session: CmpKeygenSession): Promise<Round> {
    return this;
  }
}
