import type { secp256k1 } from "@noble/curves/secp256k1";

export type AffinePoint = Parameters<typeof secp256k1.ProjectivePoint.fromAffine>[0];
export type ProjectivePoint = ReturnType<typeof secp256k1.ProjectivePoint.fromAffine>;

export interface Curve {
  readonly N: bigint;
  readonly name: string;
  readonly ProjectivePoint: typeof secp256k1.ProjectivePoint;
  readonly BASE: ProjectivePoint;
  readonly ZERO: ProjectivePoint;
  mod(x: bigint): bigint;
  mul(lhs: bigint, rhs: bigint): bigint;
  add(lhs: bigint, rhs: bigint): bigint;
  sub(lhs: bigint, rhs: bigint): bigint;
  inv(x: bigint): bigint;
  div(lhs: bigint, rhs: bigint): bigint;
  pow(x: bigint, e: bigint): bigint;
  isOverHalfOrder(x: bigint): boolean;
  sampleScalar(): bigint;
  sampleScalarPointPair(): [bigint, AffinePoint];
}

export function isAffinePoint(data: any): data is AffinePoint {
  return typeof data === "object" && data !== null && "x" in data && "y" in data;
}

export function isProjectivePoint(data: any): data is ProjectivePoint {
  return typeof data === "object" && data !== null && "px" in data && "py" in data && "pz" in data && "toRawBytes" in data;
}
