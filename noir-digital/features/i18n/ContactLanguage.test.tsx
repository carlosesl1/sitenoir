import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContactPage } from "@/components/contact/ContactPage";
import { LanguageButton } from "@/components/controls/LanguageButton";
import { ContactSubmissionError } from "@/features/contact/submit-contact";
import { LanguageProvider } from "./LanguageProvider";

const mocks = vi.hoisted(() => ({ submitContact: vi.fn() }));
vi.mock("@/features/contact/submit-contact", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/contact/submit-contact")>()),
  submitContact: mocks.submitContact,
}));

beforeEach(() => {
  window.localStorage.clear();
  vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["pt-BR"]);
  mocks.submitContact.mockReset();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.history.replaceState({}, "", "/");
});

describe("translated contact flow", () => {
  it("keeps entered text and service identifiers when switching languages", async () => {
    window.history.replaceState(
      {},
      "",
      "/contato?service=Sites%20e%20experi%C3%AAncias%20digitais",
    );
    render(
      <LanguageProvider>
        <LanguageButton />
        <ContactPage />
      </LanguageProvider>,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Nome" }), { target: { value: "Ana" } });
    fireEvent.click(screen.getByRole("button", { name: "Switch to English" }));
    expect(screen.getByRole("textbox", { name: "First name" })).toHaveValue("Ana");
    expect(screen.getByRole("combobox", { name: "Service of interest" })).toHaveValue(
      "Sites e experiências digitais",
    );
    expect(
      screen.getByRole("option", { name: "Websites and digital experiences" }),
    ).toBeInTheDocument();
    expect(
      new URL(
        screen.getAllByRole("link", { name: "Start a WhatsApp chat" })[0]?.getAttribute("href") ??
          "",
      ).searchParams.get("text"),
    ).toMatch(/^Hello!/);
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Message" }), {
      target: { value: "Please help with my website." },
    });

    mocks.submitContact.mockRejectedValueOnce(
      new ContactSubmissionError("Confira os campos informados.", 400),
    );
    fireEvent.submit(screen.getByRole("form", { name: "Project details" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please check the information you entered.",
    );
    expect(screen.getByRole("textbox", { name: "First name" })).toHaveValue("Ana");

    mocks.submitContact.mockResolvedValueOnce({
      ok: true,
      message: "Mensagem recebida com sucesso.",
    });
    fireEvent.submit(screen.getByRole("form", { name: "Project details" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Message sent successfully.");
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "First name" })).toHaveValue(""),
    );
    expect(mocks.submitContact).toHaveBeenLastCalledWith(
      expect.objectContaining({
        service: "Sites e experiências digitais",
        message: "Please help with my website.",
      }),
    );
  });
});
