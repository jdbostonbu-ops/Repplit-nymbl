Nymbl — Landing Page Build Prompt
Project Overview
Build a bold, high-energy single-page landing page for Nymbl — a broad marketing automation service for time-starved owner-operators. AI social video is the flagship showcase, but Nymbl automates much more.

Identity
Name: Nymbl
What it is: A marketing automation service — AI social video is the showcase feature, not the whole offer
Audience: Owner-operators who are too busy running their business to market it — realtors, insurance agents, solar reps, landscapers, roofers, skydiving instructors/schools, scuba/watersports shops, handmade jewelry makers, boutiques, handmade clothing makers
Core pain point / headline driver: "Too busy running the business to market it"
Look & Feel
Energy: High-energy, bright, media/AI aesthetic — NOT calm, NOT spa-like
Prohibited colors: NO purple, NO violet whatsoever
Palette: Electric blue, cyan, hot magenta/pink, amber/orange, lime accents — dark background preferred
Typography: Dramatic type scale — very large hero text contrasted with small supporting text (think cinematic title card)
Layout: One long scroll page — all content on a single page, no multi-page routing
Animation: Words and sections fade/slide in on scroll (use IntersectionObserver or Framer Motion). Smooth, energetic — not janky.
Gradient signature: An animated gradient (CSS keyframe animation) that feels like a media spectrum or AI iridescence. Use it as a signature accent — could be in nav, hero background, section dividers, or CTA buttons.
Tech Stack
Framework: React + Vite (or Next.js)
Styling: Tailwind CSS
Animation: Framer Motion (already in package.json)
Icons: Lucide React or inline SVG
No backend required — all content is static
Constraints: No any types in TypeScript, no var, use textContent for user input (not innerHTML)
Page Sections (top → bottom)
1. Nav
Fixed position, glassmorphism background
Left: "Nymbl" logo / wordmark
Right: Primary CTA button — "Book a 15-min Call" (links to #booking or your Cal.com URL)
2. Hero
Headline: "We automate your marketing—so you don't have to."
Subhead: Value-prop targeting the audience — mention the business types, emphasize time savings
Primary CTA: "Book a 15-min Call"
Secondary CTA: "Watch it make a video"
Trust line: "9,000+ apps in our automation network"
Huge, dramatic typography. The headline should stop you mid-scroll.
3. Audience Ticker
Horizontally auto-scrolling infinite marquee strip
Contents: Realtors · Insurance Agents · Solar Reps · Landscapers · Roofers · Skydiving Schools · Scuba Shops · Watersports Rentals · Jewelry Makers · Boutiques · Handmade Clothing · Contractors · and more...
Should loop seamlessly so every visitor sees their business type
4. What We Automate
Feature grid — 6–8 items
AI Social Video is the HERO item — biggest, most prominent, visually featured
Other items: Lead capture forms, Slack / team alerts, Weekly blog posts, Booking flow setup, Custom automations, "9,000+ app integrations"
Each item gets an icon and a one-line description
Make the grid energetic — colors, motion, bold labels
5. AI Video Demo
Section headline: Something bold about generating social videos in seconds
Interactive demo form (4 fields):
"What are you promoting?" — text input
"What vibe?" — dropdown: Exciting / Professional / Fun / Urgent / Inspirational
"Presenter style?" — dropdown: Friendly / Bold / Expert / Casual
"Key selling point?" — text input
"Generate Preview Script →" button — on click, shows a simulated AI-generated video script result below the form (static/fake is fine — this is a UI demo, no real API call)
Script preview card — styled result panel with a "Script Preview" label and placeholder script text
Disclaimer text: "This is a script preview only. Real video delivery handled by our team."
Video placeholder box: A prominent dark widescreen frame with:
Subtle pulsing or glowing border (CSS animation)
Large play button icon (SVG or Lucide)
Label: "AI Video Showcase — Your content goes here."
This is where the user will embed real AI-generated video content later
6. Pricing
Three tiers displayed side by side (or stacked on mobile):

Tier	Price	Services	Badge
Kickstart	$50/mo	5 automation services	—
Cruise Control	$150/mo	10 automation services	"Most Popular"
Full Throttle	$500/mo	20 automation services	—
All CTAs link to #booking
"Cruise Control" must be visually distinct — highlighted border, accent color, badge
Note in footer: "Stripe Test Mode — use card 4242 4242 4242 4242"
7. Testimonials
Three testimonials from varied owner-operator personas:

A realtor
A dropzone / skydiving school owner
A handmade jewelry maker
Make up realistic-sounding names and quotes about time saved on marketing.

8. Final CTA
Bold, full-width section with gradient overlay
Headline: "Ready to automate?" (or similar)
Large "Book a 15-min Call" button (id="booking")
9. Footer
"Nymbl" wordmark
Tagline: "Automate everything. Market like a machine."
Small text: "Demo site · Stripe test mode"
CTAs
Primary (money action): Book a 15-min call — link to Cal.com or #booking
Secondary: The AI video demo form ("see it build a video")
Copy / Claims Rules
Headline sells automation broadly; the demo spotlights AI social video
Stat to use: "distributed across 9,000+ apps" — this is about reach, don't name specific vendors
Video engines/AI providers: do NOT name them, do NOT quantify them
❌ Never write "9,000+ AI video apps" — it's "9,000+ apps in our automation network"
All value prop copy is written from the customer's perspective — their time, their pain, their win
Future Integrations (wire these when going live)
Cal.com — embed or link for the 15-min booking CTA
Stripe Test Mode — 3 payment links (recurring/monthly):
Kickstart $50/mo
Cruise Control $150/mo
Full Throttle $500/mo
Test card: 4242 4242 4242 4242
Demo form → Zapier webhook — via API route, use textContent (not innerHTML) for user input safety
Proof embeds: Real LinkedIn post, Instagram post, YouTube video (once public)
Go-Live Checklist
 YouTube video privacy set to public
 Swap sk_test_ Stripe key → sk_live_ only when actually selling
 Replace Cal.com placeholder link with real booking URL
 Wire demo form to real Zapier webhook
 Embed real LinkedIn / Instagram proof posts
 Drop real AI-generated video into the video placeholder section
 Add your real domain (remove Replit dev URL)
Emotional Direction for the Builder
This landing page is for real business owners who will decide in 3 seconds whether Nymbl is worth their time. The gradient, the type scale, the scroll animations — they should all feel like Nymbl is already moving faster than everyone else. Electric. Confident. Inevitable. Don't play it safe. Safe is forgettable.

Remaining Prompts / Current Implementation Notes

Already wired:
- Cal.com CTA: use NEXT_PUBLIC_CAL_LINK from .env for all "Book a 15-min Call" buttons.
- Stripe test checkout: use STRIPE_SECRET_KEY plus STRIPE_PRICE_KICKSTART, STRIPE_PRICE_CRUISE, and STRIPE_PRICE_THROTTLE from .env.
- OpenAI script generation: use OPENAI_API_KEY server-side to generate a 60-second script preview.
- Demo contact capture UI: Configure Video includes name, business, email, and phone fields in the submitted payload.
- Generate My Video CTA UI: standalone themed button below the script preview boxes, with hover color shift and motion feedback.
- Generate My Video webhook: submit to NEXT_PUBLIC_ZAPIER_WEBHOOK_URL through /api/request-video after an AI script exists.
- Sheets / HeyGen webhook columns: Date, Name, Email, Phone, Business, Promoting, Vibe, Presenter, Script.
- Footer contact copy: stack "Automate everything. Market like a machine." above "If you want to call us and talk to us directly, call us at 444-444-4444."
- Vercel deployment: use vercel.json with SPA rewrites and dist/public output.
- Logo asset: use public/nymbl-logo.svg for Nymbl branded artwork.
- README live link: https://repplit-nymbl.vercel.app/

Active OpenAI script generation prompt:

Instructions:
You write concise, high-converting short-form social video scripts for local service businesses.
Return only the script. Format it as 6 timestamped beats for a 60-second video.
Use timestamps [0:00-0:08], [0:08-0:18], [0:18-0:30], [0:30-0:42], [0:42-0:52], [0:52-1:00].
Include a hook, pain point, offer/value, proof or mechanism, urgency, and CTA.
Do not mention AI, OpenAI, Zapier, automation setup, or video generation.

User input template:
Promotion: {promotion}
Vibe: {vibe}
Presenter style: {presenterStyle}
Key selling point: {sellingPoint}
Write a polished 60-second social video script.

Remaining future prompts:
- Replace the YouTube proof embed with the final public workflow demo video.
- Embed real LinkedIn and Instagram proof posts once public.
- Drop the final real AI-generated video into the showcase area if you want a finished proof asset.
- Swap Stripe sk_test_ keys to sk_live_ only when actually selling.
- Confirm Cal.com production event URL before launch.
- Add the final custom domain in Vercel and replace any Replit-era references in docs.
- Keep .env, dist/, and node_modules/ ignored and untracked.
