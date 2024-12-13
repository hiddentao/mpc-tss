import { secp256k1 } from "@noble/curves/secp256k1"
import { modAdd, modInv, modMultiply, modPow, randBetween } from 'bigint-crypto-utils'

/**
 * The order of the secp256k1 curve, i.e. the total number of points on the curve.
 */
export const secp256k1_N = secp256k1.CURVE.n

export const mod = (x: bigint): bigint => {
  return modAdd([x, 0], secp256k1_N);
}

export const mul = (lhs: bigint, rhs: bigint): bigint => {
  return modMultiply([lhs, rhs], secp256k1_N);
}

export const add = (lhs: bigint, rhs: bigint): bigint => {
    return modAdd([lhs, rhs], secp256k1_N);
}

export const sub = (lhs: bigint, rhs: bigint): bigint => {
  return modAdd([lhs, secp256k1_N - rhs], secp256k1_N);
}

export const inv = (x: bigint): bigint => {
  return modInv(x, secp256k1_N);
}

export const div = (lhs: bigint, rhs: bigint): bigint => {
  return modMultiply([lhs, inv(rhs)], secp256k1_N);
}

export const pow = (x: bigint, e: bigint): bigint => {
  return modPow(x, e, secp256k1_N);
}

/**
 * Check if a scalar is over half the order of the curve
 * @param x - The scalar to check
 * @returns True if the scalar is over half the order of the curve, false otherwise
 */
export const isOverHalfOrder = (x: bigint): boolean => {
  return x > secp256k1_N / 2n;
}

export const sampleScalar = (): bigint => randBetween(secp256k1_N - 1n);
