import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/glass-prism-test/PhysicalPrismTest", () => ({
  PhysicalPrismTest: () => <div data-testid="physical-prism-test" />,
}));

import GlassPrismTestPage, { metadata } from "@/app/glass-prism-test/page";

describe("glass prism test route", () => {
  it("is excluded from indexing", () => {
    expect(metadata).toMatchObject({ robots: { follow: false, index: false } });
  });

  it("renders only the isolated physical prism prototype", () => {
    render(<GlassPrismTestPage />);
    expect(screen.getByTestId("physical-prism-test")).toBeInTheDocument();
    expect(screen.queryByText("A ESTRUTURA DIGITAL")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
