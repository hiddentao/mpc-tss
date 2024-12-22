// TODO: This is the original implementation from other repo
// const modSymmetric1 = (x: bigint, n: bigint): bigint => {
//   const absMod = (abs(x) as bigint) % n;
//   const negated = modMultiply([-absMod], n);
//   if (negated <= absMod) {
//     return -negated;
//   } else {
//     return absMod;
//   }
// }

import { gcd } from "bigint-crypto-utils";

const modSymmetric2 = (x: bigint, n: bigint): bigint => {
  const absMod = ((x % n) + n) % n;
  return absMod > n / 2n ? absMod - n : absMod;
};


export const modSymmetric = modSymmetric2


/**
 * Checks if numbers are in range [1,…,N-1] and co-prime to N
 * @param N The modulus
 * @param nums The numbers to check
 * @returns True if all numbers are in range [1,…,N-1] and co-prime to N, false otherwise
 */
export function checkScalarsRangeAndCoprime(N: bigint, ...nums: bigint[]): boolean {
  for (const num of nums) {
    // Check range [1,…,N-1]
    if (num <= 0n || num >= N) {
      return false;
    }
    
    // Check if co-prime (GCD = 1)
    if (gcd(num, N) !== 1n) {
      return false;
    }
  }
  return true;
}

