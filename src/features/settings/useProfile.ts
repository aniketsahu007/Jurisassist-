import { useState } from "react";
import {
  lawyerProfile,
  firmInfo,
  apiKeys,
  billing,
  notificationPreferences,
  type NotificationPreference,
} from "@/data/profile";

/** Future integration point: replace with FastAPI-backed profile queries. */
export function useProfile() {
  const [prefs, setPrefs] = useState<NotificationPreference[]>(notificationPreferences);

  return {
    profile: lawyerProfile,
    firm: firmInfo,
    apiKeys,
    billing,
    prefs,
    togglePref: (id: string) =>
      setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))),
  };
}
