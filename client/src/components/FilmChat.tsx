import { useCallback, useEffect, useRef, useState } from "react";

type Message = {
  from: "user" | "bot";
  text: string;
};

const RESPONSES: Record<string, string> = {
  default:
    "I can talk about film, Instagram/social media, or Northeast Indian culture. What interests you?",

  /* ── Film ── */
  who: [
    "Madhurjya Saikia is a creative director, cinematographer, and editor based in Northeast India.",
    "He co-founded GOAT Socials (GoSo), works across brand content, podcasts, documentaries, and short films.",
  ].join(" "),

  experience:
    "Professional work since 2017 — from independent YouTube to agency creative direction, podcast production, documentary cinematography, drone operation, and brand campaigns. Every project is approached with an emphasis on rhythm, clarity, and intentional framing.",

  projects: [
    "Key projects:",
    "• GOAT Socials / GoSo — creative direction for regional brands",
    "• Tea Pod / Tea Pot Talks — podcast identity and production",
    "• IFP short film contest entries (2019, 2021, 2023)",
    "• Drone broadcast for Doordarshan & tourism boards",
    "• Vinyl Sessions × NEUM — pop-up music event visuals",
    "• Origii Apparels — spatial & brand presence",
  ].join("\n"),

  services:
    "Creative direction, cinematography, video editing, aerial/drone cinematography, visual identity, social content production, and podcast production.",

  filmmaking:
    "Great cinema is about rhythm and intent. Every frame, cut, and sound choice serves the story. Madhurjya's work stays modern without losing a sense of place — bringing Northeast Indian stories forward with cinematic honesty.",

  gear: "Mirrorless cinema cameras for docs, drones for aerials, practical lighting for lean, mobile productions. The tool follows the story.",

  /* ── Instagram / Social Media ── */
  instagram:
    "Instagram content that works: strong visual consistency, authentic storytelling, and platform-native formats. Madhurjya's agency GoSo builds scroll-stopping social content for regional brands — reels, carousels, and campaign visuals that feel modern and intentional.",

  social:
    "Social media strategy today is about rhythm: consistent posting, audience-aware content, and formats that fit each platform. GoSo focuses on helping regional brands build a visual language that stands out on Instagram, YouTube, and emerging platforms.",

  content:
    "Content that connects: know your audience, lead with visuals, keep it concise. For brands in Northeast India, the most effective content blends local culture with modern production value — that's where GoSo specialises.",

  reels:
    "Reels are the primary growth driver on Instagram. Key elements: hook in the first second, strong pacing, native music/trends, and clear CTA. Madhurjya's team produces brand reels that balance trend awareness with distinct visual identity.",

  /* ── Northeast India Culture ── */
  northeast:
    "Northeast India is a cultural crossroads — 8 states, hundreds of indigenous communities, languages, and traditions. From Bihu in Assam to Hornbill Festival in Nagaland, the region has a rich creative energy that's still under-represented in mainstream media. Madhurjya's work is rooted in telling these stories.",

  assam:
    "Assam's culture: Bihu (harvest festival), Satriya dance, traditional silk (muga, paat, eri), Assamese cinema, and a growing indie music scene. The food is incredible too — from masor tenga (sour fish curry) to pitha (rice cakes) and doi-chira (curd and flattened rice).",

  nagaland:
    "Nagaland's Hornbill Festival is one of India's most vibrant cultural events — tribal music, dance, crafts, and food. The state has a unique rock and metal music scene, and its storytelling traditions are deeply oral and visual.",

  meghalaya:
    "Meghalaya: living root bridges, rain-soaked landscapes, and a thriving indie music scene. The state has produced internationally recognised bands and is a growing hub for film and photography — its misty hills are a cinematographer's dream.",

  mizo:
    "Mizoram has a rich tradition of oral poetry, handloom weaving, and a unique film culture. Mizo language cinema has a distinct visual style — intimate, landscape-driven storytelling.",

  manipur:
    "Manipur has one of India's most dynamic film industries. Meitei cinema is known for its artistic ambition, and the state's classical dance (Ras Leela) and martial arts (Thang Ta) are culturally significant. The Sangai Festival showcases the state's creative diversity.",

  arunachal:
    "Arunachal Pradesh is home to 26 major tribes and over 100 sub-tribes. The Ziro Music Festival, Tawang Monastery, and traditional Apatani face-tattoo culture are just a few of its many cultural touchpoints.",

  sikkim:
    "Sikkim: India's first organic state, with a unique blend of Nepali, Bhutia, and Lepcha cultures. The Pang Lhabsol festival, Rumtek Monastery, and stunning Himalayan landscapes make it a filmmaker's paradise.",

  tripura:
    "Tripura's culture blends Bengali and indigenous Kokborok traditions. The Tripuri dance, Kharchi festival, and traditional handloom (risa textile) are highlights. The state has a growing film scene too.",

  ne_food:
    "Northeast Indian food is incredibly diverse: Assam's masor tenga and duck curry, Nagaland's smoked pork and bamboo shoot, Meghalaya's jadoh (rice and pork), Manipur's eromba and nga-thongba, Mizoram's vawksa rep (smoked pork), Arunachal's momos and thukpa, Sikkim's gya thuk and sel roti, Tripura's fish stew with bamboo shoot. Each state has its own distinct culinary identity.",

  ne_music:
    "The Northeast Indian music scene is legendary — from Nagaland's rock and metal bands to Meghalaya's indie-folk scene, Assam's modern electronica (like Platonic underneath) and classical traditions, Manipur's experimental music, and Mizoram's gospel-influenced rock. Bands like Abiogenesis, Alobo Naga, and many more have put the region on the global indie map.",

  ne_festivals:
    "Major festivals: Bihu (Assam, April), Hornbill (Nagaland, Dec), Sangai (Manipur, Nov), Ziro Music (Arunachal, Sep), Autumn Festival (Meghalaya), Chapchar Kut (Mizoram, Mar), Losar (Sikkim, Feb/Dec), Kharchi (Tripura, Jul). Each is a explosion of music, dance, colour, and community.",

  /* ── Contact ── */
  reach: [
    "Here are ways to reach Madhurjya:",
    "",
    "📧 Email: madhurjyasaikia@example.com",
    "📸 Instagram: @madhurjyasaikia",
    "🎬 GOAT Socials: @goat.socials",
    "🔗 LinkedIn: /in/madhurjyasaikia",
    "",
    "Or use the contact form on the site — I'll make sure it reaches him.",
  ].join("\n"),
};

