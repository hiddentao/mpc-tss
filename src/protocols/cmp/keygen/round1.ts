import { idToBigInt } from "../../../number.js"
import { PaillierSecretKey } from "../../../paillier"
import { Exponent } from "../../../polynomial/exponent.js"
import { randomBigInt } from "../../../rand.js"
import { SchnorrRandomness } from "../../../zk/sch.js"

import type { Round } from "../../common/round.js"
import type { CmpKeygenSession } from "./index.js"
import { CmpKeygenRound2 } from "./round2.js"

export class CmpKeygenRound1 implements Round {
  public async process(session: CmpKeygenSession): Promise<Round> {
    session.logger.info(`Processing round 1`)
    
    const paillierSecret = await PaillierSecretKey.generate()
    const pedersenParams = paillierSecret.samplePedersenParams()
    const [elGamalSecret, elGamalPublic] = session.curve.sampleScalarPointPair()
    const selfShare = session.vssSecret.evaluate(
      idToBigInt(session.partyId),
    )
    const selfVSSPolynomial = Exponent.fromPolynomial({
      curve: session.curve,
      polynomial: session.vssSecret,
    })
    const schnorrRand = SchnorrRandomness.generate({ curve: session.curve })
    const maxRandomRange = 2n ** 256n
    const selfRID = randomBigInt(maxRandomRange)
    const chainKey = randomBigInt(maxRandomRange)
    const { commitment, decommitment } = session.hasher
      .clone()
      .update(session.partyId)
      .commit([
        selfRID,
        chainKey,
        selfVSSPolynomial,
        schnorrRand.commitment,
        elGamalPublic,
        pedersenParams.n,
        pedersenParams.s,
        pedersenParams.t,
      ])

    await session.networking.sendMessage({
      session,
      data: { commitment },
    })

    return new CmpKeygenRound2({
      vssPolynomial: selfVSSPolynomial,
      commitment,
      rid: selfRID,
      chainKey,
      selfShare,
      paillierSecret,
      pedersenParams,
      elGamalSecret,
      elGamalPublic,
      schnorrRand,
      decommitment,
    })
  }
}
