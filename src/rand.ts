import { randBytesSync } from "bigint-crypto-utils"

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

