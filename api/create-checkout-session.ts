import Stripe from "stripe";

type PlanKey = "kickstart" | "cruise" | "throttle";

type CheckoutResponse = {
  url?: string | null;
  error?: string;
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

    const stripe = new Stripe(stripeSecretKey);
    const origin = getOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?plan=${encodeURIComponent(plan)}&canceled=1`,
      metadata: {
        plan,
        plan_name: planNames[plan],
      },
    });

    return createJsonResponse({ url: session.url }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Stripe Checkout Session";
    return createJsonResponse({ error: message }, 500);
  }
}
