import { describe, expect, test } from "bun:test"
import { SEC_BYTES } from "./constants.js"
import { Secp256k1 } from "./curves"
import { Hasher } from "./hasher"

describe("Hasher", () => {
  test("should create new hasher instance", () => {
    const hasher = Hasher.create()
    expect(hasher).toBeInstanceOf(Hasher)
  })

  test("should hash bytes correctly", () => {
    const hasher = Hasher.create()
    const input = new Uint8Array([1, 2, 3])
    const digest = hasher.update(input).digestAsBytes()
    expect(digest).toBeInstanceOf(Uint8Array)
    expect(digest.length).toBeGreaterThan(0)
  })

  test("should hash bigint correctly", () => {
    const hasher = Hasher.create()
    const input = 123456789n
    const digest = hasher.update(input).digestAsBigInt()
    expect(typeof digest).toBe("bigint")
  })

  test("should hash projective point correctly", () => {
    const hasher = Hasher.create()
    const point = Secp256k1.BASE
    const digest = hasher.update(point).digestAsBytes()
    expect(digest).toBeInstanceOf(Uint8Array)
  })

  test("should hash affine point correctly", () => {
    const hasher = Hasher.create()
    const point = Secp256k1.BASE.toAffine()
    const digest = hasher.update(point).digestAsBytes()
    expect(digest).toBeInstanceOf(Uint8Array)
  })

  test("should hash multiple inputs correctly", () => {
    const hasher = Hasher.create()
    const inputs = [new Uint8Array([1, 2, 3]), 123456789n, "test"]
    const digest = hasher.updateMulti(inputs).digestAsBytes()
    expect(digest).toBeInstanceOf(Uint8Array)
  })

  test("should throw error when used twice", () => {
    const hasher = Hasher.create()
    hasher.digestAsBytes()
    expect(() => hasher.update(new Uint8Array([1]))).toThrow("Hasher already used")
  })

  test("should clone hasher correctly", () => {
    const hasher = Hasher.create()
    hasher.update(new Uint8Array([1, 2, 3]))
    const clone = hasher.clone()
    expect(clone).toBeInstanceOf(Hasher)
    expect(clone.digestAsBytes()).toEqual(hasher.digestAsBytes())
  })

  describe("commitment scheme", () => {
    test("should create valid commitment", () => {
      const hasher = Hasher.create()
      const data = [new Uint8Array([1, 2, 3]), "test"]
      const { commitment, decommitment } = hasher.commit(data)
      
      expect(commitment.length).toBe(SEC_BYTES)
      expect(decommitment.length).toBe(SEC_BYTES)
    })

    test("should verify valid commitment", () => {
      const hasher = Hasher.create()
      const data = [new Uint8Array([1, 2, 3]), "test"]
      const { commitment, decommitment } = hasher.commit(data)
      
      const isValid = hasher.decommit(commitment, decommitment, data)
      expect(isValid).toBe(true)
    })

    test("should reject invalid commitment data", () => {
      const hasher = Hasher.create()
      const data = [new Uint8Array([1, 2, 3]), "test"]
      const { commitment, decommitment } = hasher.commit(data)
      
      const wrongData = [new Uint8Array([1, 2, 4]), "test"]
      const isValid = hasher.decommit(commitment, decommitment, wrongData)
      expect(isValid).toBe(false)
    })

    test("should reject zero commitment", () => {
      const zeroCommitment = new Uint8Array(SEC_BYTES)
      expect(() => Hasher.validateCommitment(zeroCommitment)).toThrow("Hasher commitment is 0")
    })

    test("should reject invalid commitment length", () => {
      const invalidCommitment = new Uint8Array(SEC_BYTES - 1)
      expect(() => Hasher.validateCommitment(invalidCommitment))
        .toThrow(`Hasher commitment length is not equal to ${SEC_BYTES}`)
    })

    test("should reject zero decommitment", () => {
      const zeroDecommitment = new Uint8Array(SEC_BYTES)
      expect(() => Hasher.validateDecommitment(zeroDecommitment)).toThrow("Hasher decommitment is 0")
    })

    test("should reject invalid decommitment length", () => {
      const invalidDecommitment = new Uint8Array(SEC_BYTES - 1)
      expect(() => Hasher.validateDecommitment(invalidDecommitment))
        .toThrow(`Hasher commitment length is not equal to ${SEC_BYTES}`)
    })

    test("should reject decommitment with invalid commitment", () => {
      const hasher = Hasher.create()
      const data = [new Uint8Array([1, 2, 3])]
      const { decommitment } = hasher.commit(data)
      const invalidCommitment = new Uint8Array(SEC_BYTES).fill(1)
      
      const isValid = hasher.decommit(invalidCommitment, decommitment, data)
      expect(isValid).toBe(false)
    })
  })

  test("should throw error for invalid input type", () => {
    const hasher = Hasher.create()
    expect(() => hasher.update({} as any)).toThrow("Hash input data type invalid: object")
  })

  test("should hash object with getHashableInputs correctly", () => {
    const hasher = Hasher.create()
    const obj = {
      getHashableInputs: (): (Uint8Array | string)[] => [new Uint8Array([1, 2, 3]), "test"]
    }
    const digest = hasher.update(obj).digestAsBytes()
    expect(digest).toBeInstanceOf(Uint8Array)
  })
})
