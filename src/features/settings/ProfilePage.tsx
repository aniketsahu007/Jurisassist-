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
import { useState } from "react";
import { useProfile } from "./useProfile";
import { useAuth } from "@/features/auth/AuthProvider";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { EditProfileModal } from "./EditProfileModal";

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
  const { profile, firm, prefs, togglePref } = useProfile();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const displayProfile = { 
    ...profile, 
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || profile.name || "",
    email: user?.email || profile.email || "",
    initials: (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || profile.initials || "U").toUpperCase(),
    practiceAreas: profile.practiceAreas || [],
    courtsOfPractice: [], // Can be added later if needed
    languages: ["English"], // Can be added later if needed
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <header className="panel flex flex-wrap items-center gap-5 p-6">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary text-lg text-primary-foreground">
            {displayProfile.initials}
          </AvatarFallback>
          {user?.user_metadata?.avatar_url && (
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-full w-full object-cover rounded-full" />
          )}
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-eyebrow">Profile</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {displayProfile.designation} {displayProfile.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {firm.role}, {firm.name} · Enrolled {displayProfile.enrolmentYear} · Bar Council ID{" "}
            <span className="font-mono">{displayProfile.barCouncilId}</span>
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>Edit profile</Button>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="min-w-0 space-y-5 lg:col-span-2">
          <Panel icon={ScrollText} title="Practitioner details" subtitle="Public chamber profile">
            <p className="text-sm text-muted-foreground">{displayProfile.bio}</p>
            <Separator className="my-4" />
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-eyebrow">Email</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {displayProfile.email}
                </dd>
              </div>
              <div>
                <dt className="text-eyebrow">Phone</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {displayProfile.phone}
                </dd>
              </div>
              <div>
                <dt className="text-eyebrow">Practice areas</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {displayProfile.practiceAreas.map((a) => (
                    <Badge key={a} variant="secondary" className="text-[11px]">
                      {a}
                    </Badge>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-eyebrow">Courts of practice</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {displayProfile.courtsOfPractice.map((c) => (
                    <Badge key={c} variant="outline" className="text-[11px]">
                      {c}
                    </Badge>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-eyebrow">Languages</dt>
                <dd className="mt-1 text-sm">{displayProfile.languages.join(", ")}</dd>
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
            subtitle="Developer access"
          >
            <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg">
              <KeyRound className="w-8 h-8 mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm font-medium">API access coming soon</p>
              <p className="text-xs text-muted-foreground mt-1">
                You will be able to generate API keys here to connect JurisAssist with your firm's internal tools.
              </p>
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel
            icon={theme === "dark" ? Moon : Sun}
            title="Appearance"
            subtitle="Theme preference"
          >
            <div className="flex items-center justify-between rounded-lg bg-surface-2 p-3">
              <div>
                <p className="text-sm font-medium">Dark mode</p>
                <p className="text-xs text-muted-foreground">Currently using the {theme} theme.</p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggle}
                aria-label="Toggle dark mode"
              />
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
                  <Switch id={p.id} checked={p.enabled} onCheckedChange={() => togglePref(p.id)} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            icon={CreditCard}
            title="Billing"
            subtitle="Current plan"
          >
            <div className="rounded-lg border bg-surface-2 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Early Access (Free Plan)</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You are currently using JurisAssist on an early access free plan.
                  </p>
                </div>
                <Badge variant="secondary">Free</Badge>
              </div>
            </div>
          </Panel>
        </div>
      </div>
      <EditProfileModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} />
    </div>
  );
}
