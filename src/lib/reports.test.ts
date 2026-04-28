import { describe, expect, it } from "vitest";
import { calculatePendingForStudent, sumAmounts } from "./reports";

describe("calculatePendingForStudent", () => {
  it("calculates pending fees from standard fee and received payments", () => {
    const pending = calculatePendingForStudent({
      id: "1",
      fullName: "Test Student",
      studentCode: "S1",
      customFeeAmount: null,
      standard: { name: "Standard 10", feeStructures: [{ amount: 1800 }] },
      payments: [{ amountReceived: 1000, expectedAmount: 1800, feePeriod: "April 2026" }],
    });
    expect(pending).toBe(800);
  });

  it("does not return negative pending amount", () => {
    const pending = calculatePendingForStudent({
      id: "1",
      fullName: "Test Student",
      studentCode: "S1",
      customFeeAmount: 1000,
      standard: { name: "Standard 10", feeStructures: [{ amount: 1800 }] },
      payments: [{ amountReceived: 1500, expectedAmount: 1000, feePeriod: "April 2026" }],
    });
    expect(pending).toBe(0);
  });
});

describe("sumAmounts", () => {
  it("sums selected values", () => {
    expect(sumAmounts([{ amount: 1 }, { amount: 2 }], (item) => item.amount)).toBe(3);
  });
});
