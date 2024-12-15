import { secp256k1 } from "@noble/curves/secp256k1"
import { modAdd, modInv, modMultiply, modPow, randBetween } from 'bigint-crypto-utils'
import type { Curve } from './types';


export class Secp256k1Curve implements Curve {
  public readonly N: bigint = secp256k1.CURVE.n;
  public readonly BASE = secp256k1.ProjectivePoint.BASE;

  public mod(x: bigint): bigint {
    return modAdd([x, 0], this.N);
  }

  public mul(lhs: bigint, rhs: bigint): bigint {
    return modMultiply([lhs, rhs], this.N);
  }

  public add(lhs: bigint, rhs: bigint): bigint {
    return modAdd([lhs, rhs], this.N);
  }

  public sub(lhs: bigint, rhs: bigint): bigint {
    return modAdd([lhs, this.N - rhs], this.N);
  }

  public inv(x: bigint): bigint {
    return modInv(x, this.N);
  }

  public div(lhs: bigint, rhs: bigint): bigint {
    return modMultiply([lhs, this.inv(rhs)], this.N);
  }

  public pow(x: bigint, e: bigint): bigint {
    return modPow(x, e, this.N);
  }

  public isOverHalfOrder(x: bigint): boolean {
    return x > this.N / 2n;
  }

  public sampleScalar(): bigint {
    return randBetween(this.N - 1n);
  }
}

export const Secp256k1 = new Secp256k1Curve()