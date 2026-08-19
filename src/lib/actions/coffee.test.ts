import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

import { createCoffeeEntry, updateCoffeeEntry, deleteCoffeeEntry } from "./coffee";

const validInput = {
  name: "Yirgacheffe",
  brand: "Stumptown",
  type: "bean" as const,
  rating_global: 4,
  flavor_tags: [] as const,
  visibility: "public" as const,
};

beforeEach(() => {
  mockFrom.mockReset();
  mockGetUser.mockReset();
  mockGetUser.mockResolvedValue({ data: { user: null } });
});

describe("createCoffeeEntry — auth guard", () => {
  it("returns 'No autenticado' and never queries the database when unauthenticated", async () => {
    const result = await createCoffeeEntry(validInput);
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("updateCoffeeEntry — auth guard", () => {
  it("returns 'No autenticado' and never queries the database when unauthenticated", async () => {
    const result = await updateCoffeeEntry("entry-1", validInput);
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("deleteCoffeeEntry — auth guard", () => {
  it("returns 'No autenticado' and never queries the database when unauthenticated", async () => {
    const result = await deleteCoffeeEntry("entry-1");
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("updateCoffeeEntry — ownership guard", () => {
  it("returns 'No autorizado' when the entry belongs to a different user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-a" } } });
    const single = vi.fn().mockResolvedValue({
      data: { id: "entry-1", user_id: "user-b" },
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await updateCoffeeEntry("entry-1", validInput);
    expect(result).toEqual({ error: "No autorizado" });
  });
});

describe("deleteCoffeeEntry — ownership guard", () => {
  it("returns 'No autorizado' when the entry belongs to a different user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-a" } } });
    const single = vi.fn().mockResolvedValue({
      data: { id: "entry-1", user_id: "user-b" },
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await deleteCoffeeEntry("entry-1");
    expect(result).toEqual({ error: "No autorizado" });
  });
});
