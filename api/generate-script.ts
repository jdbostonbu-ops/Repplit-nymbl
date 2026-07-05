export const config = {
  runtime: "edge",
};

type ScriptRequest = {
  promotion: string;
  vibe: string;
  presenterStyle: string;
  sellingPoint: string;
};

type JsonResponse = {
  script?: string;
  error?: string;
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

function getOpenAiErrorMessage(body: unknown): string {
  if (!isRecord(body) || !isRecord(body.error)) {
    return "OpenAI script generation failed";
  }

  const message = body.error.message;
  return typeof message === "string" ? message : "OpenAI script generation failed";
}

function createJsonResponse(body: JsonResponse, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function buildScriptRequest(body: unknown): ScriptRequest {
  return {
    promotion: getStringField(body, "promotion"),
    vibe: getStringField(body, "vibe"),
    presenterStyle: getStringField(body, "presenterStyle"),
    sellingPoint: getStringField(body, "sellingPoint"),
  };
}

function createOpenAiPrompt(requestBody: ScriptRequest): string {
  return [
    `Promotion: ${requestBody.promotion}`,
    `Vibe: ${requestBody.vibe}`,
    `Presenter style: ${requestBody.presenterStyle}`,
    `Key selling point: ${requestBody.sellingPoint}`,
    "Write a polished 60-second social video script.",
  ].join("\n");
}

function getContentText(contentItem: unknown): string {
  if (!isRecord(contentItem)) {
    return "";
  }

  const text = contentItem.text;

  if (typeof text === "string") {
    return text;
  }

  if (isRecord(text)) {
    return getStringField(text, "value");
  }

  return "";
}

function extractOpenAiScript(result: unknown): string {
  const outputText = getStringField(result, "output_text");

  if (outputText) {
    return outputText;
  }

  if (!isRecord(result) || !Array.isArray(result.output)) {
    return "";
  }

  const textParts: string[] = [];

  for (const outputItem of result.output) {
    if (!isRecord(outputItem) || !Array.isArray(outputItem.content)) {
      continue;
    }

    for (const contentItem of outputItem.content) {
      const text = getContentText(contentItem);

      if (text) {
        textParts.push(text);
      }
    }
  }

  return textParts.join("\n\n").trim();
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return createJsonResponse({ error: "Method not allowed" }, 405);
  }

  const openAiApiKey = process.env.OPENAI_API_KEY;
  const openAiModel = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!openAiApiKey) {
    return createJsonResponse({ error: "Missing OPENAI_API_KEY" }, 500);
  }

  try {
    const body = await request.json();
    const scriptRequest = buildScriptRequest(body);

    if (
      !scriptRequest.promotion ||
      !scriptRequest.vibe ||
      !scriptRequest.presenterStyle ||
      !scriptRequest.sellingPoint
    ) {
      return createJsonResponse({ error: "Missing script inputs" }, 400);
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openAiModel,
        max_output_tokens: 650,
        instructions: [
          "You write concise, high-converting short-form social video scripts for local service businesses.",
          "Return only the script. Format it as 6 timestamped beats for a 60-second video.",
          "Use timestamps [0:00-0:08], [0:08-0:18], [0:18-0:30], [0:30-0:42], [0:42-0:52], [0:52-1:00].",
          "Include a hook, pain point, offer/value, proof or mechanism, urgency, and CTA.",
          "Do not mention AI, OpenAI, Zapier, automation setup, or video generation.",
        ].join(" "),
        input: [
          {
            role: "user",
            content: createOpenAiPrompt(scriptRequest),
          },
        ],
      }),
    });

    const result: unknown = await openAiResponse.json();

    if (!openAiResponse.ok) {
      return createJsonResponse({ error: getOpenAiErrorMessage(result) }, openAiResponse.status);
    }

    const script = extractOpenAiScript(result);

    if (!script) {
      return createJsonResponse({ error: "OpenAI did not return a script" }, 502);
    }

    return createJsonResponse({ script }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate script";
    return createJsonResponse({ error: message }, 500);
  }
}