type Suggestion = { label: string; query: string };
const SUGGESTIONS: Record<string, Suggestion[]> = {
  film: [
    { label: "Who is Madhurjya?", query: "who is madhurjya" },
    { label: "Services offered", query: "what services do you offer" },
    { label: "Filmmaking philosophy", query: "what is your filmmaking philosophy" },
    { label: "Past projects", query: "tell me about your projects" },
  ],
  social: [
    { label: "Instagram strategy", query: "instagram strategy" },
    { label: "Content tips", query: "content creation tips" },
    { label: "Reel ideas", query: "how to make good reels" },
    { label: "Social media for brands", query: "social media for regional brands" },
  ],
  culture: [
    { label: "Northeast culture", query: "tell me about northeast india culture" },
    { label: "Assamese food", query: "assamese food" },
    { label: "NE music scene", query: "northeast music scene" },
    { label: "NE festivals", query: "festivals of northeast india" },
  ],
  contact: [
    { label: "Email me", query: "reach me at" },
    { label: "Instagram", query: "instagram handle" },
    { label: "GOAT Socials", query: "goat socials" },
    { label: "LinkedIn", query: "linkedin profile" },
  ],
};

const ALL_SUGGESTIONS = Object.values(SUGGESTIONS).flat();

const KEYWORDS: [RegExp, string][] = [
  [/who|madhurjya|about|are you/i, "who"],
  [/experience|background|worked|done|career/i, "experience"],
  [/project|work|portfolio|what.*do/i, "projects"],
  [/service|offer|help|freelance/i, "services"],
  [/film|cinema|movie|philosophy|approach|director|edit/i, "filmmaking"],
  [/gear|camera|lens|equipment|shoot/i, "gear"],
  [/insta|social|reel|tiktok|meta|influencer/i, "instagram"],
  [/content|strategy|marketing|brand|growth/i, "social"],
  [/reel|short.*form|viral|trending/i, "reels"],
  [/northeast|north.?east|seven.?sister/i, "northeast"],
  [/assam|assamese|bihu/i, "assam"],
  [/naga|nagaland|hornbill/i, "nagaland"],
  [/meghalaya|shillong|khasi|jaintia|garo/i, "meghalaya"],
  [/mizo|mizoram|aizawl/i, "mizo"],
  [/mani|manipur|imphal|meitei/i, "manipur"],
  [/arunachal|itanagar|apatani|ziro/i, "arunachal"],
  [/sikkim|gangtok|lepcha/i, "sikkim"],
  [/tripura|agartala|kokborok/i, "tripura"],
  [/food|cuisine|cook|eat|dish/i, "ne_food"],
  [/music|band|song|concert|indie/i, "ne_music"],
  [/festival|celebrate|bihu|hornbill|sangai/i, "ne_festivals"],
  [/reach|contact|email|hire|connect|phone|message/i, "reach"],
];

function findResponse(input: string): string {
  for (const [pattern, key] of KEYWORDS) {
    if (pattern.test(input)) return RESPONSES[key];
  }
  return RESPONSES.default;
}

function findSuggestions(input: string): Suggestion[] {
  for (const [pattern, key] of KEYWORDS) {
    if (pattern.test(input)) return SUGGESTIONS[key] || [];
  }
  return ALL_SUGGESTIONS.slice(0, 4);
}

export function FilmChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hey! Ask me about film, Instagram/social media, or Northeast Indian culture. Or say 'reach me at' for contact info." },
  ]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>(ALL_SUGGESTIONS.slice(0, 4));
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = useCallback((text: string) => {
    const q = text.trim();
    if (!q) return;
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text: q }]);
    setSuggestions([]);
    setTimeout(() => {
      const reply = findResponse(q);
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
      setSuggestions(findSuggestions(q));
    }, 300);
  }, []);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") send(input);
    },
    [send, input],
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          )}
        </svg>
      </button>

      <div className={`film-chat${open ? " film-chat--open" : ""}`}>
        <div className="film-chat__header">
          <span>Film & Culture Chat</span>
          <span className="film-chat__status">● online</span>
        </div>
        <div className="film-chat__messages" ref={listRef}>
          {messages.map((m, i) => (
            <div key={i} className={`film-chat__msg film-chat__msg--${m.from}`}>
              {m.text}
            </div>
          ))}
          {suggestions.length > 0 && (
            <div className="film-chat__suggestions">
              {suggestions.map((s) => (
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
          <button onClick={() => send(input)} aria-label="Send">
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
