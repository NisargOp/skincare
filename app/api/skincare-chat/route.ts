import { NextResponse } from "next/server";

const MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const VISION_ADDENDUM = `

The user attached one or more photos (often of skin or a concern area). Look at the image(s) for general, educational skincare observations only — you are not a medical device and cannot diagnose. Describe what you can see at a high level (e.g. apparent dryness, shine, texture, visible blemishes) in neutral language. Urge a dermatologist visit for anything severe, changing, or uncertain. Still use Google Search for India product suggestions when relevant.`;

const SYSTEM_PROMPT = `You are GlowAI, a skincare assistant for users in India.

Use Google Search to suggest relevant skincare products for India: typical brands and lines sold on Nykaa, Amazon.in, Flipkart, Purplle, etc. Do NOT invent retailer product page URLs — our app opens a Google search for the user instead.

Rules:
- Prices must be approximate current retail in India in INR (numbers only in price_inr), from search or typical listings.
- name + brand must identify a real product line or SKU people can search for (no fake products).
- category: one concise label (e.g. Cleanser, Serum, Moisturizer, Sunscreen, Treatment, Toner, Sun care).
- short_description: one sentence (max ~140 characters) on what it does or who it suits — no URLs.
- Give 3–4 distinct products when possible.
- advice: clear, friendly skincare guidance (no currency symbols in prose; INR only in structured fields).`;

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
/** ~4 MB decoded per image (base64 is larger on the wire) */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGES = 4;

type InlineImage = { mimeType: string; data: string };

function stripDataUrlBase64(input: string): string {
  const s = input.trim();
  if (s.startsWith("data:") && s.includes("base64,")) {
    const idx = s.indexOf("base64,");
    return s.slice(idx + "base64,".length).replace(/\s/g, "");
  }
  return s.replace(/\s/g, "");
}

function validateImages(raw: unknown): { ok: true; images: InlineImage[] } | { ok: false; error: string } {
  if (raw === undefined || raw === null) return { ok: true, images: [] };
  if (!Array.isArray(raw)) return { ok: false, error: "images must be an array" };
  if (raw.length > MAX_IMAGES) {
    return { ok: false, error: `At most ${MAX_IMAGES} images per request` };
  }
  const images: InlineImage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "Each image must be an object with mimeType and data" };
    }
    const mimeType = String((item as { mimeType?: string }).mimeType ?? "").trim().toLowerCase();
    let data = String((item as { data?: string }).data ?? "").trim();
    if (!mimeType || !ALLOWED_IMAGE_MIME.has(mimeType)) {
      return { ok: false, error: "Each image needs a supported mimeType (JPEG, PNG, WebP, or GIF)" };
    }
    data = stripDataUrlBase64(data);
    if (!data) return { ok: false, error: "Each image needs non-empty base64 data" };
    let byteLength: number;
    try {
      byteLength = Buffer.from(data, "base64").length;
    } catch {
      return { ok: false, error: "Invalid base64 image data" };
    }
    if (byteLength > MAX_IMAGE_BYTES) {
      return { ok: false, error: `Each image must be at most ${MAX_IMAGE_BYTES / (1024 * 1024)} MB` };
    }
    images.push({ mimeType, data });
  }
  return { ok: true, images };
}

function buildGeminiParts(
  message: string,
  images: InlineImage[]
): Array<
  { text: string } | { inlineData: { mimeType: string; data: string } }
> {
  const vision = images.length > 0 ? VISION_ADDENDUM : "";
  const text = `${SYSTEM_PROMPT}${vision}\n\nUser question:\n${message}`;
  const parts: Array<
    { text: string } | { inlineData: { mimeType: string; data: string } }
  > = [{ text }];
  for (const img of images) {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  }
  return parts;
}

function buildFallbackParts(
  message: string,
  images: InlineImage[]
): Array<
  { text: string } | { inlineData: { mimeType: string; data: string } }
> {
  const vision = images.length > 0 ? VISION_ADDENDUM : "";
  const text = `${SYSTEM_PROMPT}${vision}

Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"advice":"string","products":[{"name":"","brand":"","price_inr":0,"category":"","short_description":""}]}

User question:\n${message}`;
  const parts: Array<
    { text: string } | { inlineData: { mimeType: string; data: string } }
  > = [{ text }];
  for (const img of images) {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  }
  return parts;
}

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
  let imagesPayload: unknown;
  try {
    const json = (await req.json()) as { message?: string; images?: unknown };
    message = (json.message ?? "").trim();
    imagesPayload = json.images;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validateImages(imagesPayload);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { images } = validated;

  if (!message && images.length === 0) {
    return NextResponse.json(
      { error: "Send a message and/or at least one image" },
      { status: 400 }
    );
  }

  if (!message && images.length > 0) {
    message =
      "Please look at my skin in the photo(s) and suggest routine guidance plus product types I can find in India.";
  }

  const parts = buildGeminiParts(message, images);

  const withToolsAndSchema = {
    contents: [{ role: "user", parts }],
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
      contents: [{ role: "user", parts: buildFallbackParts(message, images) }],
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
