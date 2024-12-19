import { randBetween, randBytesSync } from "bigint-crypto-utils"
import type { PartyId } from "./types"

export class RandomBytes<T extends number> {
  private readonly n: Uint8Array

  constructor(size: T) {
    this.n = randBytesSync(size)
  }

  public getBytes(): Uint8Array {
    return this.n
  }

  public static getBytes(size: number): Uint8Array {
    return randBytesSync(size)
  }
}


export const randomBigInt = (max: bigint, min?: bigint): bigint => {
  return randBetween(max, min)
}


export const randomChars = (length: number): string => {
  return randBytesSync(length).toString('hex')
}


export const randomPartyId = (): PartyId => {
  return `partyId-${randomChars(16)}`
}
