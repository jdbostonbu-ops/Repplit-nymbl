import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const homeHref = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/`;

export default function CheckoutSuccess() {
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

      <section className="relative z-10 px-6 py-24">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-xs font-mono text-cyan-400 mb-8 uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            Stripe Test Complete
          </div>

          <div className="mx-auto h-20 w-20 bg-primary/10 border border-primary/30 flex items-center justify-center mb-8">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-6">
            Test checkout <span className="bg-gradient-to-r from-cyan-400 via-primary to-pink-500 text-transparent bg-clip-text animate-gradient-xy">worked.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-mono mb-8">
            Stripe redirected back successfully. This was test mode, so no live money moved.
          </p>

          <Button className="h-14 px-8 rounded-none bg-white text-black hover:bg-white/90 font-mono uppercase tracking-widest" asChild>
            <a href={homeHref}>Back to landing page</a>
          </Button>
        </div>
      </section>
    </main>
  );
}
