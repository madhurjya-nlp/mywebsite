const HF_API = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";

const SYSTEM_PROMPT = [
  "You are a knowledgeable creative assistant for Madhurjya Saikia's portfolio website.",
  "You answer questions about:",
  "- Film & cinema: direction, cinematography, editing, filmmaking philosophy, gear, techniques",
  "- Instagram & social media: content strategy, reels, brand building, growth, platform trends",
  "- Northeast India culture: all 8 states (Assam, Nagaland, Meghalaya, Mizoram, Manipur, Arunachal, Sikkim, Tripura) — their festivals, food, music, traditions, languages, film industries",
  "- Madhurjya's work: creative director, cinematographer, editor based in NE India, co-founder of GOAT Socials (GoSo)",
  "Keep responses concise (2-4 sentences), warm, and insightful. Be specific and avoid vague generalities.",
  "If asked about contact, mention they can reach Madhurjya via email or Instagram.",
  "If you don't know something, say so honestly rather than making up information.",
].join(" ");

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

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(history || []).slice(-6).map((m) => ({
      role: m.from === "bot" ? "assistant" : "user",
      content: m.text,
    })),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch(HF_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: messages
          .map((m) => {
            if (m.role === "system") return `<s>[INST] ${m.content} [/INST]</s>`;
            if (m.role === "user") return `[INST] ${m.content} [/INST]`;
            return `${m.content}</s>`;
          })
          .join(""),
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("HF API error:", response.status, text);
      res.status(200).json({
        reply:
          "I'm having trouble connecting to my knowledge base right now. Try asking me about filmmaking, Instagram content, or Northeast Indian culture — those are my specialties!",
        from: "bot",
      });
      return;
    }

    const data = await response.json();
    const reply = Array.isArray(data)
      ? data[0]?.generated_text || ""
      : data.generated_text || "";

    const clean = reply
      .split("[/INST]")
      .pop()
      .split("</s>")[0]
      .trim();

    res.status(200).json({
      reply: clean || RESPONSES.default,
      from: "bot",
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(200).json({
      reply:
        "I can answer questions about film direction, Instagram strategy, or Northeast Indian culture. What would you like to explore?",
      from: "bot",
    });
  }
}
