import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import GlassTestPage, { metadata } from "@/app/glass-test/page";

describe("glass test route", () => {
  it("is excluded from indexing", () => {
    expect(metadata).toMatchObject({ robots: { follow: false, index: false } });
  });

  it("renders the current and Canvas UI home targets", () => {
    render(<GlassTestPage />);
    expect(screen.getByTitle("NOIR atual")).toHaveAttribute("src", "/?effects=full");
    expect(screen.getByTitle("NOIR Canvas UI")).toHaveAttribute(
      "src",
      "/?effects=full&glass=canvas-ui",
    );
    expect(screen.getByText("ATUAL")).toBeInTheDocument();
    expect(screen.getByText("CANVAS UI")).toBeInTheDocument();
  });
});
