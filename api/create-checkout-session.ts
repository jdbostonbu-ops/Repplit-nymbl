export const config = {
  runtime: "edge",
};

type PlanKey = "kickstart" | "cruise" | "throttle";

type CheckoutResponse = {
  url?: string | null;
  error?: string;
};

type StripeCheckoutSessionResponse = {
  url?: string | null;
  error?: {
    message?: string;
  };
};

const planNames: Record<PlanKey, string> = {
  kickstart: "Kickstart",
  cruise: "Cruise Control",
  throttle: "Full Throttle",
};

const stripePrices: Record<PlanKey, string | undefined> = {
  kickstart: process.env.STRIPE_PRICE_KICKSTART,
  cruise: process.env.STRIPE_PRICE_CRUISE,
  throttle: process.env.STRIPE_PRICE_THROTTLE,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlanKey(value: unknown): value is PlanKey {
  return value === "kickstart" || value === "cruise" || value === "throttle";
}

function createJsonResponse(body: CheckoutResponse, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getOrigin(request: Request): string {
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");

  if (!host) {
    return new URL(request.url).origin;
  }

  return `${forwardedProto.split(",")[0]}://${host.split(",")[0]}`;
}

function getStringField(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  return typeof value === "string" ? value : "";
}

function getStripeErrorMessage(body: unknown): string {
  if (!isRecord(body) || !isRecord(body.error)) {
    return "Unable to create Stripe Checkout Session";
  }

  return getStringField(body.error, "message") || "Unable to create Stripe Checkout Session";
}

async function createStripeCheckoutSession(
  stripeSecretKey: string,
  plan: PlanKey,
  priceId: string,
  origin: string,
): Promise<CheckoutResponse> {
  const sessionParams = new URLSearchParams();
  sessionParams.set("mode", "subscription");
  sessionParams.set("line_items[0][price]", priceId);
  sessionParams.set("line_items[0][quantity]", "1");
  sessionParams.set("success_url", `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
  sessionParams.set("cancel_url", `${origin}/checkout?plan=${encodeURIComponent(plan)}&canceled=1`);
  sessionParams.set("metadata[plan]", plan);
  sessionParams.set("metadata[plan_name]", planNames[plan]);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: sessionParams.toString(),
  });

  const result: unknown = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return { error: getStripeErrorMessage(result) };
  }

  if (!isRecord(result)) {
    return { error: "Stripe did not return a Checkout Session" };
  }

  const session = result as StripeCheckoutSessionResponse;

  return { url: session.url ?? null };
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return createJsonResponse({ error: "Method not allowed" }, 405);
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return createJsonResponse({ error: "Missing STRIPE_SECRET_KEY" }, 500);
  }

  try {
    const body: unknown = await request.json();
    const plan = isRecord(body) ? body.plan : undefined;

    if (!isPlanKey(plan)) {
      return createJsonResponse({ error: "Unknown Stripe plan" }, 400);
    }

    const priceId = stripePrices[plan];

    if (!priceId) {
      return createJsonResponse({ error: `Missing Stripe price env value for ${plan}` }, 500);
    }

    const origin = getOrigin(request);
    const session = await createStripeCheckoutSession(stripeSecretKey, plan, priceId, origin);

    if (session.error || !session.url) {
      return createJsonResponse({ error: session.error ?? "Stripe did not return a Checkout URL" }, 502);
    }

    return createJsonResponse(session, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Stripe Checkout Session";
    return createJsonResponse({ error: message }, 500);
  }
}
