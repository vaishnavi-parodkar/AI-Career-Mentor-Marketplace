import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChatThreads } from "../utils/chatHistory";
import { useLocation } from "react-router-dom";
import { Sparkles, X, Send, PanelRightClose, History, Plus, Trash2 } from "lucide-react";
import { assistantApi } from "../services/platformApi";
import { useLanguage } from "../i18n";

const welcomeMsg = () => [{ role: "assistant", content: "" }];

/** Floating AI assistant available on every page; opens as a collapsible sidebar. */
export default function FloatingAssistant() {
  const { language, t } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const { threads, activeId, setActiveId, messages, setMessages, newChat, remove } = useChatThreads(user?.id, "assistant", welcomeMsg);
  const [showHistory, setShowHistory] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const history = messages.filter((m) => m.content).slice(-10);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    try {
      const data = await assistantApi.ask(text, { history, language, page: location.pathname });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: error.message }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-dark-green text-off-white shadow-soft hover:bg-green lg:bottom-8 lg:right-8"
          aria-label={t("assistant.title")}
        >
          <Sparkles size={22} aria-hidden="true" />
        </button>
      )}

      {open && (
        <aside
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-off-white shadow-soft"
          aria-label={t("assistant.title")}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 font-heading text-lg font-bold text-dark-green">
              <Sparkles size={18} aria-hidden="true" /> {t("assistant.title")}
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={newChat} className="focus-ring flex h-9 w-9 items-center justify-center rounded-full hover:bg-light-sage" aria-label="New chat" title="New chat"><Plus size={18} aria-hidden="true" /></button>
              <button type="button" onClick={() => setShowHistory((v) => !v)} aria-expanded={showHistory} className="focus-ring flex h-9 w-9 items-center justify-center rounded-full hover:bg-light-sage" aria-label="Chat history" title="Chat history"><History size={18} aria-hidden="true" /></button>
              <button type="button" onClick={() => setOpen(false)} className="focus-ring flex h-9 w-9 items-center justify-center rounded-full hover:bg-light-sage" aria-label="Collapse">
                <PanelRightClose size={18} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="focus-ring flex h-9 w-9 items-center justify-center rounded-full hover:bg-light-sage" aria-label="Close and clear">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          {showHistory && (
            <div className="max-h-48 overflow-y-auto border-b border-border bg-cream px-3 py-2">
              {threads.length === 0 ? <p className="py-2 text-sm text-text-muted">No saved chats yet.</p> : threads.map((th) => (
                <div key={th.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${th.id === activeId ? "bg-light-sage" : "hover:bg-light-sage/50"}`}>
                  <button type="button" className="min-w-0 flex-1 truncate text-left font-medium text-text-dark" onClick={() => { setActiveId(th.id); setShowHistory(false); }}>{th.title}<span className="ml-2 text-xs font-normal text-text-muted">{new Date(th.updated).toLocaleDateString()}</span></button>
                  <button type="button" aria-label="Delete chat" onClick={() => remove(th.id)} className="text-text-muted hover:text-coral"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "ml-auto bg-dark-green text-off-white" : "bg-light-sage text-text-dark"}`}>
                {m.content || t("assistant.hello")}
              </div>
            ))}
            {busy && <div className="w-16 rounded-2xl bg-light-sage px-4 py-2.5 text-sm text-text-muted">...</div>}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("assistant.placeholder")}
              maxLength={2000}
              className="focus-ring min-h-11 flex-1 rounded-full border border-border bg-cream px-4 text-sm"
            />
            <button type="submit" disabled={busy || !input.trim()} className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-dark-green text-off-white disabled:opacity-50" aria-label={t("assistant.send")}>
              <Send size={17} aria-hidden="true" />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
