import { useCallback, useEffect, useRef, useState } from "react";

// Chat threads persisted per user + scope (mentor id or "assistant") in localStorage.
const read = (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
const write = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v.slice(0, 20))); } catch { /* storage full or blocked */ } };
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

export function useChatThreads(userId, scope, makeWelcome) {
  const key = `pw_chat_${userId || "guest"}_${scope}`;
  const [threads, setThreads] = useState(() => read(key));
  const [activeId, setActiveId] = useState(null);

  useEffect(() => { const t = read(key); setThreads(t); setActiveId(t[0]?.id || null); }, [key]);

  const persist = useCallback((next) => { setThreads(next); write(key, next); }, [key]);
  const active = threads.find((t) => t.id === activeId) || null;
  const messages = active ? active.messages : (makeWelcome ? makeWelcome() : []);

  // Refs keep async sends (user message, then reply seconds later) on the same thread.
  const activeRef = useRef(null);
  const threadsRef = useRef(threads);
  activeRef.current = activeId;
  threadsRef.current = threads;

  const setMessages = useCallback((updater) => {
    let list = threadsRef.current;
    let id = activeRef.current;
    if (!list.find((t) => t.id === id)) {
      id = uid();
      list = [{ id, title: "New chat", updated: Date.now(), messages: makeWelcome ? makeWelcome() : [] }, ...list];
      activeRef.current = id;
      setActiveId(id);
    }
    const next = list.map((t) => {
      if (t.id !== id) return t;
      const msgs = typeof updater === "function" ? updater(t.messages) : updater;
      const firstUser = msgs.find((m) => (m.from || m.role) === "user");
      const title = firstUser ? String(firstUser.text ?? firstUser.content).slice(0, 40) : t.title;
      return { ...t, messages: msgs, title, updated: Date.now() };
    }).sort((a, b) => b.updated - a.updated);
    threadsRef.current = next;
    setThreads(next);
    write(key, next);
  }, [key, makeWelcome]);

  const newChat = useCallback(() => setActiveId(null), []);
  const remove = useCallback((id) => { const next = threads.filter((t) => t.id !== id); persist(next); if (id === activeId) setActiveId(next[0]?.id || null); }, [threads, activeId, persist]);
  const clearAll = useCallback(() => { persist([]); setActiveId(null); }, [persist]);

  return { threads, activeId: active?.id || null, setActiveId, messages, setMessages, newChat, remove, clearAll };
}
