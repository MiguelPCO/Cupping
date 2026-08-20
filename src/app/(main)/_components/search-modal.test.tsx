import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchModal } from "./search-modal";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockEntries = [
  { id: "e1", rating_global: 4.5, coffee: { name: "Yirgacheffe", brand: "Stumptown" } },
  { id: "e2", rating_global: 3.0, coffee: { name: "Kopi Luwak", brand: "Lavazza" } },
  { id: "e3", rating_global: 5.0, coffee: { name: "Yirga Blend", brand: "Blue Bottle" } },
];

vi.mock("@/lib/hooks", () => ({
  useCoffeeEntries: () => ({ data: mockEntries }),
}));

beforeEach(() => {
  mockPush.mockClear();
});

describe("SearchModal", () => {
  it("renders nothing when closed", () => {
    render(<SearchModal open={false} onClose={vi.fn()} userId="user-1" />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters results by coffee name as the user types", async () => {
    const user = userEvent.setup();
    render(<SearchModal open onClose={vi.fn()} userId="user-1" />);
    const input = screen.getByLabelText("Buscar por café o marca");
    await user.type(input, "yirga");
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByText("Yirgacheffe")).toBeInTheDocument();
    expect(screen.getByText("Yirga Blend")).toBeInTheDocument();
    expect(screen.queryByText("Kopi Luwak")).not.toBeInTheDocument();
  });

  it("filters results by brand as the user types", async () => {
    const user = userEvent.setup();
    render(<SearchModal open onClose={vi.fn()} userId="user-1" />);
    const input = screen.getByLabelText("Buscar por café o marca");
    await user.type(input, "lavazza");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByText("Kopi Luwak")).toBeInTheDocument();
  });

  it("navigates to the entry and closes on click", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SearchModal open onClose={onClose} userId="user-1" />);
    await user.click(screen.getByText("Kopi Luwak"));
    expect(mockPush).toHaveBeenCalledWith("/coffee/e2");
    expect(onClose).toHaveBeenCalled();
  });

  it("navigates to the active entry on Enter", async () => {
    const user = userEvent.setup();
    render(<SearchModal open onClose={vi.fn()} userId="user-1" />);
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect(mockPush).toHaveBeenCalledWith("/coffee/e2");
  });

  it("calls onClose on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SearchModal open onClose={onClose} userId="user-1" />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
