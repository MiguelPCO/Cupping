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

import {
  followUser,
  unfollowUser,
  updateProfile,
  likeEntry,
  unlikeEntry,
} from "./social";

beforeEach(() => {
  mockFrom.mockReset();
  mockGetUser.mockReset();
  mockGetUser.mockResolvedValue({ data: { user: null } });
});

describe("unauthenticated guard", () => {
  it("followUser returns 'No autenticado' and never queries the database", async () => {
    const result = await followUser("target-1");
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("unfollowUser returns 'No autenticado' and never queries the database", async () => {
    const result = await unfollowUser("target-1");
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("updateProfile returns 'No autenticado' and never queries the database", async () => {
    const result = await updateProfile({
      display_name: "Test",
      username: "testuser",
    });
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("likeEntry returns 'No autenticado' and never queries the database", async () => {
    const result = await likeEntry("entry-1");
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("unlikeEntry returns 'No autenticado' and never queries the database", async () => {
    const result = await unlikeEntry("entry-1");
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("followUser — self-follow guard", () => {
  it("rejects following yourself before touching the database", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-a" } } });
    const result = await followUser("user-a");
    expect(result).toEqual({ error: "No puedes seguirte a ti mismo" });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
