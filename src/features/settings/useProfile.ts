import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/lib/api";

export interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const defaultNotificationPreferences: NotificationPreference[] = [
  {
    id: "np-hearings",
    label: "Hearing reminders",
    description: "Alert 48 and 12 hours before every listed matter.",
    enabled: true,
  },
  {
    id: "np-deadlines",
    label: "Limitation & filing deadlines",
    description: "Daily digest of statutory deadlines falling within 14 days.",
    enabled: true,
  },
  {
    id: "np-judgments",
    label: "Similar judgment alerts",
    description: "Notify when a new reported judgment matches a saved proposition.",
    enabled: true,
  },
  {
    id: "np-reports",
    label: "AI report completion",
    description: "Ping when a case analysis or contradiction digest finishes.",
    enabled: false,
  },
  {
    id: "np-weekly",
    label: "Weekly practice summary",
    description: "Monday morning roll-up of caseload, outcomes and pending drafts.",
    enabled: true,
  },
];

export function useProfile() {
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState<NotificationPreference[]>(defaultNotificationPreferences);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.get(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => profileApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    profile: profile || {
      designation: "Advocate",
      barCouncilId: "",
      phone: "",
      bio: "",
      practiceAreas: [],
    },
    firm: profile?.firm || { name: "", role: "" },
    prefs,
    togglePref: (id: string) =>
      setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))),
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isLoading,
  };
}
