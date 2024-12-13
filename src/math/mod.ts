import { abs, modMultiply } from "bigint-crypto-utils";

export const modSymmetric = (x: bigint, n: bigint): bigint => {
  const absMod = (abs(x) as bigint) % n;
  const negated = modMultiply([-absMod], n);
  if (negated <= absMod) {
    return -negated;
  } else {
    return absMod;
  }
}

export const modSymmetric2 = (x: bigint, n: bigint): bigint => {
  const absMod = ((x % n) + n) % n;
  return absMod > n / 2n ? absMod - n : absMod;
};

