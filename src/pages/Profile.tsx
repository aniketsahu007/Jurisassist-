import {
  Building2,
  CreditCard,
  KeyRound,
  Mail,
  MapPin,
  Moon,
  Phone,
  Plus,
  ScrollText,
  Sun,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

function Panel({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: typeof KeyRound;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function ProfilePage() {
  const { profile, firm, apiKeys, billing, prefs, togglePref } = useProfile();
  const { theme, toggle } = useTheme();

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <header className="panel flex flex-wrap items-center gap-5 p-6">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary text-lg text-primary-foreground">
            {profile.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-eyebrow">Profile</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {profile.designation} {profile.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {firm.role}, {firm.name} · Enrolled {profile.enrolmentYear} · Bar Council ID{" "}
            <span className="font-mono">{profile.barCouncilId}</span>
          </p>
        </div>
        <Button variant="outline">Edit profile</Button>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="min-w-0 space-y-5 lg:col-span-2">
          <Panel icon={ScrollText} title="Practitioner details" subtitle="Public chamber profile">
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
            <Separator className="my-4" />
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-eyebrow">Email</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {profile.email}
                </dd>
              </div>
              <div>
                <dt className="text-eyebrow">Phone</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {profile.phone}
                </dd>
              </div>
              <div>
                <dt className="text-eyebrow">Practice areas</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {profile.practiceAreas.map((a) => (
                    <Badge key={a} variant="secondary" className="text-[11px]">
                      {a}
                    </Badge>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-eyebrow">Courts of practice</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {profile.courtsOfPractice.map((c) => (
                    <Badge key={c} variant="outline" className="text-[11px]">
                      {c}
                    </Badge>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-eyebrow">Languages</dt>
                <dd className="mt-1 text-sm">{profile.languages.join(", ")}</dd>
              </div>
            </dl>
          </Panel>

          <Panel icon={Building2} title="Firm information" subtitle="Registered entity details">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-eyebrow">Registered address</dt>
                <dd className="mt-1 flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {firm.address}
                </dd>
              </div>
              <div>
                <dt className="text-eyebrow">GSTIN</dt>
                <dd className="mt-1 font-mono text-sm">{firm.gstin}</dd>
              </div>
              <div>
                <dt className="text-eyebrow">Website</dt>
                <dd className="mt-1 text-sm">{firm.website}</dd>
              </div>
              <div>
                <dt className="text-eyebrow">Team</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" /> {firm.teamSize} members
                </dd>
              </div>
              <div>
                <dt className="text-eyebrow">Founded</dt>
                <dd className="mt-1 text-sm">{firm.founded}</dd>
              </div>
            </dl>
          </Panel>

          <Panel
            icon={KeyRound}
            title="API keys"
            subtitle="Placeholder UI — key management is not wired to a backend"
            action={
              <Button variant="outline" size="sm" disabled>
                <Plus className="mr-2 h-4 w-4" /> New key
              </Button>
            }
          >
            <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead className="hidden md:table-cell">Scope</TableHead>
                  <TableHead className="hidden sm:table-cell">Last used</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.label}</TableCell>
                    <TableCell className="font-mono text-xs">{k.maskedKey}</TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                      {k.scope}
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                      {k.lastUsed}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          k.status === "active"
                            ? "border-success/20 bg-success/10 text-success"
                            : "text-muted-foreground",
                        )}
                      >
                        {k.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel icon={theme === "dark" ? Moon : Sun} title="Appearance" subtitle="Theme preference">
            <div className="flex items-center justify-between rounded-lg bg-surface-2 p-3">
              <div>
                <p className="text-sm font-medium">Dark mode</p>
                <p className="text-xs text-muted-foreground">
                  Currently using the {theme} theme.
                </p>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggle} aria-label="Toggle dark mode" />
            </div>
          </Panel>

          <Panel icon={Mail} title="Notification settings" subtitle="Choose what reaches you">
            <ul className="space-y-3">
              {prefs.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Label htmlFor={p.id} className="text-sm font-medium">
                      {p.label}
                    </Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
                  </div>
                  <Switch
                    id={p.id}
                    checked={p.enabled}
                    onCheckedChange={() => togglePref(p.id)}
                  />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            icon={CreditCard}
            title="Billing"
            subtitle="Placeholder UI — no payment processing"
          >
            <div className="rounded-lg bg-surface-2 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{billing.plan}</p>
                <Badge variant="secondary">{billing.amount}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Renews {billing.renewal} · {billing.paymentMethod}
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Seats used</span>
                  <span>
                    {billing.seatsUsed} / {billing.seats}
                  </span>
                </div>
                <Progress
                  className="mt-1.5 h-1.5"
                  value={(billing.seatsUsed / billing.seats) * 100}
                />
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {billing.invoices.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-mono">{inv.id}</p>
                    <p className="text-muted-foreground">{inv.period}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{inv.amount}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        inv.status === "Paid"
                          ? "border-success/20 bg-success/10 text-success"
                          : "border-warning/20 bg-warning/10 text-warning",
                      )}
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-4 w-full" disabled>
              Manage billing
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
