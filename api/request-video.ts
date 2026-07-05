export const config = {
  runtime: "edge",
};

type JsonResponse = {
  error?: string;
  ok?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringField(body: unknown, key: string): string {
  if (!isRecord(body)) {
    return "";
  }

  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function createJsonResponse(body: JsonResponse, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function buildWebhookPayload(body: unknown): Record<string, string> {
  const submittedAt = new Date().toISOString();

  return {
    Date: submittedAt.slice(0, 10),
    Name: getStringField(body, "contactName"),
    Email: getStringField(body, "email"),
    Phone: getStringField(body, "phone"),
    Business: getStringField(body, "business"),
    Promoting: getStringField(body, "promotion"),
    Vibe: getStringField(body, "vibe"),
    Presenter: getStringField(body, "presenterStyle"),
    Script: getStringField(body, "script"),
    date: submittedAt.slice(0, 10),
    requestDate: submittedAt.slice(0, 10),
    submittedAt,
    contactName: getStringField(body, "contactName"),
    business: getStringField(body, "business"),
    email: getStringField(body, "email"),
    phone: getStringField(body, "phone"),
    promotion: getStringField(body, "promotion"),
    vibe: getStringField(body, "vibe"),
    presenterStyle: getStringField(body, "presenterStyle"),
    sellingPoint: getStringField(body, "sellingPoint"),
    script: getStringField(body, "script"),
    generatedScript: getStringField(body, "script"),
    scriptGeneratedByAi: getStringField(body, "script"),
    script_generated_by_ai: getStringField(body, "script"),
    source: "nymbl-generate-my-video",
  };
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return createJsonResponse({ error: "Method not allowed" }, 405);
  }

  const webhookUrl = process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    return createJsonResponse({ error: "Missing NEXT_PUBLIC_ZAPIER_WEBHOOK_URL" }, 500);
  }

  try {
    const body: unknown = await request.json();
    const payload = buildWebhookPayload(body);

    if (!payload.email || !payload.script) {
      return createJsonResponse({ error: "Missing video request fields" }, 400);
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      return createJsonResponse({ error: "Video request webhook failed" }, 502);
    }

    return createJsonResponse({ ok: true }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit video request";
    return createJsonResponse({ error: message }, 500);
  }
}
