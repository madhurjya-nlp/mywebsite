import { useCallback, useEffect, useRef, useState } from "react";

type Message = {
  from: "user" | "bot";
  text: string;
};

const RESPONSES: Record<string, string> = {
  default:
    "I can talk about film, direction, cinematography, editing, or Madhurjya's work. What would you like to know?",

  who: [
    "Madhurjya Saikia is a creative director, cinematographer, and editor based in Northeast India. He works across brand content, podcasts, documentaries, and short films.",
    "He co-founded GOAT Socials (GoSo), a creative agency helping regional brands look modern, cinematic, and internet-aware.",
  ].join(" "),

  experience:
    "He's been working professionally since 2017, starting with independent YouTube content. His experience spans agency creative direction, podcast production, documentary cinematography, short films, drone operation, and brand campaigns for regional and national clients.",

  projects: [
    "Some key projects include:",
    "— GOAT Socials / GoSo: Creative direction and production for regional brands",
    "— Tea Pod / Tea Pot Talks: Podcast identity, direction, and editing",
    "— IFP short film contest entries (2019, 2021, 2023)",
    "— Drone broadcast work for Doordarshan and tourism boards",
    "— Freelance editing for Growthbees Marketing Agency",
    "— Vinyl Sessions × NEUM: Pop-up music event visual identity",
  ].join("\n"),

  services: [
    "Services include: creative direction, cinematography, video editing, aerial/drone cinematography, visual identity design, social content production, and podcast production.",
    "Every project is approached with attention to rhythm, clarity, and intentional framing.",
  ].join(" "),

  contact:
    "You can reach out via the contact section on this site, or connect through the agency GOAT Socials for brand collaborations.",

  filmmaking:
    "Great filmmaking is about rhythm and intent. Every frame, cut, and sound choice should serve the story. Madhurjya's philosophy centers on staying modern without losing a sense of place—bringing Northeast Indian stories to the forefront with cinematic honesty.",

  northeast:
    "A lot of Madhurjya's work is rooted in Northeast India—documenting its stories, working with regional brands, and building visual systems that reflect the culture and landscape of the region.",

  gear: "The right tool depends on the story. His work spans mirrorless cinema cameras for documentaries, drones for aerials, and practical lighting setups that keep productions lean and mobile.",
};

const KEYWORDS: [RegExp, string][] = [
  [/who|madhurjya|about|are you/i, "who"],
  [/experience|background|worked|done/i, "experience"],
  [/project|work|portfolio|what.*do/i, "projects"],
  [/service|offer|help/i, "services"],
  [/contact|reach|email|hire|connect/i, "contact"],
  [/film|cinema|movie|philosophy|approach/i, "filmmaking"],
  [/northeast|assam|region/i, "northeast"],
  [/gear|camera|lens|equipment|shoot.*with/i, "gear"],
];

function findResponse(input: string): string {
  for (const [pattern, key] of KEYWORDS) {
    if (pattern.test(input)) {
      return RESPONSES[key];
    }
  }
  return RESPONSES.default;
}

export function FilmChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hey! I'm the film chat. Ask me about Madhurjya's work, filmmaking, or anything cinema." },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text }]);
    setTimeout(() => {
      const reply = findResponse(text);
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    }, 400);
  }, [input]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") send();
    },
    [send],
  );

  return (
    <>
      <button
        className={`film-chat-toggle${open ? " film-chat-toggle--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open film chat"}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </>
          )}
        </svg>
      </button>

      <div className={`film-chat${open ? " film-chat--open" : ""}`}>
        <div className="film-chat__header">
          <span>Film Chat</span>
          <span className="film-chat__status">● online</span>
        </div>
        <div className="film-chat__messages" ref={listRef}>
          {messages.map((m, i) => (
            <div key={i} className={`film-chat__msg film-chat__msg--${m.from}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="film-chat__input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about film..."
            aria-label="Chat message"
          />
          <button onClick={send} aria-label="Send">
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
