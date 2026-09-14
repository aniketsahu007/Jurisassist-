import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  BarChart3,
  CheckCircle2,
  CalendarClock,
  Database,
  FileSearch,
  Gavel,
  Layers,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Gavel,
    title: "Matter management",
    body: "Track every matter with court, bench, FIR number, statutory sections and the next listed date in one register.",
  },
  {
    icon: FileSearch,
    title: "Document intelligence",
    body: "Ingest chargesheets, orders, audio and video exhibits; get OCR, extracted sections, entities and annotations.",
  },
  {
    icon: CalendarClock,
    title: "Case chronology",
    body: "Auto-built timelines from incident and FIR through arrest, chargesheet, hearings and judgment.",
  },
  {
    icon: Search,
    title: "Precedent search",
    body: "Relevance-ranked judgments filtered by court, judge, year, section and case type — save or compare instantly.",
  },
  {
    icon: Brain,
    title: "AI memory",
    body: "Your past cases, winning arguments and preferred sections recalled through vector similarity when they matter.",
  },
  {
    icon: BarChart3,
    title: "Pattern analysis",
    body: "Judge preferences, success rates, rejected arguments and section outcomes visualised across your practice.",
  },
];

const capabilities = [
  {
    title: "Contradiction detection",
    body: "Cross-reads Section 161 CrPC statements, seizure memos and depositions to surface inconsistencies with page-level citations.",
  },
  {
    title: "Draft generation",
    body: "Bail applications, written submissions and rejoinders drafted in your chamber's house style with verified citations.",
  },
  {
    title: "Evidence gap analysis",
    body: "Flags the exhibits, certificates and witnesses missing before a proposition can safely be argued.",
  },
  {
    title: "Risk & confidence scoring",
    body: "Every AI report carries a calibrated confidence score with the reasoning surfaced, never a bare verdict.",
  },
];

const architecture = [
  { icon: Layers, label: "React + TypeScript UI", note: "Responsive workspace, dark and light" },
  {
    icon: Workflow,
    label: "FastAPI service layer",
    note: "Ingestion, OCR and report orchestration",
  },
  {
    icon: Database,
    label: "Vector + relational stores",
    note: "ChromaDB embeddings, PostgreSQL records",
  },
  {
    icon: Sparkles,
    label: "Multi-model AI routing",
    note: "Long-context analysis and fast drafting",
  },
];

const plans = [
  {
    name: "Solo",
    price: "₹4,900",
    note: "per advocate / month",
    points: [
      "Up to 25 active matters",
      "Document intelligence",
      "Precedent search",
      "Email support",
    ],
    highlight: false,
  },
  {
    name: "Chambers Pro",
    price: "₹48,000",
    note: "per chamber / month · 12 seats",
    points: [
      "Unlimited matters",
      "AI reports & contradiction digests",
      "AI memory and pattern analysis",
      "Priority onboarding",
    ],
    highlight: true,
  },
  {
    name: "Firm",
    price: "Custom",
    note: "billed annually",
    points: [
      "Unlimited seats",
      "Audit logging",
      "Private model routing",
      "Dedicated success manager",
    ],
    highlight: false,
  },
];

const faqs = [
  {
    q: "Is client data used to train models?",
    a: "No. Matter records, uploads and drafts stay inside your chamber workspace and are never used for model training. Exports are watermarked and logged.",
  },
  {
    q: "Which courts and databases are covered?",
    a: "Reported judgments of the Supreme Court, all High Courts and major tribunals, alongside your own uploaded records and orders.",
  },
  {
    q: "Can jurisAssist draft filings?",
    a: "It produces first drafts of bail applications, written submissions and rejoinders with citations attached. Every draft is reviewed by counsel before filing.",
  },
  {
    q: "Does it work with regional-language records?",
    a: "Yes. A second OCR pass handles Devanagari records, and Hindi and Marathi documents are summarised in English alongside the original text.",
  },
  {
    q: "How is pricing counted?",
    a: "By seat, not by matter or document volume. Unused seats can be reassigned across the chamber at any time.",
  },
];

