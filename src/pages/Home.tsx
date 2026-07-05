import { useEffect, useRef, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { Play, CheckCircle2, Video, Zap, MessageSquare, Briefcase, FormInput, SlidersHorizontal, Settings2, Sparkles, Newspaper, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const AnimatedGradientText = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <span className={`bg-gradient-to-r from-cyan-400 via-primary to-pink-500 text-transparent bg-clip-text animate-gradient-xy ${className}`}>
    {children}
  </span>
);

const TestimonialDot = () => (
  <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-primary via-cyan-400 to-pink-500 animate-gradient-xy shadow-[0_0_26px_rgba(0,128,255,0.28)] ring-1 ring-white/15" />
);

const getCheckoutHref = (plan: string) => {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${baseUrl}/checkout?plan=${encodeURIComponent(plan)}`;
};

type BookingButtonProps = Pick<ComponentProps<typeof Button>, "className" | "size"> & {
  bookingUrl: string;
  children: ReactNode;
};

const BookingButton = ({ bookingUrl, children, ...buttonProps }: BookingButtonProps) => {
  const hasBookingUrl = bookingUrl.length > 0;

  return (
    <Button
      {...buttonProps}
      asChild={hasBookingUrl}
      onClick={
        hasBookingUrl
          ? undefined
          : () => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })
      }
    >
      {hasBookingUrl ? (
        <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        children
      )}
    </Button>
  );
};

export default function Home() {
  const [demoState, setDemoState] = useState<"idle" | "generating" | "done">("idle");
  const [videoRequestState, setVideoRequestState] = useState<"idle" | "submitting" | "sent">("idle");
  const [scriptError, setScriptError] = useState("");
  const [videoRequestError, setVideoRequestError] = useState("");
  const [generatedScript, setGeneratedScript] = useState("");
  const [contactName, setContactName] = useState("");
  const [business, setBusiness] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [promotion, setPromotion] = useState("");
  const [vibe, setVibe] = useState("exciting");
  const [presenterStyle, setPresenterStyle] = useState("expert");
  const [sellingPoint, setSellingPoint] = useState("");
  const scriptOutputRef = useRef<HTMLDivElement>(null);
  const bookingUrl = import.meta.env.NEXT_PUBLIC_CAL_LINK?.trim() ?? "";

  useEffect(() => {
    if (!scriptOutputRef.current) {
      return;
    }

    scriptOutputRef.current.textContent = generatedScript;
  }, [generatedScript]);

  const handleGenerateScript = async (e: FormEvent) => {
    e.preventDefault();
    setScriptError("");
    setVideoRequestError("");
    setGeneratedScript("");
    setVideoRequestState("idle");
    setDemoState("generating");

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName,
          business,
          email,
          phone,
          promotion,
          vibe,
          presenterStyle,
          sellingPoint,
        }),
      });
      const body: { script?: string; error?: string } = await response.json();

      if (!response.ok || !body.script) {
        throw new Error(body.error ?? "OpenAI did not return a script.");
      }

      setGeneratedScript(body.script);
      setDemoState("done");
    } catch (error) {
      setScriptError(error instanceof Error ? error.message : "Unable to generate script.");
      setDemoState("idle");
    }
  };

  const handleVideoRequest = async () => {
    setVideoRequestError("");

    if (!generatedScript) {
      setVideoRequestError("Generate the script first so it can be sent with your video request.");
      return;
    }

    setVideoRequestState("submitting");

    try {
      const response = await fetch("/api/request-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName,
          business,
          email,
          phone,
          promotion,
          vibe,
          presenterStyle,
          sellingPoint,
          script: generatedScript,
        }),
      });
      const body: { error?: string; ok?: boolean } = await response.json();

      if (!response.ok || !body.ok) {
        throw new Error(body.error ?? "Unable to submit video request.");
      }

      setVideoRequestState("sent");
    } catch (error) {
      setVideoRequestError(error instanceof Error ? error.message : "Unable to submit video request.");
      setVideoRequestState("idle");
    }
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden font-sans selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tighter">
            NYMBL<span className="text-primary">.</span>
          </div>
          <BookingButton
            bookingUrl={bookingUrl}
            className="bg-primary hover:bg-primary/90 text-white font-mono text-xs uppercase tracking-widest h-10 px-6 rounded-none"
          >
            Book a 15-min call
          </BookingButton>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 min-h-[90vh] flex flex-col justify-center relative">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/40 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-500/40 rounded-full blur-[100px] mix-blend-screen" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/30 rounded-full blur-[150px] mix-blend-screen" />
        </div>

        <motion.div 
          className="container mx-auto text-center z-10 relative"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-cyan-400 mb-8 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Distributed across 9,000+ apps in our automation network
          </motion.div>
          
          <motion.h1 
            variants={fadeUp}
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] mb-8"
          >
            We automate your marketing<br />
            <span className="opacity-40">so you don't have to.</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeUp}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-mono"
          >
            Built for owner-operators who measure time in dollars. Realtors, insurance agents, roofers, landscapers, shops, and makers - stop losing nights to manual marketing.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <BookingButton
              bookingUrl={bookingUrl}
              size="lg" 
              className="w-full sm:w-auto h-16 px-10 text-lg font-mono uppercase tracking-widest bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-black border-none rounded-none transform transition-transform hover:scale-105"
            >
              Book a 15-min call
            </BookingButton>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto h-16 px-10 text-lg font-mono uppercase tracking-widest border-border hover:bg-white/5 rounded-none"
              onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch workflow demo
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Audience Marquee */}
      <div className="w-full bg-primary py-4 overflow-hidden flex border-y border-white/10 transform -rotate-1 shadow-2xl z-20 relative">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center text-black font-bold text-2xl uppercase tracking-widest mx-4">
              Realtors <span className="mx-6 text-black/40">/</span>
              Insurance Agents <span className="mx-6 text-black/40">/</span>
              Solar Reps <span className="mx-6 text-black/40">/</span>
              Landscapers <span className="mx-6 text-black/40">/</span>
              Roofers <span className="mx-6 text-black/40">/</span>
              Skydiving Schools <span className="mx-6 text-black/40">/</span>
              Scuba Shops <span className="mx-6 text-black/40">/</span>
              Watersports Rentals <span className="mx-6 text-black/40">/</span>
              Jewelry Makers <span className="mx-6 text-black/40">/</span>
              Boutiques <span className="mx-6 text-black/40">/</span>
              Handmade Clothing <span className="mx-6 text-black/40">/</span>
              Contractors <span className="mx-6 text-black/40">/</span>
              And More <span className="mx-6 text-black/40">/</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
              What we <AnimatedGradientText>automate</AnimatedGradientText>
            </h2>
            <p className="text-xl text-muted-foreground font-mono">Everything that steals your time.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-card to-background border border-border p-10 flex flex-col justify-between group hover:border-primary/50 transition-colors"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center mb-8">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold tracking-tight mb-4">AI Social Video</h3>
                <p className="text-xl text-muted-foreground max-w-md font-mono">
                  Scripts, voiceovers, captions, scheduling, and workflow handoff for high-converting social media content.
                </p>
              </div>
              <div className="mt-12 h-40 bg-cyan-400/[0.06] rounded-lg border border-cyan-400/20 relative overflow-hidden flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-primary/15 to-pink-500/20 animate-gradient-xy" />
                <div className="font-mono text-sm tracking-widest text-white/70 z-10 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" /> Auto-posting enabled
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card border border-border p-8 flex flex-col justify-center"
            >
              <FormInput className="w-8 h-8 text-cyan-400 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Lead Capture</h3>
              <p className="text-muted-foreground font-mono text-sm">Smart forms that qualify leads before you even see them.</p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card border border-border p-8 flex flex-col justify-center"
            >
              <MessageSquare className="w-8 h-8 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-2">Team Alerts</h3>
              <p className="text-muted-foreground font-mono text-sm">Instant Slack/SMS pings when high-value actions occur.</p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card border border-border p-8 flex flex-col justify-center"
            >
              <Briefcase className="w-8 h-8 text-lime-400 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Booking Flows</h3>
              <p className="text-muted-foreground font-mono text-sm">Automated calendar management and reminders.</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card border border-border p-8 flex flex-col justify-center"
            >
              <Newspaper className="w-8 h-8 text-orange-400 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Weekly Blog Posts</h3>
              <p className="text-muted-foreground font-mono text-sm">Fresh educational posts built from your offers, FAQs, and local expertise.</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card border border-border p-8 flex flex-col justify-center"
            >
              <Workflow className="w-8 h-8 text-cyan-400 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Custom Automations</h3>
              <p className="text-muted-foreground font-mono text-sm">Bespoke workflows for the repetitive marketing tasks only your business has.</p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="md:col-span-2 bg-card border border-border p-8 flex flex-col sm:flex-row items-center gap-8"
            >
              <Settings2 className="w-12 h-12 text-pink-500 shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-2">9,000+ Integrations</h3>
                <p className="text-muted-foreground font-mono text-sm">Distributed across 9,000+ apps, with automations built for your exact operational stack.</p>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* AI Demo Section */}
      <section id="demo" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        
        <div className="container mx-auto relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
              Social video in <span className="text-pink-500">seconds.</span>
            </h2>
            <p className="text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
              The live demo walks through the Zap workflow. The page below uses OpenAI to generate the script that starts it.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="relative aspect-video bg-black border border-white/10 shadow-2xl flex flex-col items-center justify-center overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute inset-[-2px] bg-gradient-to-r from-primary via-pink-500 to-cyan-400 animate-gradient-xy opacity-20 group-hover:opacity-40" style={{ filter: 'blur(15px)' }} />
              </div>
              
              <iframe
                className="relative z-10 h-full w-full"
                src="https://www.youtube.com/embed/5cO9hsgMTUg"
                title="AI Video Showcase"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
              
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-2 py-1 bg-black/50 backdrop-blur border border-white/10 text-[10px] font-mono text-white/50 uppercase tracking-widest z-10">
                <Play className="w-3 h-3" />
                AI Video Showcase - Your content goes here.
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* OpenAI Script Section */}
      <section className="py-32 px-6 border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none" />

        <div className="container mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-xs font-mono text-cyan-400 mb-6 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              OpenAI Script Engine
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
              Generate the <AnimatedGradientText>60-second script.</AnimatedGradientText>
            </h2>
            <p className="text-xl text-muted-foreground font-mono max-w-3xl">
              The page writes the script. The full Zap workflow gets shown live during the demo.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card border border-border p-8 shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-cyan-400 to-pink-500" />

              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                Configure Video
              </h3>

              <form onSubmit={handleGenerateScript} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Name</label>
                    <Input
                      id="contact-name"
                      name="contactName"
                      autoComplete="name"
                      value={contactName}
                      onChange={(event) => setContactName(event.target.value)}
                      placeholder="e.g., Jordan Lee"
                      className="bg-background border-white/10 font-mono text-sm rounded-none h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="business" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Business</label>
                    <Input
                      id="business"
                      name="business"
                      autoComplete="organization"
                      value={business}
                      onChange={(event) => setBusiness(event.target.value)}
                      placeholder="e.g., Lee Solar Co."
                      className="bg-background border-white/10 font-mono text-sm rounded-none h-12"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Email</label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="bg-background border-white/10 font-mono text-sm rounded-none h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Phone</label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="(555) 123-4567"
                      className="bg-background border-white/10 font-mono text-sm rounded-none h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="promotion" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">What are you promoting?</label>
                  <Input
                    id="promotion"
                    name="promotion"
                    value={promotion}
                    onChange={(event) => setPromotion(event.target.value)}
                    placeholder="e.g., Summer Solar Installation Promo"
                    className="bg-background border-white/10 font-mono text-sm rounded-none h-12"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="vibe" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">What vibe?</label>
                    <Select name="vibe" value={vibe} onValueChange={setVibe}>
                      <SelectTrigger id="vibe" className="bg-background border-white/10 font-mono text-sm rounded-none h-12">
                        <SelectValue placeholder="Select vibe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exciting">Exciting</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="fun">Fun</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="presenter-style" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Presenter Style?</label>
                    <Select name="presenterStyle" value={presenterStyle} onValueChange={setPresenterStyle}>
                      <SelectTrigger id="presenter-style" className="bg-background border-white/10 font-mono text-sm rounded-none h-12">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="selling-point" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Key selling point?</label>
                  <Textarea
                    id="selling-point"
                    name="sellingPoint"
                    value={sellingPoint}
                    onChange={(event) => setSellingPoint(event.target.value)}
                    placeholder="e.g., 0% down financing available until August 1st."
                    className="bg-background border-white/10 font-mono text-sm rounded-none resize-none h-24"
                    required
                  />
                </div>

                {scriptError && (
                  <div className="border border-pink-500/30 bg-pink-500/10 p-4 font-mono text-sm text-pink-500">
                    {scriptError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={demoState === "generating"}
                  className="w-full h-14 text-sm font-mono uppercase tracking-widest bg-white text-black hover:bg-white/90 rounded-none transition-all"
                >
                  {demoState === "generating" ? "Generating..." : "Generate Preview Script ->"}
                </Button>

                <p className="text-center text-xs text-muted-foreground font-mono mt-4">
                  This is a script preview only. Real video delivery handled by our team.
                </p>
              </form>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="space-y-6"
            >
              <div className="bg-gradient-to-b from-card to-background border border-border p-8 min-h-[520px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-primary to-pink-500" />

                <div className="flex items-center justify-between gap-4 mb-8">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    Script Preview
                  </h3>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-primary border border-primary/30 bg-primary/10 px-2 py-1">
                    60 sec
                  </div>
                </div>

                {demoState === "generating" && (
                  <div className="h-[360px] flex items-center justify-center border border-white/10 bg-white/[0.03]">
                    <div className="font-mono text-sm text-cyan-400 uppercase tracking-widest animate-pulse">Writing script...</div>
                  </div>
                )}

                {demoState !== "generating" && generatedScript && (
                  <div
                    ref={scriptOutputRef}
                    className="font-mono text-sm text-muted-foreground whitespace-pre-wrap leading-7"
                  />
                )}

                {demoState !== "generating" && !generatedScript && (
                  <div className="h-[360px] flex items-center justify-center text-center border border-white/10 bg-white/[0.03] p-8">
                    <p className="font-mono text-sm text-muted-foreground max-w-md">
                      Your timestamped OpenAI-generated script will appear here after the form runs.
                    </p>
                  </div>
                )}
              </div>

              {videoRequestError && (
                <div className="border border-pink-500/30 bg-pink-500/10 p-4 font-mono text-sm text-pink-500">
                  {videoRequestError}
                </div>
              )}

              {videoRequestState === "sent" && (
                <div className="border border-primary/30 bg-primary/10 p-4 font-mono text-sm text-primary">
                  Video request sent.
                </div>
              )}

              <Button
                type="button"
                disabled={!generatedScript || videoRequestState === "submitting"}
                onClick={handleVideoRequest}
                className="group h-16 w-full px-10 rounded-none border border-cyan-400/40 bg-gradient-to-r from-primary via-cyan-400 to-pink-500 bg-[length:300%_300%] text-black shadow-[0_0_38px_rgba(0,229,255,0.22)] animate-gradient-xy transition-all duration-300 hover:scale-[1.03] hover:from-pink-500 hover:via-primary hover:to-cyan-400 hover:text-white hover:shadow-[0_0_52px_rgba(236,72,153,0.34)] active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-3 font-mono text-sm uppercase tracking-widest">
                  <Video className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  {videoRequestState === "submitting" ? "Sending Video Request..." : "Generate My Video"}
                </span>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6 border-t border-border">
        <div className="container mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
              Return on <span className="text-cyan-400">Attention.</span>
            </h2>
            <p className="text-xl text-muted-foreground font-mono">Simple pricing. Massive leverage.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Tier 1 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card border border-border p-8 flex flex-col"
            >
              <h3 className="text-2xl font-bold mb-2">Kickstart</h3>
              <div className="text-4xl font-bold tracking-tighter mb-6">$50<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-grow font-mono text-sm text-muted-foreground">
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> 5 Automation Services</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Basic Lead Capture</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Email Support</li>
              </ul>
              <Button 
                variant="outline"
                className="w-full h-12 font-mono uppercase tracking-widest rounded-none border-border hover:bg-white/5"
                asChild
              >
                <a href={getCheckoutHref("kickstart")}>Get Started</a>
              </Button>
            </motion.div>

            {/* Tier 2 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-gradient-to-b from-card to-background border-2 border-primary p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_50px_-12px_rgba(0,128,255,0.3)]"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black font-mono text-xs font-bold uppercase tracking-widest py-1 px-4">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Cruise Control</h3>
              <div className="text-5xl font-bold tracking-tighter mb-6 text-white">$150<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-grow font-mono text-sm text-muted-foreground">
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" /> <span className="text-white">10 Automation Services</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" /> <span className="text-white">AI Video Workflow (4/mo)</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" /> Advanced Lead Routing</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" /> Priority Slack Support</li>
              </ul>
              <Button 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-mono uppercase tracking-widest rounded-none text-sm"
                asChild
              >
                <a href={getCheckoutHref("cruise")}>Get Started</a>
              </Button>
            </motion.div>

            {/* Tier 3 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card border border-border p-8 flex flex-col"
            >
              <h3 className="text-2xl font-bold mb-2">Full Throttle</h3>
              <div className="text-4xl font-bold tracking-tighter mb-6">$500<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-grow font-mono text-sm text-muted-foreground">
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" /> 20 Automation Services</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" /> AI Video Workflow (Unlimited)</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" /> Custom API Integrations</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" /> Dedicated Account Manager</li>
              </ul>
              <Button 
                variant="outline"
                className="w-full h-12 font-mono uppercase tracking-widest rounded-none border-border hover:bg-white/5"
                asChild
              >
                <a href={getCheckoutHref("throttle")}>Get Started</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
              What operators <AnimatedGradientText>say.</AnimatedGradientText>
            </h2>
            <p className="text-xl text-muted-foreground font-mono">Less busywork. More actual business.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card/50 border border-white/5 p-8 relative"
            >
              <div className="text-4xl text-primary font-serif absolute top-4 left-4 opacity-20">"</div>
              <p className="text-lg mb-6 relative z-10 font-medium">"I used to spend 15 hours a week messing with Facebook ads and follow-up emails. Nymbl took that to zero. I closed three extra homes last month just from the time I saved."</p>
              <div className="flex items-center gap-4">
                <TestimonialDot />
                <div>
                  <div className="font-bold">Sarah Jenkins</div>
                  <div className="text-sm text-muted-foreground font-mono">Independent Realtor</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card/50 border border-white/5 p-8 relative"
            >
              <div className="text-4xl text-cyan-400 font-serif absolute top-4 left-4 opacity-20">"</div>
              <p className="text-lg mb-6 relative z-10 font-medium">"Running a dropzone means I'm in the air, not at a desk. The automated AI videos they generate from our daily jumps have doubled our tandem bookings. It's ridiculous."</p>
              <div className="flex items-center gap-4">
                <TestimonialDot />
                <div>
                  <div className="font-bold">Marcus Thorne</div>
                  <div className="text-sm text-muted-foreground font-mono">Owner, Altitude Skydiving</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card/50 border border-white/5 p-8 relative"
            >
              <div className="text-4xl text-pink-500 font-serif absolute top-4 left-4 opacity-20">"</div>
              <p className="text-lg mb-6 relative z-10 font-medium">"I make jewelry. I don't know how to code APIs or run social media calendars. Nymbl connected my Shopify to everything else and now it just... works. Like magic."</p>
              <div className="flex items-center gap-4">
                <TestimonialDot />
                <div>
                  <div className="font-bold">Elena Rostova</div>
                  <div className="text-sm text-muted-foreground font-mono">Founder, ER Studios</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card/50 border border-white/5 p-8 relative"
            >
              <div className="text-4xl text-primary font-serif absolute top-4 left-4 opacity-20">"</div>
              <p className="text-lg mb-6 relative z-10 font-medium">"Insurance follow-ups used to disappear into a spreadsheet and a prayer. Nymbl routes every quote request, sends reminders, and keeps me in front of clients before renewals sneak up."</p>
              <div className="flex items-center gap-4">
                <TestimonialDot />
                <div>
                  <div className="font-bold">Denise Carter</div>
                  <div className="text-sm text-muted-foreground font-mono">Independent Insurance Agent</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card/50 border border-white/5 p-8 relative"
            >
              <div className="text-4xl text-cyan-400 font-serif absolute top-4 left-4 opacity-20">"</div>
              <p className="text-lg mb-6 relative z-10 font-medium">"My boutique launches used to mean late nights writing captions and manually emailing VIP customers. Now the product drops, texts, posts, and follow-ups all fire together."</p>
              <div className="flex items-center gap-4">
                <TestimonialDot />
                <div>
                  <div className="font-bold">Maya Chen</div>
                  <div className="text-sm text-muted-foreground font-mono">Owner, Finch & Thread Boutique</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card/50 border border-white/5 p-8 relative"
            >
              <div className="text-4xl text-pink-500 font-serif absolute top-4 left-4 opacity-20">"</div>
              <p className="text-lg mb-6 relative z-10 font-medium">"I wanted clients on the massage table, not floating around my inbox. Nymbl handles appointment reminders, rebooking prompts, and review requests while I stay focused on the work."</p>
              <div className="flex items-center gap-4">
                <TestimonialDot />
                <div>
                  <div className="font-bold">Alicia Moreno</div>
                  <div className="text-sm text-muted-foreground font-mono">Licensed Massage Therapist</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="booking" className="py-40 px-6 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-400 to-pink-500 opacity-20 animate-gradient-xy" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center relative z-10 max-w-3xl mx-auto"
        >
          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8">
            Ready to <AnimatedGradientText>automate?</AnimatedGradientText>
          </h2>
          <p className="text-2xl text-muted-foreground font-mono mb-12">
            Stop doing manual labor your software should do.
          </p>
          <BookingButton
            bookingUrl={bookingUrl}
            size="lg" 
            className="h-20 px-12 text-xl font-mono uppercase tracking-widest bg-white text-black hover:bg-white/90 border-none rounded-none shadow-[0_0_40px_rgba(255,255,255,0.3)] transform transition-transform hover:scale-105"
          >
            Book a 15-min call
          </BookingButton>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-3xl font-bold tracking-tighter">
            NYMBL<span className="text-primary">.</span>
          </div>
          <div className="text-center md:text-left font-mono space-y-2">
            <div className="text-[16px] text-muted-foreground">
              Automate everything. Market like a machine.
            </div>
            <div className="text-[14px] text-muted-foreground/50">
              If you want to call us and talk to us directly, call us at 444-444-4444.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
