import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ContactRoute, { metadata } from "@/app/contato/page";

vi.mock("@/scene/LazySiteCanvas", () => ({
  LazySiteCanvas: () => null,
}));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(cleanup);

describe("contact route", () => {
  it("publishes dedicated metadata and canonical URL", () => {
    expect(metadata).toMatchObject({
      title: "Contato | NOIR DIGITAL",
      alternates: { canonical: "/contato" },
    });
  });

  it("renders the shared shell, contact form, and home visual background", () => {
    render(<ContactRoute />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toContainElement(
      screen.getByRole("form", { name: "Dados do projeto" }),
    );

    const source = readFileSync(join(process.cwd(), "app/contato/page.tsx"), "utf8");
    expect(source).toContain("<LazySiteCanvas ambientOnly />");
  });
});
