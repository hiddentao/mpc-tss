import { describe, expect, test } from "bun:test";
import { modSymmetric } from "./mod";

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