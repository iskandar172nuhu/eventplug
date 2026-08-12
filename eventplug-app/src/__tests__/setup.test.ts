import { describe, it, expect } from "vitest"
import * as fc from "fast-check"

describe("Test infrastructure", () => {
  it("should pass a basic assertion", () => {
    expect(1 + 1).toBe(2)
  })

  it("should run fast-check property tests", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        expect(a + b).toBe(b + a)
      })
    )
  })
})
