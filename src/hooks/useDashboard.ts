import { useEffect, useState } from "react";
import {
  activityFeed,
  notifications,
  dashboardMetrics,
  casesByStatus,
  hearingsOverTime,
  caseTypeMix,
} from "@/data/dashboard";

/** Future integration point: replace with FastAPI-backed queries. */
export function useDashboard() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return {
    loading,
    metrics: dashboardMetrics,
    activity: activityFeed,
    notifications,
    casesByStatus,
    hearingsOverTime,
    caseTypeMix,
  };
}

export function useNotifications() {
  return {
    items: notifications,
    unread: notifications.filter((n) => !n.read).length,
  };
}
