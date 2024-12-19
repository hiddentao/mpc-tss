export const SEC_PARAM: number = 256;
export const SEC_BYTES: number = SEC_PARAM / 8;
export const OT_PARAM: number = 128;
export const OT_BYTES: number = OT_PARAM / 8;
export const STAT_PARAM: number = 80;

// ZKModIterations is the number of iterations used in proving the validity of a Paillier-Blum modulus N.
export const ZK_MOD_ITERATIONS: number = 12;

// L, LPrime, and Epsilon are derived from the security parameter.
export const L: number = 1 * SEC_PARAM;
export const L_PRIME: number = 5 * SEC_PARAM;
export const EPSILON: number = 2 * SEC_PARAM;
export const L_PLUS_EPSILON: number = L + EPSILON;
export const L_PRIME_PLUS_EPSILON: number = L_PRIME + EPSILON;

// BitsIntModN and related values for modular arithmetic.
export const BITS_INT_MOD_N: number = 8 * SEC_PARAM;
export const BYTES_INT_MOD_N: number = BITS_INT_MOD_N / 8;

// Size of Blum prime and Paillier keys.
export const BITS_BLUM_PRIME: number = 4 * SEC_PARAM;
export const BITS_PAILLIER: number = 2 * BITS_BLUM_PRIME;

export const BYTES_PAILLIER: number = BITS_PAILLIER / 8;
export const BYTES_CIPHERTEXT: number = 2 * BYTES_PAILLIER;

export const NETWORKING_TIMEOUT: number = 10000; // 10 seconds