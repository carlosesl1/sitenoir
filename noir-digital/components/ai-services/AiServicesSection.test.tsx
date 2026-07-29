import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AiServicesSection } from "@/components/ai-services/AiServicesSection";
import { aiServices } from "@/data/ai-services";

afterEach(cleanup);

describe("AiServicesSection", () => {
  it("renders the approved content and closed marker state", () => {
    render(<AiServicesSection />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "IA para transformar operação em vantagem real",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Falar com especialista/i })).toHaveAttribute(
      "href",
      "mailto:contato@noirdigital.com.br",
    );

    for (const service of aiServices) {
      expect(screen.getByRole("button", { name: service.label })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    }

    expect(screen.queryByTestId("ai-service-detail")).not.toBeInTheDocument();
  });

  it("opens, switches, and closes one service at a time", () => {
    render(<AiServicesSection />);
    const first = screen.getByRole("button", { name: aiServices[0].label });
    const second = screen.getByRole("button", { name: aiServices[1].label });

    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("ai-service-detail")).toHaveTextContent(aiServices[0].description);

    fireEvent.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("ai-service-detail")).toHaveTextContent(aiServices[1].description);

    fireEvent.click(second);
    expect(screen.queryByTestId("ai-service-detail")).not.toBeInTheDocument();
  });

  it("closes with Escape and restores marker focus", () => {
    render(<AiServicesSection />);
    const marker = screen.getByRole("button", { name: aiServices[0].label });

    fireEvent.click(marker);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByTestId("ai-service-detail")).not.toBeInTheDocument();
    expect(marker).toHaveFocus();
  });

  it("closes when the pointer presses outside the active disclosure", () => {
    render(<AiServicesSection />);

    fireEvent.click(screen.getByRole("button", { name: aiServices[0].label }));
    fireEvent.pointerDown(screen.getByRole("heading", { level: 2 }));

    expect(screen.queryByTestId("ai-service-detail")).not.toBeInTheDocument();
  });

  it("keeps the wave decorative and external", () => {
    const view = render(<AiServicesSection />);
    const image = view.container.querySelector('img[alt=""]');
    const mobileSource = view.container.querySelector('source[media="(max-width: 767px)"]');

    expect(image).toHaveAttribute("src", "/assets/v1/ai-services/ascii-wave-desktop.svg");
    expect(image).toHaveAttribute("loading", "lazy");
    expect(mobileSource).toHaveAttribute(
      "srcset",
      "/assets/v1/ai-services/ascii-wave-mobile.svg",
    );
    expect(view.container.querySelector("svg")).not.toBeInTheDocument();
    expect(view.container.querySelector("canvas")).not.toBeInTheDocument();
  });
});
