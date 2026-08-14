import { useMemo, useState } from "react";
import {
  notificationCenter,
  type CenterNotification,
  type NotificationType,
} from "@/data/notifications";

/** Future integration point: replace with FastAPI-backed notification queries. */
export function useNotificationCenter() {
  const [items, setItems] = useState<CenterNotification[]>(notificationCenter);
  const [type, setType] = useState<NotificationType | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const filtered = useMemo(
    () =>
      items.filter(
        (n) => (type === "all" || n.type === type) && (!unreadOnly || !n.read),
      ),
    [items, type, unreadOnly],
  );

  const counts = useMemo(() => {
    const map = new Map<NotificationType | "all", number>();
    map.set("all", items.length);
    for (const n of items) map.set(n.type, (map.get(n.type) ?? 0) + 1);
    return map;
  }, [items]);

  return {
    items: filtered,
    counts,
    unread: items.filter((n) => !n.read).length,
    type,
    setType,
    unreadOnly,
    setUnreadOnly,
    toggleRead: (id: string) =>
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))),
    markAllRead: () => setItems((prev) => prev.map((n) => ({ ...n, read: true }))),
    dismiss: (id: string) => setItems((prev) => prev.filter((n) => n.id !== id)),
  };
}
