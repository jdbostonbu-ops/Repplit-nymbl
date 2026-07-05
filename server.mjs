import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);

    if (!match || process.env[match[1]] !== undefined) {
      continue;
    }

    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

loadEnvFile();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const stripePrices = {
  kickstart: process.env.STRIPE_PRICE_KICKSTART,
  cruise: process.env.STRIPE_PRICE_CRUISE,
  throttle: process.env.STRIPE_PRICE_THROTTLE,
};

const planNames = {
  kickstart: "Kickstart",
  cruise: "Cruise Control",
  throttle: "Full Throttle",
};

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlanKey(value) {
  return value === "kickstart" || value === "cruise" || value === "throttle";
}

function getStringField(body, key) {
  if (!isObject(body)) {
    return "";
  }

  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function getOpenAiErrorMessage(body) {
  if (!isObject(body) || !isObject(body.error)) {
    return "OpenAI script generation failed";
  }

  return getStringField(body.error, "message") || "OpenAI script generation failed";
}

function getContentText(contentItem) {
  if (!isObject(contentItem)) {
    return "";
  }

  const text = contentItem.text;

  if (typeof text === "string") {
    return text;
  }

  if (isObject(text)) {
    return getStringField(text, "value");
  }

  return "";
}

function extractOpenAiScript(result) {
  const outputText = getStringField(result, "output_text");

  if (outputText) {
    return outputText;
  }

  if (!isObject(result) || !Array.isArray(result.output)) {
    return "";
  }

  const textParts = [];

  for (const outputItem of result.output) {
    if (!isObject(outputItem) || !Array.isArray(outputItem.content)) {
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

const basePath = (process.env.BASE_PATH ?? "/").replace(/\/$/, "") || "";
const port = Number(process.env.PORT ?? "5173");

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });

    req.on("error", reject);
  });
}

function getOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] ?? "http";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  return `${proto.toString().split(",")[0]}://${host}`;
}

async function handleApi(req, res) {
  if (req.url === "/api/stripe-status" && req.method === "GET") {
    sendJson(res, 200, {
      configured: Boolean(stripe && Object.values(stripePrices).every(Boolean)),
      mode: stripeSecretKey?.startsWith("sk_test_") ? "test" : "unknown",
      prices: Object.fromEntries(
        Object.entries(stripePrices).map(([key, value]) => [key, Boolean(value)]),
      ),
    });
    return true;
  }

  if (req.url === "/api/generate-script" && req.method === "POST") {
    if (!openAiApiKey) {
      sendJson(res, 500, { error: "Missing OPENAI_API_KEY" });
      return true;
    }

    try {
      const body = await readJsonBody(req);
      const promotion = getStringField(body, "promotion");
      const vibe = getStringField(body, "vibe");
      const presenterStyle = getStringField(body, "presenterStyle");
      const sellingPoint = getStringField(body, "sellingPoint");

      if (!promotion || !vibe || !presenterStyle || !sellingPoint) {
        sendJson(res, 400, { error: "Missing script inputs" });
        return true;
      }

      const response = await fetch("https://api.openai.com/v1/responses", {
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
              content: [
                `Promotion: ${promotion}`,
                `Vibe: ${vibe}`,
                `Presenter style: ${presenterStyle}`,
                `Key selling point: ${sellingPoint}`,
                "Write a polished 60-second social video script.",
              ].join("\n"),
            },
          ],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        sendJson(res, response.status, {
          error: getOpenAiErrorMessage(result),
        });
        return true;
      }

      const script = extractOpenAiScript(result);

      if (!script) {
        sendJson(res, 502, { error: "OpenAI did not return a script" });
        return true;
      }

      sendJson(res, 200, {
        script,
      });
    } catch (error) {
      console.error("OpenAI script generation error:", error);
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : "Unable to generate script",
      });
    }

    return true;
  }

  if (req.url !== "/api/create-checkout-session" || req.method !== "POST") {
    return false;
  }

  if (!stripe) {
    sendJson(res, 500, { error: "Missing STRIPE_SECRET_KEY" });
    return true;
  }

  try {
    const body = await readJsonBody(req);
    const plan = isObject(body) ? body.plan : undefined;

    if (!isPlanKey(plan)) {
      sendJson(res, 400, { error: "Unknown Stripe plan" });
      return true;
    }

    const priceId = stripePrices[plan];

    if (!priceId) {
      sendJson(res, 400, { error: "Unconfigured Stripe price for this plan" });
      return true;
    }

    const origin = getOrigin(req);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}${basePath}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${basePath}/checkout?plan=${encodeURIComponent(plan)}&canceled=1`,
      metadata: {
        plan,
        plan_name: planNames[plan],
      },
    });

    sendJson(res, 200, { url: session.url });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unable to create Stripe Checkout Session",
    });
  }

  return true;
}

async function createAppHandler() {
  if (!isProduction) {
    const vite = await import("vite").then((module) =>
      module.createServer({
        server: { middlewareMode: true },
        appType: "spa",
      }),
    );

    return (req, res) => {
      vite.middlewares(req, res, () => {
        res.statusCode = 404;
        res.end("Not found");
      });
    };
  }

  const publicDir = path.join(__dirname, "dist", "public");

  return (req, res) => {
    const requestPath = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
    const relativePath = requestPath === "/" ? "index.html" : requestPath.slice(1);
    const filePath = path.join(publicDir, relativePath);
    const resolvedPath = filePath.startsWith(publicDir) && fs.existsSync(filePath)
      ? filePath
      : path.join(publicDir, "index.html");

    fs.createReadStream(resolvedPath)
      .on("error", () => {
        res.statusCode = 404;
        res.end("Not found");
      })
      .pipe(res);
  };
}

const appHandler = await createAppHandler();

const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith("/api/")) {
    const handled = await handleApi(req, res);

    if (handled) {
      return;
    }
  }

  appHandler(req, res);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
