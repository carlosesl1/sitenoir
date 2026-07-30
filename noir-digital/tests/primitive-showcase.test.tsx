import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NoirControl } from "@/components/primitives/NoirControl";
import { PrimitiveShowcase } from "@/components/showcase/PrimitiveShowcase";

describe("PrimitiveShowcase", () => {
  it("renders the semantic foundation contract", () => {
    // Given the project-root primitive showcase.

    // When the showcase renders.
    render(<PrimitiveShowcase />);

    // Then the brand, controls, disabled state, and both theme surfaces are discoverable.
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("main")).toHaveAttribute("lang", "en");
    expect(screen.getByRole("link", { name: "NOIR DIGITAL home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Start a project" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "View work" })).toHaveAttribute("href", "#work");
    expect(screen.getByRole("button", { name: "Unavailable action" })).toBeDisabled();
    expect(screen.getByRole("region", { name: "Dark surface" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Light surface" })).toBeInTheDocument();
  });
});

describe("NoirControl", () => {
  it("forwards button events and accessible attributes", () => {
    // Given a native button control with an accessible label and event handler.
    let activationCount = 0;
    render(
      <NoirControl
        kind="button"
        aria-label="Open project brief"
        aria-pressed="false"
        onClick={() => {
          activationCount += 1;
        }}
      >
        Open brief
      </NoirControl>,
    );

    // When a user activates the native button.
    fireEvent.click(screen.getByRole("button", { name: "Open project brief" }));

    // Then the event fires and the ARIA state reaches the rendered element.
    expect(activationCount).toBe(1);
    expect(screen.getByRole("button", { name: "Open project brief" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("forwards link target and relationship attributes", () => {
    // Given a link-form control with a safe new-tab relationship.
    render(
      <NoirControl kind="link" href="/project-brief" target="_blank" rel="noopener noreferrer">
        Project brief
      </NoirControl>,
    );

    // When the semantic link is queried.
    const link = screen.getByRole("link", { name: "Project brief" });

    // Then its native navigation attributes are preserved.
    expect(link).toHaveAttribute("href", "/project-brief");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
