import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, ExternalLink, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type PlanKey = "kickstart" | "cruise" | "throttle";

const plans: Record<PlanKey, {
  name: string;
  price: string;
  accent: string;
  gradient: string;
  features: string[];
}> = {
  kickstart: {
    name: "Kickstart",
    price: "$50",
    accent: "text-primary",
    gradient: "from-primary/20 via-cyan-400/10 to-transparent",
    features: ["5 Automation Services", "Basic Lead Capture", "Email Support"],
  },
  cruise: {
    name: "Cruise Control",
    price: "$150",
    accent: "text-cyan-400",
    gradient: "from-cyan-400/20 via-primary/10 to-transparent",
    features: ["10 Automation Services", "AI Video Generation (4/mo)", "Priority Slack Support"],
  },
  throttle: {
    name: "Full Throttle",
    price: "$500",
    accent: "text-pink-500",
    gradient: "from-pink-500/20 via-primary/10 to-transparent",
    features: ["20 Automation Services", "Unlimited AI Video Generation", "Dedicated Account Manager"],
  },
};

const getPlanFromUrl = (): PlanKey => {
  const plan = new URLSearchParams(window.location.search).get("plan");
  return plan === "kickstart" || plan === "cruise" || plan === "throttle" ? plan : "cruise";
};

const homeHref = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/`;

export default function Checkout() {
  const selectedPlan = useMemo(getPlanFromUrl, []);
  const plan = plans[selectedPlan];
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [stripeStatus, setStripeStatus] = useState<"checking" | "configured" | "missing">("checking");
  const isCanceled = new URLSearchParams(window.location.search).get("canceled") === "1";

  useEffect(() => {
    fetch("/api/stripe-status")
      .then((response) => response.json())
      .then((status: { configured?: boolean }) => setStripeStatus(status.configured ? "configured" : "missing"))
      .catch(() => setStripeStatus("missing"));
  }, []);

  const handleCheckout = async () => {
    setError("");
    setIsRedirecting(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const body: { url?: string; error?: string } = await response.json();

      if (!response.ok || !body.url) {
        throw new Error(body.error ?? "Stripe did not return a Checkout URL.");
      }

      window.location.assign(body.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start Stripe Checkout.");
      setIsRedirecting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[420px] h-[420px] bg-primary/40 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-20 right-1/4 w-[360px] h-[360px] bg-pink-500/40 rounded-full blur-[110px] mix-blend-screen" />
        <div className="absolute top-1/2 right-1/3 w-[360px] h-[360px] bg-cyan-400/30 rounded-full blur-[130px] mix-blend-screen" />
      </div>

      <nav className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <a href={homeHref} className="text-2xl font-bold tracking-tighter">
            NYMBL<span className="text-primary">.</span>
          </a>
          <Button
            variant="outline"
            className="h-10 px-4 rounded-none border-border font-mono text-xs uppercase tracking-widest hover:bg-white/5"
            asChild
          >
            <a href={homeHref}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </a>
          </Button>
        </div>
      </nav>

      <section className="relative z-10 px-6 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-xs font-mono text-cyan-400 mb-6 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              Stripe Test Mode
            </div>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-6">
              Checkout, but keep it <span className="bg-gradient-to-r from-cyan-400 via-primary to-pink-500 text-transparent bg-clip-text animate-gradient-xy">test mode.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-mono max-w-3xl">
              This starts a real Stripe-hosted Checkout Session in test mode. Use Stripe test card 4242 4242 4242 4242 to prove the payment flow without a live charge.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_0.85fr] gap-8 items-start">
            <section className="bg-card border border-border shadow-2xl relative overflow-hidden">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${plan.gradient}`} />
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-12 w-12 bg-white/5 border border-white/10 flex items-center justify-center">
                    <CreditCard className={`h-6 w-6 ${plan.accent}`} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Stripe Checkout</h2>
                    <p className="font-mono text-sm text-muted-foreground">Hosted by Stripe. Powered by your test secret key.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="border border-white/10 bg-white/[0.03] p-5">
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Stripe status</p>
                    <p className={`font-mono text-sm ${stripeStatus === "configured" ? "text-primary" : stripeStatus === "missing" ? "text-pink-500" : "text-cyan-400"}`}>
                      {stripeStatus === "configured" && "Configured"}
                      {stripeStatus === "missing" && "Missing env values"}
                      {stripeStatus === "checking" && "Checking..."}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.03] p-5">
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Test card</p>
                    <p className="font-mono text-sm text-white">4242 4242 4242 4242</p>
                  </div>
                </div>

                {isCanceled && (
                  <div className="mb-6 border border-cyan-400/30 bg-cyan-400/10 p-4 font-mono text-sm text-cyan-400">
                    Stripe checkout was canceled. No problem. The button below will create a fresh test session.
                  </div>
                )}

                {error && (
                  <div className="mb-6 border border-pink-500/30 bg-pink-500/10 p-4 font-mono text-sm text-pink-500">
                    {error}
                  </div>
                )}

                <div className="border border-primary/30 bg-primary/10 p-4 font-mono text-sm text-primary mb-8">
                  This is Stripe test mode. It creates real Stripe test objects, but it does not create a live charge.
                </div>

                <Button
                  className="w-full h-16 rounded-none bg-gradient-to-r from-primary to-cyan-400 text-black border-none font-mono uppercase tracking-widest text-sm hover:from-primary/90 hover:to-cyan-400/90"
                  type="button"
                  disabled={isRedirecting || stripeStatus === "missing"}
                  onClick={handleCheckout}
                >
                  {isRedirecting ? (
                    "Redirecting to Stripe..."
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Continue to Stripe Checkout
                      <ExternalLink className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </section>

            <aside className="bg-gradient-to-b from-card to-background border border-border p-8 lg:sticky lg:top-8">
              <div className="flex items-center justify-between gap-4 pb-6 border-b border-border">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Selected plan</p>
                  <h2 className="text-3xl font-bold tracking-tight">{plan.name}</h2>
                </div>
                <div className={`text-4xl font-bold tracking-tighter ${plan.accent}`}>
                  {plan.price}<span className="text-lg text-muted-foreground font-normal">/mo</span>
                </div>
              </div>

              <ul className="space-y-4 py-8 font-mono text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 ${plan.accent} shrink-0`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="border border-white/10 bg-white/[0.03] p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-cyan-400" />
                  <p className="font-mono text-xs uppercase tracking-widest text-white">Stripe safety label</p>
                </div>
                <p className="font-mono text-sm text-muted-foreground">
                  Stripe test mode creates test checkout records only. No live money is being transferred, and no live payments are being made.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
