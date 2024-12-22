import { CustomError } from "ts-custom-error"
import type { AffinePoint, Curve, ProjectivePoint } from "../curves"
import type { HashableInput, HashableInputFactory } from "../hasher"
import { SerializableObject } from "../object"
import { Polynomial } from "./polynomial"

class ExponentLengthError extends CustomError {
  constructor() {
    super("exponents must have same length")
  }
}

class ExponentConstantError extends CustomError {
  constructor() {
    super("exponents must have same isConstant value")
  }
}

export class Exponent extends SerializableObject implements HashableInputFactory {
  public readonly curve: Curve
  public readonly isConstant: boolean
  public readonly coefficients: ProjectivePoint[]

  protected constructor({
    curve,
    isConstant = false,
    coefficients = [],
  }: { curve: Curve; isConstant?: boolean; coefficients?: ProjectivePoint[] }) {
    super()
    this.curve = curve
    this.isConstant = isConstant
    this.coefficients = coefficients
  }

  static fromPolynomial({
    curve,
    polynomial,
  }: { curve: Curve; polynomial: Polynomial }): Exponent {
    const coefficients: ProjectivePoint[] = []
    const isConstant = polynomial.coefficients[0] === 0n

    for (let i = 0; i < polynomial.coefficients.length; i++) {
      if (isConstant && i === 0) {
        continue
      }
      coefficients.push(curve.BASE.multiply(polynomial.coefficients[i]))
    }

    return new Exponent({ curve, isConstant, coefficients })
  }

  evaluate(x: bigint): AffinePoint {
    let result = this.curve.ZERO

    for (let i = this.coefficients.length - 1; i >= 0; i--) {
      result = result.multiply(x).add(this.coefficients[i])
    }

    if (this.isConstant) {
      result = result.multiply(x)
    }

    return result.toAffine()
  }

  get degree(): number {
    return this.isConstant
      ? this.coefficients.length
      : this.coefficients.length - 1
  }

  add(other: Exponent): void {
    if (this.coefficients.length !== other.coefficients.length) {
      throw new ExponentLengthError()
    }
    if (this.isConstant !== other.isConstant) {
      throw new ExponentConstantError()
    }

    for (let i = 0; i < this.coefficients.length; i++) {
      this.coefficients[i] = this.coefficients[i].add(other.coefficients[i])
    }
  }

  static sum(exponents: Exponent[]): Exponent {
    const summed = exponents[0].clone()

    for (let i = 1; i < exponents.length; i++) {
      summed.add(exponents[i])
    }

    return summed
  }

  public clone(): Exponent {
    return new Exponent({
      curve: this.curve,
      isConstant: this.isConstant,
      coefficients: this.coefficients.slice(),
    })
  }

  public getHashableInputs(): HashableInput[] {
    return this.coefficients.map((coefficient) => coefficient)
  }
}
