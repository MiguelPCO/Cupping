import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoffeeForm } from "./coffee-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/hooks", () => ({
  useCreateCoffeeEntry: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateCoffeeEntry: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCurrentUser: () => ({ data: null }),
}));

describe("CoffeeForm step gating", () => {
  it("starts on step 1 of 5", () => {
    render(<CoffeeForm />);
    expect(screen.getByText("Paso 1 de 5")).toBeInTheDocument();
  });

  it("blocks advancing past step 1 when name/brand are empty", async () => {
    const user = userEvent.setup();
    render(<CoffeeForm />);
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByText("Paso 1 de 5")).toBeInTheDocument();
    expect(await screen.findByText("Mínimo 2 caracteres")).toBeInTheDocument();
  });

  it("advances to step 2 once name/brand/type are valid", async () => {
    const user = userEvent.setup();
    render(<CoffeeForm />);
    await user.type(screen.getByLabelText("Nombre del café *"), "Yirgacheffe");
    await user.type(screen.getByLabelText("Marca *"), "Stumptown");
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByText("Paso 2 de 5")).toBeInTheDocument();
  });

  it("starts on step 2 when a coffee is preselected", () => {
    render(
      <CoffeeForm
        preselectedCoffee={{
          id: "c1",
          name: "Yirgacheffe",
          brand: "Stumptown",
          type: "bean",
          origin: null,
          roast_level: null,
          image_url: null,
          avg_rating: 4,
          total_reviews: 1,
          created_by: "user-1",
          created_at: new Date().toISOString(),
        }}
      />
    );
    expect(screen.getByText("Paso 2 de 5")).toBeInTheDocument();
  });

  it("goes back a step on Atrás", async () => {
    const user = userEvent.setup();
    render(<CoffeeForm />);
    await user.type(screen.getByLabelText("Nombre del café *"), "Yirgacheffe");
    await user.type(screen.getByLabelText("Marca *"), "Stumptown");
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByText("Paso 2 de 5")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Atrás" }));
    expect(screen.getByText("Paso 1 de 5")).toBeInTheDocument();
  });
});