function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("border-b px-4 py-20 sm:px-6", className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Scale className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-semibold">jurisAssist</span>
          <nav className="ml-8 hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#capabilities" className="transition-colors hover:text-foreground">
              AI
            </a>
            <a href="#architecture" className="transition-colors hover:text-foreground">
              Architecture
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/">
                Open workspace <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <Section className="pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
              Built for the Indian bar
            </Badge>
            <h1 className="mt-5 font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
              Legal intelligence for chambers that argue at pace
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              jurisAssist reads your chargesheets, builds the chronology, finds the precedent and
              drafts the submission — so counsel spends the morning arguing, not assembling the
              brief.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/">
                  Open the workspace <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/assistant">Try the AI assistant</Link>
              </Button>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t pt-6">
              {[
                ["12,400+", "Judgments indexed"],
                ["340", "Matters managed"],
                ["82%", "Mean report confidence"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-2xl font-semibold">{v}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="panel p-5">
            <p className="text-eyebrow">Live matter</p>
            <p className="mt-1 font-display text-lg font-semibold">
              State of Maharashtra v. Rohan Deshmukh
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              CRL.A. 482/2024 · Bombay High Court · Justice A. S. Kulkarni
            </p>
            <ul className="mt-5 space-y-3">
              {[
                ["Contradictions detected", "6 across PW-3 statements and the seizure memo"],
                ["Missing evidence", "Section 65B certificate for the CDR bundle"],
                ["Recommended precedent", "Anvar P.V. v. P.K. Basheer, (2014) 10 SCC 473"],
                ["Next listed", "11 Aug 2026 · Item 14, Court No. 27"],
              ].map(([t, d]) => (
                <li key={t} className="rounded-lg bg-surface-2 p-3">
                  <p className="text-xs font-semibold">{t}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="features">
        <p className="text-eyebrow">Product</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Everything a litigation practice runs on
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="panel p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="capabilities" className="bg-surface-2/40">
        <p className="text-eyebrow">AI capabilities</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Analysis you can put in front of a judge
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {capabilities.map((c) => (
            <div key={c.title} className="panel flex gap-4 p-5">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-display text-base font-semibold">{c.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="architecture">
        <p className="text-eyebrow">Architecture</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          How the platform is put together
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {architecture.map((a) => (
            <div key={a.label} className="panel p-5">
              <a.icon className="h-5 w-5 text-primary" />
              <p className="mt-4 text-sm font-semibold">{a.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{a.note}</p>
            </div>
          ))}
        </div>
        <div className="panel mt-6 flex items-start gap-3 p-5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <p className="text-sm text-muted-foreground">
            Privileged material stays in your workspace: watermarked exports, per-matter access
            control and a full audit trail of every document opened, drafted or shared.
          </p>
        </div>
      </Section>

      <Section id="pricing" className="bg-surface-2/40">
        <p className="text-eyebrow">Pricing</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Simple per-seat plans
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Indicative pricing — final terms are agreed during chamber onboarding.
        </p>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={cn("panel p-6", p.highlight && "border-primary/40 ring-1 ring-primary/20")}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                {p.highlight && <Badge>Most chosen</Badge>}
              </div>
              <p className="mt-4 font-display text-3xl font-semibold">{p.price}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>
              <ul className="mt-5 space-y-2">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {pt}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant={p.highlight ? "default" : "outline"} asChild>
                <Link to="/">Start with {p.name}</Link>
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section id="faq">
        <p className="text-eyebrow">FAQ</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Questions chambers ask first
        </h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <Section id="contact" className="bg-surface-2/40">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-eyebrow">Contact</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
              Talk to the jurisAssist team
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Walkthroughs run for 40 minutes with your own matter as the worked example.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" /> chambers@jurisassist.legal
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" /> +91 22 6811 4400
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" /> Maker Chambers IV, Nariman Point, Mumbai
              </li>
              <li className="flex items-center gap-3">
                <MessageSquareText className="h-4 w-4 text-primary" /> WhatsApp support, 9 AM–9 PM
                IST
              </li>
            </ul>
          </div>
          <div className="panel p-6">
            <h3 className="font-display text-lg font-semibold">Ready to see it on your files?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Open the workspace and explore the dashboard, document intelligence and AI reports
              with a fully populated demo practice.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/">
                  Open workspace <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/reports">See a sample AI report</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <footer className="px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            <span>jurisAssist Legal Intelligence · Mumbai</span>
          </div>
          <p>Demonstration build with illustrative data. Not legal advice.</p>
        </div>
      </footer>
    </div>
  );
}
