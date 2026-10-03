import { useCallback, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assistantApi } from "@/lib/api";
import type { QuickActionId } from "./AIAssistantPage";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: string;
  citations?: { id: string; label: string; source: string; court: string; passage: string }[];
  attachments?: { id: string; name: string; sizeLabel: string }[];
}

export interface Conversation {
  id: string;
  title: string;
  caseNumber: string;
  updatedAt: string;
  preview: string;
  messages: ChatMessage[];
}

function mapApiConversation(c: any): Conversation {
  return {
    id: c.id,
    title: c.title || "New Conversation",
    caseNumber: c.caseId || "N/A",
    updatedAt: c.updatedAt || new Date().toISOString(),
    preview: c.preview || "",
    messages: (c.messages || []).map((m: any) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      at: m.timestamp || new Date().toISOString(),
      citations: m.citations || [],
    })),
  };
}

export function useAssistant() {
  const queryClient = useQueryClient();

  // Fetch all conversations (sidebar list)
  const { data: threadsRaw, isLoading: loadingThreads } = useQuery({
    queryKey: ["assistant-conversations"],
    queryFn: () => assistantApi.getConversations(),
  });

  const threads: Conversation[] = (threadsRaw || []).map(mapApiConversation);

  const [activeId, setActiveId] = useState<string>("");
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // When user selects a thread from sidebar, load its messages
  const selectThread = useCallback(
    async (id: string) => {
      setActiveId(id);
      setThinking(false);
      try {
        const conv = await assistantApi.getConversation(id);
        const mapped = mapApiConversation(conv);
        setMessages(mapped.messages);
        setConversationId(id);
      } catch {
        setMessages([]);
        setConversationId(id);
      }
    },
    [],
  );

  // Build the "active" conversation object for the UI
  const threadMatch = threads.find((t) => t.id === activeId);
  const active: Conversation = threadMatch
    ? { ...threadMatch, messages }
    : {
        id: conversationId || "new",
        title: "New Conversation",
        caseNumber: "N/A",
        updatedAt: new Date().toISOString(),
        preview: "No messages yet",
        messages,
      };

  // Chat mutation — sends message to backend, backend persists both user + assistant messages
  const chatMutation = useMutation({
    mutationFn: (payload: any) => assistantApi.chat(payload),
    onMutate: (variables) => {
      // Optimistically add user message to the UI
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: variables.query,
          at: new Date().toISOString(),
        },
      ]);
    },
    onSuccess: (data) => {
      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          id: data.id || `assistant-${Date.now()}`,
          role: "assistant",
          content: data.content,
          at: data.timestamp || new Date().toISOString(),
          citations: data.citations || [],
        },
      ]);
      // Track the conversation ID returned by backend (for new conversations)
      if (data.conversationId) {
        setConversationId(data.conversationId);
        setActiveId(data.conversationId);
      }
      setThinking(false);
      // Refresh sidebar conversation list
      queryClient.invalidateQueries({ queryKey: ["assistant-conversations"] });
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error connecting to the server.",
          at: new Date().toISOString(),
        },
      ]);
      setThinking(false);
    },
  });

  const send = useCallback(
    (prompt: string, action?: QuickActionId, fallbackCaseId?: string) => {
      const text = prompt.trim();
      if (!text || thinking) return;

      setThinking(true);

      chatMutation.mutate({
        query: text,
        case_id: active.caseNumber !== "N/A" ? active.caseNumber : fallbackCaseId,
        conversation_id: conversationId,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      });
    },
    [active, thinking, chatMutation, messages, conversationId],
  );

  const newThread = useCallback(() => {
    setActiveId("");
    setMessages([]);
    setConversationId(null);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assistantApi.deleteConversation(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["assistant-conversations"] });
      if (deletedId === activeId || deletedId === conversationId) {
        newThread();
      }
    },
  });

  const deleteThread = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  return {
    threads,
    active,
    activeId: active.id,
    select: selectThread,
    newThread,
    deleteThread,
    send,
    thinking,
    streaming,
    busy: thinking || streaming.length > 0,
  };
}
