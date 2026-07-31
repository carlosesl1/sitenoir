export const DEFAULT_CONTACT_ENDPOINT = "https://noirdigital.com.br/wp-json/noir/v1/contact";

export interface ContactSubmissionPayload {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly company: string;
  readonly phone: string;
  readonly service: string;
  readonly message: string;
  readonly website: string;
  readonly pageUrl: string;
  readonly source: string;
}

export interface ContactSubmissionResult {
  readonly ok: true;
  readonly leadId?: number;
  readonly message: string;
}

interface ContactSubmissionOptions {
  readonly endpoint?: string;
  readonly fetchImpl?: typeof fetch;
}

interface ContactApiResponse {
  readonly ok: boolean;
  readonly leadId?: number;
  readonly message: string;
}

const UNEXPECTED_RESPONSE_MESSAGE =
  "O servidor de contato respondeu de forma inesperada. Tente novamente mais tarde.";

export class ContactSubmissionError extends Error {
  readonly leadId: number | undefined;
  readonly status: number;

  constructor(message: string, status: number, leadId?: number) {
    super(message);
    this.name = "ContactSubmissionError";
    this.status = status;
    this.leadId = leadId;
  }
}

function resolveEndpoint(explicitEndpoint: string | undefined): string {
  const configuredEndpoint = process.env["NEXT_PUBLIC_CONTACT_ENDPOINT"]?.trim();
  return explicitEndpoint?.trim() || configuredEndpoint || DEFAULT_CONTACT_ENDPOINT;
}

function isContactApiResponse(value: unknown): value is ContactApiResponse {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;
  return (
    typeof record["ok"] === "boolean" &&
    typeof record["message"] === "string" &&
    (record["leadId"] === undefined ||
      (typeof record["leadId"] === "number" && Number.isInteger(record["leadId"])))
  );
}

function userMessageForStatus(status: number, leadId: number | undefined): string {
  if (status === 400) return "Confira os campos informados.";
  if (status === 429) {
    return "Muitas tentativas em pouco tempo. Tente novamente mais tarde.";
  }
  if (status === 500 && leadId !== undefined) {
    return "A mensagem foi registrada, mas a notificação por e-mail não foi enviada.";
  }
  return "Não foi possível enviar agora. Tente novamente em instantes.";
}

export async function submitContact(
  payload: ContactSubmissionPayload,
  options: ContactSubmissionOptions = {},
): Promise<ContactSubmissionResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  let response: Response;

  try {
    response = await fetchImpl(resolveEndpoint(options.endpoint), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "error",
    });
  } catch {
    throw new ContactSubmissionError(
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      0,
    );
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    throw new ContactSubmissionError(UNEXPECTED_RESPONSE_MESSAGE, 502);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ContactSubmissionError(UNEXPECTED_RESPONSE_MESSAGE, 502);
  }

  if (!isContactApiResponse(data)) {
    throw new ContactSubmissionError(UNEXPECTED_RESPONSE_MESSAGE, 502);
  }

  if (!response.ok || !data.ok) {
    throw new ContactSubmissionError(
      userMessageForStatus(response.status, data.leadId),
      response.status,
      data.leadId,
    );
  }

  return data.leadId === undefined
    ? { ok: true, message: data.message }
    : { ok: true, leadId: data.leadId, message: data.message };
}
