import {
  Building2,
  Database,
  Globe,
  KeyRound,
  Languages,
  MonitorSmartphone,
  Plug,
  Shield,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  Connected: "border-success/20 bg-success/10 text-success",
  "Not connected": "text-muted-foreground",
  Planned: "border-warning/20 bg-warning/10 text-warning",
};

export default function SettingsPage() {
  const { integrations, securityEvents, toggleIntegration } = useSettings();

  return (
    <div className="mx-auto max-w-[1000px] space-y-5">
      <header className="panel p-5">
        <p className="text-eyebrow">Settings</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Workspace settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chamber-wide preferences, access controls and service integrations.
        </p>
      </header>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-5">
          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-semibold">Chamber details</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ws-name">Workspace name</Label>
                <Input id="ws-name" defaultValue="Menon & Partners LLP" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="ws-bench">Default bench</Label>
                <Input id="ws-bench" defaultValue="Bombay High Court" className="mt-1.5" />
              </div>
              <div>
                <Label>Time zone</Label>
                <Select defaultValue="ist">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ist">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="gst">Asia/Dubai (GST)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Interface language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिन्दी</SelectItem>
                    <SelectItem value="mr">मराठी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Citation style</Label>
                <Select defaultValue="scc">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scc">SCC (Supreme Court Cases)</SelectItem>
                    <SelectItem value="air">AIR</SelectItem>
                    <SelectItem value="manu">MANU / Neutral citation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date format</Label>
                <Select defaultValue="dmy">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dmy">DD MMM YYYY</SelectItem>
                    <SelectItem value="iso">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <Languages className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-semibold">Drafting & AI defaults</h2>
            </div>
            <ul className="space-y-3">
              {[
                {
                  id: "auto-summary",
                  label: "Auto-summarise uploads",
                  desc: "Generate a one-page digest as soon as a document finishes processing.",
                  on: true,
                },
                {
                  id: "citation-check",
                  label: "Citation verification",
                  desc: "Flag citations that cannot be matched against a reported judgment.",
                  on: true,
                },
                {
                  id: "hindi-ocr",
                  label: "Devanagari OCR",
                  desc: "Run a second OCR pass for Hindi and Marathi records.",
                  on: false,
                },
              ].map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3">
                  <div>
                    <Label htmlFor={r.id} className="text-sm font-medium">
                      {r.label}
                    </Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                  <Switch id={r.id} defaultChecked={r.on} />
                </li>
              ))}
            </ul>
          </section>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-5">
          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <Shield className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-semibold">Access & authentication</h2>
            </div>
            <ul className="space-y-3">
              {[
                {
                  id: "mfa",
                  label: "Two-factor authentication",
                  desc: "Require an authenticator code for every new device.",
                  on: true,
                },
                {
                  id: "sso",
                  label: "Chamber SSO",
                  desc: "Allow associates to sign in with the firm identity provider.",
                  on: false,
                },
                {
                  id: "privilege",
                  label: "Privilege lock on exports",
                  desc: "Watermark and log every case bundle leaving the workspace.",
                  on: true,
                },
              ].map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3">
                  <div>
                    <Label htmlFor={r.id} className="text-sm font-medium">
                      {r.label}
                    </Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                  <Switch id={r.id} defaultChecked={r.on} />
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Session timeout</Label>
                <Select defaultValue="60">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pw">Change password</Label>
                <Input id="pw" type="password" placeholder="••••••••••" className="mt-1.5" />
              </div>
            </div>
            <Button className="mt-4" variant="outline" disabled>
              <KeyRound className="mr-2 h-4 w-4" /> Update credentials
            </Button>
          </section>

          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <MonitorSmartphone className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-semibold">Recent activity</h2>
            </div>
            <ul className="divide-y">
              {securityEvents.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium">{e.event}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.device} · {e.location}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {e.time}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <Plug className="h-4 w-4 text-primary" />
              <div>
                <h2 className="font-display text-base font-semibold">Connected services</h2>
                <p className="text-xs text-muted-foreground">
                  Interface placeholders — no live connections are made from this build.
                </p>
              </div>
            </div>
            <ul className="divide-y">
              {integrations.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-4 py-4">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                      {i.category === "Infrastructure" ? (
                        <Database className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{i.name}</p>
                        <Badge variant="outline" className="text-[10px]">
                          {i.category}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", statusTone[i.status])}>
                          {i.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{i.description}</p>
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground">{i.detail}</p>
                    </div>
                  </div>
                  <Switch
                    checked={i.enabled}
                    onCheckedChange={() => toggleIntegration(i.id)}
                    aria-label={`Toggle ${i.name}`}
                  />
                </li>
              ))}
            </ul>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
