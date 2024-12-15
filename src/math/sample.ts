import { bytesToNumberBE } from "@noble/curves/abstract/utils";
import { bitLength, gcd } from "bigint-crypto-utils";
import { MaxIterationsExceededError } from "../errors";
import { RandomBytes } from "../rand";

export const MAX_SAMPLE_ITERATIONS = 256;

export const sampleUnitModN = (modulus: bigint): bigint => {
  const randByteLength = Math.floor((bitLength(modulus) + 7) / 8);

  for (let i = 0; i < MAX_SAMPLE_ITERATIONS; i++) {
    const bits = RandomBytes.getBytes(randByteLength);
    const r = bytesToNumberBE(bits);
    if ((gcd(r, modulus) === 1n)) {
      return r;
    }
  }

  throw new MaxIterationsExceededError("sampleUnitModN", MAX_SAMPLE_ITERATIONS);
}


