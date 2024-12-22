import { CustomError } from "ts-custom-error"
import type { Curve } from "../curves"
import { SerializableObject } from "../object"

export class PolynomialSecretLeakError extends CustomError {
  constructor() {
    super("Attempt to leak secret through polynomial evaluation")
  }
}

export class Polynomial extends SerializableObject {
  public readonly curve: Curve
  public readonly degree: number
  public readonly constant: bigint
  public readonly coefficients: bigint[]

  /**
   * Creates a new polynomial f(X) = constant + a₁⋅X + … + aₜ⋅Xᵗ,
   * with coefficients in ℤₚ and degree t.
   *
   * @param curve The elliptic curve group.
   * @param degree The degree of the polynomial.
   * @param constant The constant term. Defaults to 0 if not set.
   */
  constructor({ curve, degree, constant = 0n }: { curve: Curve, degree: number, constant?: bigint }) {
    super()
    this.curve = curve
    this.degree = degree
    this.constant = constant
    this.coefficients = new Array<bigint>(degree + 1)

    // Set the constant term.
    this.coefficients[0] = constant

    // Generate random coefficients for the rest of the terms.
    for (let i = 1; i <= degree; i++) {
      this.coefficients[i] = this.curve.sampleScalar()
    }
  }

  /**
   * Evaluates the polynomial at the given scalar index.
   * Uses Horner's method for efficient evaluation.
   *
   * @param index The scalar variable for evaluation.
   * @returns The result of f(index).
   */
  evaluate(index: bigint): bigint {
    if (index === 0n) {
      throw new PolynomialSecretLeakError()
    }

    let result = 0n

    // Evaluate using reverse order (Horner's method).
    for (let i = this.coefficients.length - 1; i >= 0; i--) {
      result = this.curve.add(this.curve.mul(result, index), this.coefficients[i])
    }

    return result
  }
}

