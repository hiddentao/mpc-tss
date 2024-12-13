import type { secp256k1 } from '@noble/curves/secp256k1';

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

export interface Jsonable {
  toJSON(): Json
}

export type AffinePoint = Parameters<typeof secp256k1.ProjectivePoint.fromAffine>[0]
export type ProjectivePoint = ReturnType<typeof secp256k1.ProjectivePoint.fromAffine>

export type AffinePointJSON = {
  xHex: string,
  yHex: string,
}

export type PartyId = string
