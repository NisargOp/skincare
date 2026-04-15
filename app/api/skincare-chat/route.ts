import { NextResponse } from "next/server";

const MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are GlowAI, a skincare assistant for users in India.

Use Google Search to suggest relevant skincare products for India: typical brands and lines sold on Nykaa, Amazon.in, Flipkart, Purplle, etc. Do NOT invent retailer product page URLs — our app opens a Google search for the user instead.

Rules:
- Prices must be approximate current retail in India in INR (numbers only in price_inr), from search or typical listings.
- name + brand must identify a real product line or SKU people can search for (no fake products).
- category: one concise label (e.g. Cleanser, Serum, Moisturizer, Sunscreen, Treatment, Toner, Sun care).
- short_description: one sentence (max ~140 characters) on what it does or who it suits — no URLs.
- Give 3–4 distinct products when possible.
- advice: clear, friendly skincare guidance (no currency symbols in prose; INR only in structured fields).`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    advice: {
      type: "STRING",
      description: "Skincare guidance for the user",
    },
    products: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          brand: { type: "STRING" },
          price_inr: { type: "NUMBER" },
          category: { type: "STRING" },
          short_description: { type: "STRING" },
        },
        required: ["name", "brand", "price_inr", "category", "short_description"],
      },
    },
  },
  required: ["advice", "products"],
};

export type SkincareProductPayload = {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  /** Display-only average rating (deterministic pseudo-random per product id) */
  avgRating: number;
  /** Google Shopping search — avoids dead retailer links */
  url: string;
};

function formatInr(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "₹—";
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/** Targeted Google Shopping search (India); avoids brittle product page URLs from the model */
function buildGoogleShoppingSearchUrl(brand: string, name: string): string {
  const q = `${brand} ${name} buy online India price`.replace(/\s+/g, " ").trim();
  const params = new URLSearchParams({ q, tbm: "shop", gl: "in", hl: "en" });
  return `https://www.google.com/search?${params.toString()}`;
}

/** Plausible 3.8–4.9 avg rating, stable for the same id (not from the model) */
function averageRatingFromId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = (h >>> 0) / 0xffffffff;
  return Math.round((3.8 + u * 1.1) * 10) / 10;
}

function parseJsonFromModelText(text: string): { advice: string; products: unknown[] } {
  const trimmed = text.trim();
  const block = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = block ? block[1]!.trim() : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON object in response");
  const parsed = JSON.parse(raw.slice(start, end + 1)) as {
    advice?: string;
    products?: unknown[];
  };
  if (!parsed.advice || !Array.isArray(parsed.products)) {
    throw new Error("Invalid JSON shape");
  }
  return { advice: parsed.advice, products: parsed.products };
}

function normalizeProducts(raw: unknown[]): SkincareProductPayload[] {
  const out: SkincareProductPayload[] = [];
  for (let i = 0; i < raw.length && out.length < 6; i++) {
    const p = raw[i] as Record<string, unknown>;
    if (!p || typeof p !== "object") continue;
    const name = String(p.name ?? "").trim();
    const brand = String(p.brand ?? "").trim();
    const priceInr = Number(p.price_inr);
    const category = String(p.category ?? "").trim() || "Skincare";
    const description = String(
      p.short_description ?? p.description ?? ""
    ).trim();
    if (!name) continue;

    const safeBrand = brand || "Skincare";
    const idBase = `${safeBrand}-${name}`.slice(0, 80);
    const id = `p-${i}-${idBase.replace(/\s+/g, "-")}`;
    out.push({
      id,
      name,
      brand: brand || "—",
      category,
      description: description || "Popular pick for Indian routines — compare prices on Google.",
      price: formatInr(priceInr),
      avgRating: averageRatingFromId(id),
      url: buildGoogleShoppingSearchUrl(safeBrand, name),
    });
  }
  return out;
}

async function callGemini(
  apiKey: string,
  body: Record<string, unknown>
): Promise<Response> {
  return fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    return NextResponse.json(
      {
        advice:
          "Add a Gemini API key (GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY) in .env.local to enable search-backed product picks and INR pricing.",
        products: [] as SkincareProductPayload[],
      },
      { status: 200 }
    );
  }

  let message = "";
  try {
    const json = (await req.json()) as { message?: string };
    message = (json.message ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const userPart = {
    text: `${SYSTEM_PROMPT}\n\nUser question:\n${message}`,
  };

  const withToolsAndSchema = {
    contents: [{ role: "user", parts: [userPart] }],
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  let res = await callGemini(apiKey, withToolsAndSchema);
  let data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const withToolsOnly = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}

Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"advice":"string","products":[{"name":"","brand":"","price_inr":0,"category":"","short_description":""}]}

User question:\n${message}`,
            },
          ],
        },
      ],
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.7 },
    };
    res = await callGemini(apiKey, withToolsOnly);
    data = await res.json().catch(() => ({}));
  }

  if (!res.ok) {
    const errMsg =
      (data as { error?: { message?: string } })?.error?.message ?? res.statusText;
    return NextResponse.json(
      { error: `Gemini API error: ${res.status} ${errMsg}` },
      { status: 502 }
    );
  }

  const text =
    (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
      ?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let advice = "";
  let rawProducts: unknown[] = [];

  const parseModelOutput = (): boolean => {
    if (!text.trim()) return false;
    try {
      const parsed = JSON.parse(text) as { advice?: string; products?: unknown[] };
      if (typeof parsed.advice === "string" && Array.isArray(parsed.products)) {
        advice = parsed.advice;
        rawProducts = parsed.products;
        return true;
      }
    } catch {
      /* try markdown / embedded JSON */
    }
    try {
      const parsed = parseJsonFromModelText(text);
      advice = parsed.advice;
      rawProducts = parsed.products;
      return true;
    } catch {
      return false;
    }
  };

  if (!parseModelOutput()) {
    return NextResponse.json(
      {
        error: "Could not parse model response",
        raw: text.slice(0, 500),
      },
      { status: 502 }
    );
  }

  const products = normalizeProducts(rawProducts);

  if (!advice) {
    advice = text || "Here are some options that match your search.";
  }

  return NextResponse.json({ advice, products });
}
