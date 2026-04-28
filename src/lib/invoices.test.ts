import { describe, expect, it } from "vitest";
import { buildSequenceCode } from "./invoices";

describe("buildSequenceCode", () => {
  it("formats invoice-style sequence codes", () => {
    expect(buildSequenceCode("SE", 2026, 7)).toBe("SE-2026-0007");
  });
});
