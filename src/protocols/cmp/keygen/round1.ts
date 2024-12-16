import { idToBigInt } from "../../../number.js";
import { PaillierSecretKey } from "../../../paillier"
import { Exponent } from "../../../polynomial/exponent.js";
import { randomBigInt } from "../../../rand.js";
import { SchnorrRandomness } from "../../../zk/sch.js";

import type { Round } from "../../common/round.js";
import type { Session } from "../../common/session.js";
import type { CmpKeygenSession } from "./index.js";

export class CmpKeygenRound1 implements Round {
  public async process(session: CmpKeygenSession): Promise<Round> {
    const paillierSecret = await PaillierSecretKey.generate()
    const selfPaillierPublic = paillierSecret.publicKey
    const pedersonParams = paillierSecret.samplePedersonParams()
    const [elGamalSecret, elGamalPublic] = session.curve.sampleScalarPointPair()
    const selfShare = session.vssSecret.evaluate(idToBigInt(session.selfPartyId));
    const selfVSSPolynomial = Exponent.fromPolynomial({ curve: session.curve, polynomial: session.vssSecret });
    const schnorrRand = SchnorrRandomness.generate({ curve: session.curve });
    const maxRandomRange = 2n ** 256n
    const selfRID = randomBigInt(maxRandomRange)
    const chainKey = randomBigInt(maxRandomRange)
    const [selfCommitment, decommitment] = await session.curve.hashForID(session.selfPartyId).commit(
      selfRID,
      chainKey,
      selfVSSPolynomial,
      schnorrRand.commitment,
      elGamalPublic,
      pedersonParams.n,
      pedersonParams.s,
      pedersonParams.t
  );

  const msg = { commitment: selfCommitment };
  await this.helper.broadcastMessage(out, msg);

  return new Round2({
      round1: this,
      vssPolynomials: new Map([[this.helper.selfID, selfVSSPolynomial]]),
      commitments: new Map([[this.helper.selfID, selfCommitment]]),
      rids: new Map([[this.helper.selfID, selfRID]]),
      chainKeys: new Map([[this.helper.selfID, chainKey]]),
      shareReceived: new Map([[this.helper.selfID, selfShare]]),
      elGamalPublic: new Map([[this.helper.selfID, elGamalPublic]]),
      paillierPublic: new Map([[this.helper.selfID, selfPaillierPublic]]),
      pedersen: new Map([[this.helper.selfID, selfPedersenPublic]]),
      elGamalSecret,
      paillierSecret,
      pedersenSecret,
      schnorrRand,
      decommitment
  });
}
