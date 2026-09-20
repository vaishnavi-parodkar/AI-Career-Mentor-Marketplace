import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import Layout from "../components/Layout";
import Avatar from "../components/Avatar";
import BackButton from "../components/BackButton";
import Loader from "../components/Loader";
import { mentorApi } from "../services/api";

export default function MentorChat() {
  const { mentor: mentorId } = useParams();
  const [mentor, setMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { let active = true; mentorApi.getById(mentorId).then((data) => { if (active) { setMentor(data); setMessages(data ? [{ id: "welcome", from: "mentor", text: `Hi! I'm ${data.name}, your ${data.profession}. What would you like to talk about today?` }] : []); } }); return () => { active = false; }; }, [mentorId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  const handleSend = async () => { const text = input.trim(); if (!text || !mentor || typing) return; setMessages((current) => [...current, { id: crypto.randomUUID(), from: "user", text }]); setInput(""); setTyping(true); const response = await mentorApi.sendMessage(mentor, text); setTyping(false); setMessages((current) => [...current, { id: crypto.randomUUID(), from: "mentor", text: response.reply }]); };
  const handleKeyDown = (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); handleSend(); } };
  if (!mentor) return <Layout><Loader label="Connecting to mentor..." /></Layout>;
  return <Layout><div className="mx-auto flex h-[calc(100vh-11rem)] max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-off-white lg:h-[calc(100vh-9rem)]"><div className="flex items-center gap-3 border-b border-border bg-light-sage/40 px-4 py-3"><BackButton to={`/mentors/${mentor.id}`} className="h-9 w-9" /><Avatar name={mentor.name} color={mentor.avatarColor} size={40} /><div><p className="font-heading text-base font-bold text-dark-green">{mentor.name}</p><p className="type-meta">{mentor.profession} · AI mentor</p></div></div><div className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">{messages.map((message) => <div key={message.id} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>{message.from === "mentor" && <Avatar name={mentor.name} color={mentor.avatarColor} size={30} className="mr-2 mt-1" />}<div className={`max-w-[78%] rounded-2xl px-4 py-3 text-base leading-7 ${message.from === "user" ? "rounded-br-sm bg-dark-green text-off-white" : "rounded-bl-sm bg-light-sage text-text-dark"}`}>{message.text}</div></div>)}{typing && <div className="flex items-center gap-2"><Avatar name={mentor.name} color={mentor.avatarColor} size={30} /><div className="rounded-2xl rounded-bl-sm bg-light-sage px-4 py-3 text-base text-text-muted">Typing…</div></div>}<div ref={bottomRef} /></div><div className="flex items-center gap-2 border-t border-border p-3"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." aria-label="Message mentor" className="focus-ring min-h-11 flex-1 rounded-full border border-border bg-cream px-4 py-2.5 text-base outline-none sm:text-sm" /><button type="button" onClick={handleSend} disabled={!input.trim() || typing} className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dark-green text-off-white disabled:opacity-40" aria-label="Send message"><Send size={18} aria-hidden="true" /></button></div></div></Layout>;
}
