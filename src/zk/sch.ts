import type { AffinePoint, Curve } from "../curves"
import type { HashableInput, HashableInputFactory } from "../hasher"
import { SerializableObject } from "../object"

export class SchnorrCommitment extends SerializableObject implements HashableInputFactory {
  public readonly C: AffinePoint

  constructor({ C }: { C: AffinePoint }) {
    super()
    this.C = C
  }

  public getHashableInputs(): HashableInput[] {
    return [this.C]
  }
}

export class SchnorrRandomness extends SerializableObject {
  public readonly a: bigint
  public readonly commitment: SchnorrCommitment

  public constructor({
    a,
    commitment,
  }: { a: bigint; commitment: SchnorrCommitment }) {
    super()
    this.a = a
    this.commitment = commitment
  }

  public static generate({
    curve,
    gen,
  }: { curve: Curve; gen?: AffinePoint }): SchnorrRandomness {
    const gen2 = gen
      ? curve.ProjectivePoint.fromAffine(gen)
      : curve.ProjectivePoint.BASE
    const a = curve.sampleScalar()
    return new SchnorrRandomness({
      a,
      commitment: new SchnorrCommitment({
        C: gen2.multiply(a).toAffine(),
      }),
    })
  }
}
