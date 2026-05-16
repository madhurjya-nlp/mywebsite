import { useCallback, useEffect, useRef, useState } from "react";

type Message = { from: "user" | "bot"; text: string };

const FALLBACKS: Record<string, string> = {
  default:
    "I can talk about film, Instagram/social media, or Northeast Indian culture. What interests you?",
  who: "Madhurjya Saikia is a creative director, cinematographer, and editor based in Northeast India. He co-founded GOAT Socials (GoSo).",
  film: "Great cinema is about rhythm and intent — every frame, cut, and sound choice serves the story.",
  insta: "Instagram content that works: strong visual consistency, authentic storytelling, and platform-native formats.",
  culture: "Northeast India is a cultural crossroads of 8 states with hundreds of indigenous communities, languages, and traditions.",
};
const KEYWORD_FALLBACKS: [RegExp, string][] = [
  [/who|madhurjya|about/i, "who"],
  [/film|cinema|movie|director|edit/i, "film"],
  [/insta|social|reel|content/i, "insta"],
  [/northeast|culture|assam|nagaland|meghalaya/i, "culture"],
];

function fallback(input: string): string {
  for (const [re, key] of KEYWORD_FALLBACKS) {
    if (re.test(input)) return FALLBACKS[key];
  }
  return FALLBACKS.default;
}

type Suggestion = { label: string; query: string };
const SUGGESTIONS: Suggestion[] = [
  { label: "Best Indian filmmakers", query: "top 10 Indian filmmakers and their styles" },
  { label: "Instagram strategy", query: "how to grow on Instagram with reels" },
  { label: "NE India culture", query: "tell me about Northeast Indian culture" },
  { label: "Filmmaking tips", query: "essential filmmaking tips for beginners" },
  { label: "Assamese food", query: "famous Assamese dishes" },
  { label: "Contact", query: "how to reach Madhurjya" },
];

export function FilmChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([
    { from: "bot", text: "Hey! Ask me about film, Instagram, or Northeast Indian culture." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs, loading]);

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    setMsgs((p) => [...p, { from: "user", text: q }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history: msgs }),
      });
      const data = await res.json();
      setMsgs((p) => [...p, { from: "bot", text: data.reply || fallback(q) }]);
    } catch {
      setMsgs((p) => [...p, { from: "bot", text: fallback(q) }]);
    }
    setLoading(false);
  }, [msgs, loading]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => { if (e.key === "Enter") send(input); },
    [send, input],
  );

  return (
    <>
      <button
        className={`film-chat-toggle${open ? " film-chat-toggle--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
        </svg>
      </button>

      <div className={`film-chat${open ? " film-chat--open" : ""}`}>
        <div className="film-chat__header">
          <span>Film & Culture Chat</span>
          <span className="film-chat__status">● online</span>
        </div>
        <div className="film-chat__messages" ref={listRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`film-chat__msg film-chat__msg--${m.from}`}>{m.text}</div>
          ))}
          {loading && (
            <div className="film-chat__msg film-chat__msg--bot film-chat__msg--typing">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          )}
          {msgs.length === 1 && !loading && (
            <div className="film-chat__suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s.label} className="film-chat__chip" onClick={() => send(s.query)}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="film-chat__input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about film, Instagram, NE culture..."
            aria-label="Chat message"
          />
          <button onClick={() => send(input)} disabled={loading} aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
