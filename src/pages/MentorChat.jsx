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

  useEffect(() => {
    mentorApi.getById(mentorId).then((data) => {
      setMentor(data);
      setMessages([
        {
          id: "welcome",
          from: "mentor",
          text: `Hi! I'm ${data.name}, your ${data.profession}. What would you like to talk about today?`,
        },
      ]);
    });
  }, [mentorId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !mentor) return;
    const userMsg = { id: crypto.randomUUID(), from: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    const res = await mentorApi.sendMessage(mentor, text);
    setTyping(false);
    setMessages((m) => [...m, { id: crypto.randomUUID(), from: "mentor", text: res.reply }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!mentor) {
    return (
      <Layout>
        <Loader label="Connecting to mentor..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto flex h-[calc(100vh-11rem)] max-w-2xl flex-col overflow-hidden rounded-xl2 border border-border bg-off-white shadow-card lg:h-[calc(100vh-9rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-light-sage/40 px-4 py-3">
          <BackButton to={`/mentors/${mentor.id}`} className="h-9 w-9" />
          <Avatar name={mentor.name} color={mentor.avatarColor} size={40} />
          <div>
            <p className="font-heading text-sm font-bold text-dark-green">{mentor.name}</p>
            <p className="text-xs text-text-muted">{mentor.profession} · AI Mentor</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              {msg.from === "mentor" && <Avatar name={mentor.name} color={mentor.avatarColor} size={30} className="mr-2 mt-1" />}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.from === "user"
                    ? "rounded-br-sm bg-dark-green text-off-white"
                    : "rounded-bl-sm bg-light-sage text-text-dark"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex items-center gap-2">
              <Avatar name={mentor.name} color={mentor.avatarColor} size={30} />
              <div className="rounded-2xl rounded-bl-sm bg-light-sage px-4 py-2.5 text-sm text-text-muted">
                typing...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 rounded-full border border-border bg-cream px-4 py-2.5 text-sm outline-none focus:border-dark-green"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dark-green text-off-white disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </Layout>
  );
}
