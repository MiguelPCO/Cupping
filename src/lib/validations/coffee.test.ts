import { describe, it, expect } from "vitest";
import { coffeeFormSchema } from "./coffee";

const validBase = {
  name: "Yirgacheffe",
  brand: "Stumptown",
  type: "bean" as const,
  rating_global: 4,
};

describe("coffeeFormSchema", () => {
  it("accepts the minimal valid payload", () => {
    const result = coffeeFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.flavor_tags).toEqual([]);
      expect(result.data.visibility).toBe("public");
    }
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = coffeeFormSchema.safeParse({ ...validBase, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing brand", () => {
    const { brand, ...rest } = validBase;
    const result = coffeeFormSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects rating_global below 0.5", () => {
    const result = coffeeFormSchema.safeParse({ ...validBase, rating_global: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects rating_global above 5", () => {
    const result = coffeeFormSchema.safeParse({ ...validBase, rating_global: 5.5 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer sub-rating", () => {
    const result = coffeeFormSchema.safeParse({ ...validBase, rating_aroma: 7.5 });
    expect(result.success).toBe(false);
  });

  it("accepts a null sub-rating", () => {
    const result = coffeeFormSchema.safeParse({ ...validBase, rating_aroma: null });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown flavor tag", () => {
    const result = coffeeFormSchema.safeParse({
      ...validBase,
      flavor_tags: ["not-a-real-tag"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown coffee type", () => {
    const result = coffeeFormSchema.safeParse({ ...validBase, type: "liquid" });
    expect(result.success).toBe(false);
  });
});
