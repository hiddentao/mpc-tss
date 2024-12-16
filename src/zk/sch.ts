import type { AffinePoint, Curve } from "../curves"

export class SchnorrCommitment {
  public readonly C: AffinePoint

  constructor({ C }: { C: AffinePoint }) {
    this.C = C
  }
}

export class SchnorrRandomness {
  public readonly a: bigint
  public readonly commitment: SchnorrCommitment

  public constructor({
    a,
    commitment,
  }: { a: bigint; commitment: SchnorrCommitment }) {
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
