import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";

export type NotificationType =
  | "Upcoming Hearing"
  | "Deadline Alert"
  | "New Similar Judgment"
  | "Document Processed"
  | "AI Report Ready"
  | string;

export interface CenterNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  created_at: string;
  is_read: boolean;
}

export function useNotificationCenter() {
  const queryClient = useQueryClient();
  const [type, setType] = useState<NotificationType | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.get(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => notificationsApi.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const filtered = useMemo(
    () =>
      notifications.filter(
        (n: CenterNotification) =>
          (type === "all" || n.type === type) && (!unreadOnly || !n.is_read)
      ),
    [notifications, type, unreadOnly]
  );

  const counts = useMemo(() => {
    const map = new Map<NotificationType | "all", number>();
    map.set("all", notifications.length);
    for (const n of notifications) {
      map.set(n.type, (map.get(n.type) ?? 0) + 1);
    }
    return map;
  }, [notifications]);

  return {
    items: filtered,
    counts,
    unread: notifications.filter((n: CenterNotification) => !n.is_read).length,
    type,
    setType,
    unreadOnly,
    setUnreadOnly,
    toggleRead: (id: string) => markReadMutation.mutate(id),
    markAllRead: () => {
      // In a real app we'd have a markAllRead API, but for now we can just rely on individual or a future bulk endpoint.
      // We will loop over unread and mark them read.
      notifications
        .filter((n: CenterNotification) => !n.is_read)
        .forEach((n: CenterNotification) => markReadMutation.mutate(n.id));
    },
    dismiss: (id: string) => deleteMutation.mutate(id),
    clearAll: () => clearAllMutation.mutate(),
    isLoading,
  };
}
