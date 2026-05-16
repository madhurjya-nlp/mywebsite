const HF_TOKEN = process.env.HF_TOKEN || "";
const HF_API = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";

const SYSTEM_PROMPT = [
  "You are a knowledgeable creative assistant for Madhurjya Saikia's portfolio website.",
  "You answer questions about:",
  "- Film & cinema: direction, cinematography, editing, filmmaking philosophy, gear, techniques, Indian filmmakers",
  "- Instagram & social media: content strategy, reels, brand building, growth, platform trends",
  "- Northeast India culture: all 8 states (Assam, Nagaland, Meghalaya, Mizoram, Manipur, Arunachal, Sikkim, Tripura) — their festivals, food, music, traditions, languages, film industries",
  "- Madhurjya's work: creative director, cinematographer, editor based in NE India, co-founder of GOAT Socials (GoSo)",
  "Keep responses concise (3-6 sentences), warm, and insightful. Be specific and avoid vague generalities.",
  "If asked about contact, mention they can reach Madhurjya via email or Instagram.",
  "If you don't know something, say so honestly rather than making up information.",
].join(" ");

const FALLBACKS = {
  "top indian filmmakers": [
    "1. Satyajit Ray — Apu Trilogy, master of humanist cinema.",
    "2. Ritwik Ghatak — Partition trilogy, raw political cinema.",
    "3. Adoor Gopalakrishnan — Malayalam parallel cinema pioneer.",
    "4. Mani Kaul — Avant-garde, formally radical storytelling.",
    "5. Shyam Benegal — Founder of parallel cinema movement.",
    "6. Mira Nair — Salaam Bombay!, Monsoon Wedding, global stories.",
    "7. Anurag Kashyap — Gangs of Wasseypur, modern Hindi cinema.",
    "8. S. S. Rajamouli — Baahubali, RRR, Indian epic scale.",
    "9. Vetrimaaran — Asuran, Vada Chennai, caste politics.",
    "10. Bimal Roy — Do Bigha Zamin, Madhumati, poetic realism.",
  ].join("\n"),
  "default": "I can answer questions about Indian cinema, filmmaking, Instagram strategy, and Northeast Indian culture. What would you like to know?",
};

function getFallback(input) {
  const text = input.toLowerCase();
  if (/top|best|favorite|greatest.*(film|director)|indian.*cinema/i.test(text)) return FALLBACKS["top indian filmmakers"];
  return FALLBACKS.default;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, history } = req.body || {};
  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  if (!HF_TOKEN) {
    // If no token set, use curated responses
    res.json({ reply: getFallback(message) });
    return;
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(history || []).slice(-8).map((m) => ({
      role: m.from === "bot" ? "assistant" : "user",
      content: m.text,
    })),
    { role: "user", content: message },
  ];

  const prompt = messages
    .map((m) => {
      if (m.role === "system") return `<s>[INST] ${m.content} [/INST]</s>`;
      if (m.role === "user") return `[INST] ${m.content} [/INST]`;
      return `${m.content}</s>`;
    })
    .join("");

  try {
    const response = await fetch(HF_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_TOKEN}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      console.error("HF API error:", response.status);
      res.json({ reply: getFallback(message) });
      return;
    }

    const data = await response.json();
    const reply = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
    res.json({ reply: (reply || getFallback(message)).trim() });
  } catch (error) {
    console.error("Chat error:", error);
    res.json({ reply: getFallback(message) });
  }
}
