import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RatingCups } from "./rating-cups";

describe("RatingCups", () => {
  it("renders the current value in the accessible label", () => {
    render(<RatingCups value={3.5} max={5} />);
    expect(
      screen.getByRole("slider", { name: "Rating: 3.5 de 5 tazas" })
    ).toBeInTheDocument();
  });

  it("increases by 0.5 on ArrowRight", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RatingCups value={3} max={5} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(3.5);
  });

  it("decreases by 0.5 on ArrowLeft, floored at 0.5", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RatingCups value={0.5} max={5} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith(0.5);
  });

  it("jumps to max on End", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RatingCups value={2} max={5} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("jumps to 0.5 on Home", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RatingCups value={4} max={5} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenCalledWith(0.5);
  });

  it("does not call onChange when readOnly", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RatingCups value={3} max={5} readOnly onChange={onChange} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("tabIndex", "-1");
    slider.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).not.toHaveBeenCalled();
  });
});
