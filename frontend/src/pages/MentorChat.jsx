import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Send, History, Plus, Trash2, Globe2, Type } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useChatThreads } from "../utils/chatHistory";
import Layout from "../components/Layout";
import Avatar from "../components/Avatar";
import BackButton from "../components/BackButton";
import Loader from "../components/Loader";
import { mentorApi } from "../services/api";
import { getMentorImage } from "../data/mentorImages";
import FormattedText from "../components/FormattedText";

const mentorLanguages = [
  { code: "en", label: "English", detail: "English script", Icon: Globe2 },
  { code: "hi-latn", label: "Hindi", detail: "Roman", Icon: Type },
];

const storageKey = (mentorId) => `pw_mentor_language_${mentorId}`;
const welcomeText = (mentor, code) => {
  const prompts = {
    "hi-latn": `Namaste! Main ${mentor.name}, aapka ${mentor.profession} mentor hoon. Aaj aap kis baare mein baat karna chahenge?`,
  };
  return prompts[code] || `Hi! I'm ${mentor.name}, your ${mentor.profession}. What would you like to talk about today?`;
};

export default function MentorChat() {
  const { mentor: mentorId } = useParams();
  const { user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [mentorLanguage, setMentorLanguage] = useState(() => {
    const saved = localStorage.getItem(storageKey(mentorId));
    return saved === "en" || saved === "hi-latn" ? saved : "hi-latn";
  });
  const welcome = useCallback(
    () => (mentor ? [{ id: "welcome", from: "mentor", text: welcomeText(mentor, mentorLanguage) }] : []),
    [mentor, mentorLanguage]
  );
  const { threads, activeId, setActiveId, messages, setMessages, newChat, remove } = useChatThreads(user?.id, `mentor_${mentorId}`, welcome);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;
    mentorApi.getById(mentorId).then((data) => { if (active) setMentor(data); });
    return () => { active = false; };
  }, [mentorId]);

  useEffect(() => {
    localStorage.setItem(storageKey(mentorId), mentorLanguage);
  }, [mentorId, mentorLanguage]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const handleLanguageChange = (code) => {
    if (code === mentorLanguage) return;
    setMentorLanguage(code);
    if (mentor && activeId) {
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        from: "mentor",
        text: welcomeText(mentor, code),
      }]);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !mentor || typing) return;
    setMessages((current) => [...current, { id: crypto.randomUUID(), from: "user", text }]);
    setInput("");
    setTyping(true);
    const history = messages
      .filter((message) => message.id !== "welcome")
      .slice(-10)
      .map((message) => ({ role: message.from === "user" ? "user" : "assistant", content: message.text }));
    const response = await mentorApi.sendMessage(mentor, text, history, mentorLanguage);
    setTyping(false);
    setMessages((current) => [...current, { id: crypto.randomUUID(), from: "mentor", text: response.reply, sources: response.sources }]);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (!mentor) return <Layout><Loader label="Connecting to mentor..." /></Layout>;

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-9rem)] w-full flex-col overflow-hidden border-y border-border bg-off-white shadow-card lg:min-h-[calc(100vh-10rem)] lg:rounded-2xl lg:border">
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-border bg-light-sage/95 px-4 py-3 backdrop-blur-sm sm:px-6">
          <BackButton to={`/mentors/${mentor.id}`} className="h-9 w-9" />
          <Avatar name={mentor.name} color={mentor.avatarColor} image={getMentorImage(mentor)} size={44} />
          <div>
            <p className="font-heading text-base font-bold text-dark-green">{mentor.name}</p>
            <p className="type-meta">AI mentor · always available</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-off-white p-1" role="group" aria-label="Response language">
              {mentorLanguages.map((option) => {
                const Icon = option.Icon;
                return <button key={option.code} type="button" onClick={() => handleLanguageChange(option.code)} aria-pressed={mentorLanguage === option.code} title={`${option.label} — ${option.detail}`} className={`focus-ring flex h-9 items-center gap-1 rounded-md px-2 text-xs font-semibold ${mentorLanguage === option.code ? "bg-dark-green text-off-white" : "text-dark-green hover:bg-light-sage"}`}><Icon size={15} aria-hidden="true" /><span className="hidden xl:inline">{option.label}</span></button>;
              })}
            </div>
            <button type="button" onClick={newChat} className="focus-ring flex h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold text-dark-green hover:bg-light-sage"><Plus size={14} aria-hidden="true" />New</button>
            <button type="button" onClick={() => setShowHistory((value) => !value)} aria-expanded={showHistory} className="focus-ring flex h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold text-dark-green hover:bg-light-sage"><History size={14} aria-hidden="true" />History ({threads.length})</button>
          </div>
        </div>

        {showHistory && (
          <div className="max-h-44 overflow-y-auto border-b border-border bg-cream px-3 py-2 sm:px-6">
            {threads.length === 0 ? <p className="py-2 text-sm text-text-muted">No saved conversations yet.</p> : threads.map((thread) => (
              <div key={thread.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${thread.id === activeId ? "bg-light-sage" : "hover:bg-light-sage/50"}`}>
                <button type="button" className="min-w-0 flex-1 truncate text-left font-medium text-text-dark" onClick={() => { setActiveId(thread.id); setShowHistory(false); }}>
                  {thread.title}<span className="ml-2 text-xs font-normal text-text-muted">{new Date(thread.updated).toLocaleDateString()}</span>
                </button>
                <button type="button" aria-label="Delete conversation" onClick={() => remove(thread.id)} className="text-text-muted hover:text-coral"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}

        {!activeId && (
          <section className="border-b border-border bg-cream px-5 py-5 sm:px-8">
            <div className="mx-auto max-w-3xl">
              <p className="type-eyebrow">Choose how your mentor replies</p>
              <h1 className="mt-1 font-heading text-2xl font-bold text-dark-green">Start in the language that feels natural</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">You can type Hindi in Roman letters. The mentor will understand it and reply in the selected language and script.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Choose mentor response language">
                  {mentorLanguages.map((option) => {
                    const Icon = option.Icon;
                    return <button key={option.code} type="button" onClick={() => handleLanguageChange(option.code)} aria-pressed={mentorLanguage === option.code} className={`focus-ring flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${mentorLanguage === option.code ? "border-dark-green bg-dark-green text-off-white" : "border-border bg-off-white text-dark-green hover:bg-light-sage"}`}><Icon size={16} aria-hidden="true" />{option.label} <span className="text-xs opacity-80">({option.detail})</span></button>;
                  })}
                </div>
                <span className="text-xs text-text-muted">You can change this anytime above.</span>
              </div>
            </div>
          </section>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-8 lg:px-16 xl:px-24" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
              {message.from === "mentor" && <Avatar name={mentor.name} color={mentor.avatarColor} image={getMentorImage(mentor)} size={30} className="mr-2 mt-1" />}
              <div className={`max-w-[92%] rounded-2xl px-4 py-3 text-base leading-7 sm:max-w-[78%] ${message.from === "user" ? "rounded-br-sm bg-dark-green text-off-white" : "rounded-bl-sm bg-light-sage text-text-dark"}`}>
                {message.from === "mentor" ? <FormattedText>{message.text}</FormattedText> : message.text}
                {message.sources?.length > 0 && <div className="mt-2 border-t border-border pt-2 text-xs text-text-muted">From mentor notes: {message.sources.join(", ")}</div>}
              </div>
            </div>
          ))}
          {typing && <div className="flex items-center gap-2"><Avatar name={mentor.name} color={mentor.avatarColor} image={getMentorImage(mentor)} size={30} /><div className="rounded-2xl rounded-bl-sm bg-light-sage px-4 py-3 text-base text-text-muted">Thinking…</div></div>}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-2 border-t border-border bg-off-white p-3 sm:p-4 sm:px-8 lg:px-16 xl:px-24">
          <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder={`Ask ${mentor.name} anything...`} aria-label="Message mentor" className="focus-ring min-h-11 flex-1 rounded-lg border border-border bg-cream px-4 py-2.5 text-base outline-none sm:text-sm" />
          <button type="button" onClick={handleSend} disabled={!input.trim() || typing} className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-dark-green text-off-white disabled:opacity-40" aria-label="Send message"><Send size={18} aria-hidden="true" /></button>
        </div>
      </div>
    </Layout>
  );
}
