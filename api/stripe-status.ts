export const config = {
  runtime: "edge",
};

type StripeStatusResponse = {
  configured: boolean;
  mode: "test" | "live" | "unknown";
  prices: Record<"kickstart" | "cruise" | "throttle", boolean>;
};

function createJsonResponse(body: StripeStatusResponse | { error: string }, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return createJsonResponse({ error: "Method not allowed" }, 405);
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const prices = {
    kickstart: Boolean(process.env.STRIPE_PRICE_KICKSTART),
    cruise: Boolean(process.env.STRIPE_PRICE_CRUISE),
    throttle: Boolean(process.env.STRIPE_PRICE_THROTTLE),
  };

  const mode = stripeSecretKey?.startsWith("sk_test_")
    ? "test"
    : stripeSecretKey?.startsWith("sk_live_")
      ? "live"
      : "unknown";

  return createJsonResponse(
    {
      configured: Boolean(stripeSecretKey && Object.values(prices).every(Boolean)),
      mode,
      prices,
    },
    200,
  );
}
