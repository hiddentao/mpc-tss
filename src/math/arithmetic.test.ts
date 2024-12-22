import { describe, expect, test } from "bun:test";
import { checkScalarsRangeAndCoprime, modSymmetric } from "./arithmetic";

describe("arithmetic", () => {
  describe("modSymmetric", () => {
    test("should return smallest absolute value for positive numbers", () => {
      expect(modSymmetric(10n, 7n)).toBe(3n);
      expect(modSymmetric(15n, 7n)).toBe(1n);
    });

    test("should return smallest absolute value for negative numbers", () => {
      expect(modSymmetric(-10n, 7n)).toBe(-3n);
      expect(modSymmetric(-15n, 7n)).toBe(-1n);
    });

    test("should handle zero", () => {
      expect(modSymmetric(0n, 7n)).toBe(0n);
    });

    test("should handle large numbers", () => {
      expect(modSymmetric(1000n, 17n)).toBe(-3n);
      expect(modSymmetric(-1000n, 17n)).toBe(3n);
    });
  });

  describe("checkScalarsRangeAndCoprime", () => {
    test("should return true for valid coprime numbers in range", () => {
      expect(checkScalarsRangeAndCoprime(10n, 3n, 7n)).toBe(true);
      expect(checkScalarsRangeAndCoprime(15n, 2n, 4n, 7n)).toBe(true);
    });

    test("should return false for numbers outside range", () => {
      expect(checkScalarsRangeAndCoprime(10n, 0n)).toBe(false);
      expect(checkScalarsRangeAndCoprime(10n, 10n)).toBe(false);
      expect(checkScalarsRangeAndCoprime(10n, -1n)).toBe(false);
    });

    test("should return false for non-coprime numbers", () => {
      expect(checkScalarsRangeAndCoprime(10n, 2n, 5n)).toBe(false);
      expect(checkScalarsRangeAndCoprime(15n, 3n)).toBe(false);
    });
  });
}); 