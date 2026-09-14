import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  conversations as seedConversations,
  mockAssistantResponse,
  type ChatMessage,
  type Conversation,
  type QuickActionId,
} from "@/data/assistant";

/** Future integration point: replace the simulated stream with a real API call. */
export function useAssistant() {
  const [threads, setThreads] = useState<Conversation[]>(seedConversations);
  const [activeId, setActiveId] = useState<string>(seedConversations[0]!.id);
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState<string>("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const active = useMemo(
    () => threads.find((t) => t.id === activeId) ?? threads[0]!,
    [threads, activeId],
  );

  const send = useCallback(
    (prompt: string, action?: QuickActionId) => {
      const text = prompt.trim();
      if (!text || thinking) return;

      const userMessage: ChatMessage = {
        id: `m-${Date.now()}`,
        role: "user",
        content: text,
        at: new Date().toISOString(),
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeId
            ? {
                ...t,
                messages: [...t.messages, userMessage],
                preview: text,
                updatedAt: userMessage.at,
              }
            : t,
        ),
      );
      setThinking(true);
      setStreaming("");

      const response = mockAssistantResponse(text, action);
      const words = response.content.split(" ");

      const start = setTimeout(() => {
        setThinking(false);
        let i = 0;
        const step = () => {
          i = Math.min(words.length, i + 3);
          setStreaming(words.slice(0, i).join(" "));
          if (i < words.length) {
            timers.current.push(setTimeout(step, 28));
            return;
          }
          const assistantMessage: ChatMessage = {
            id: `m-${Date.now()}-a`,
            role: "assistant",
            content: response.content,
            at: new Date().toISOString(),
            ...(response.citations ? { citations: response.citations } : {}),
          };
          setThreads((prev) =>
            prev.map((t) =>
              t.id === activeId
                ? {
                    ...t,
                    messages: [...t.messages, assistantMessage],
                    updatedAt: assistantMessage.at,
                  }
                : t,
            ),
          );
          setStreaming("");
        };
        timers.current.push(setTimeout(step, 40));
      }, 850);
      timers.current.push(start);
    },
    [activeId, thinking],
  );

  const newThread = useCallback(() => {
    const id = `conv-${Date.now()}`;
    const thread: Conversation = {
      id,
      title: "Untitled consultation",
      caseNumber: "CRL.A. 482/2024",
      updatedAt: new Date().toISOString(),
      preview: "No messages yet",
      messages: [],
    };
    setThreads((prev) => [thread, ...prev]);
    setActiveId(id);
  }, []);

  const sorted = useMemo(
    () => [...threads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [threads],
  );

  return {
    threads: sorted,
    active,
    activeId: active.id,
    select: setActiveId,
    newThread,
    send,
    thinking,
    streaming,
    busy: thinking || streaming.length > 0,
  };
}
