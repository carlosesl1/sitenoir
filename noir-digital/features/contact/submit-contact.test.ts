import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ContactSubmissionError,
  type ContactSubmissionPayload,
  submitContact,
} from "@/features/contact/submit-contact";

const payload: ContactSubmissionPayload = {
  firstName: "Ana",
  lastName: "Silva",
  email: "ana@empresa.com",
  company: "Empresa",
  phone: "(77) 99845-3006",
  service: "Sites",
  message: "Quero conversar sobre um novo projeto.",
  website: "",
  pageUrl: "https://noirdigital.com.br/contato/",
  source: "Formulário de contato",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("submitContact", () => {
  it("posts the complete JSON contract to the production endpoint by default", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse({ ok: true, leadId: 123, message: "Mensagem recebida com sucesso." }),
      );

    const result = await submitContact(payload, { fetchImpl });

    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://noirdigital.com.br/wp-json/noir/v1/contact",
      expect.objectContaining({
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }),
    );
    expect(result).toEqual({
      ok: true,
      leadId: 123,
      message: "Mensagem recebida com sucesso.",
    });
  });

  it("uses the public environment endpoint without exposing any mail credential", async () => {
    vi.stubEnv("NEXT_PUBLIC_CONTACT_ENDPOINT", "https://wp.noir.test/wp-json/noir/v1/contact");
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ ok: true, message: "Recebido." }));

    await submitContact(payload, { fetchImpl });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://wp.noir.test/wp-json/noir/v1/contact",
      expect.any(Object),
    );
    expect(JSON.stringify(fetchImpl.mock.calls)).not.toContain("SMTP");
    expect(JSON.stringify(fetchImpl.mock.calls)).not.toContain("password");
  });

  it.each([
    [400, undefined, "Confira os campos informados."],
    [429, undefined, "Muitas tentativas em pouco tempo. Tente novamente mais tarde."],
    [500, 123, "A mensagem foi registrada, mas a notificação por e-mail não foi enviada."],
    [503, undefined, "Não foi possível enviar agora. Tente novamente em instantes."],
  ])("maps HTTP %i to a safe user-facing error", async (status, leadId, expectedMessage) => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse(
        {
          ok: false,
          ...(leadId === undefined ? {} : { leadId }),
          message: "Internal server detail that must not be rendered.",
        },
        status,
      ),
    );

    const promise = submitContact(payload, { fetchImpl });

    await expect(promise).rejects.toMatchObject({
      name: "ContactSubmissionError",
      status,
      ...(leadId === undefined ? {} : { leadId }),
      message: expectedMessage,
    });
  });

  it("rejects redirects and HTML responses as an endpoint configuration failure", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("<html>login</html>", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }),
    );

    await expect(submitContact(payload, { fetchImpl })).rejects.toEqual(
      new ContactSubmissionError(
        "O servidor de contato respondeu de forma inesperada. Tente novamente mais tarde.",
        502,
      ),
    );
  });

  it("rejects malformed JSON without exposing the parser error", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("{not-json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(submitContact(payload, { fetchImpl })).rejects.toMatchObject({
      status: 502,
      message: "O servidor de contato respondeu de forma inesperada. Tente novamente mais tarde.",
    });
  });

  it("converts network failures to a friendly error", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new Error("ECONNRESET secret"));

    await expect(submitContact(payload, { fetchImpl })).rejects.toMatchObject({
      status: 0,
      message: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
    });
  });
});
