"use client";

import React, { useRef, useState, useMemo } from "react";
import { Send, Paperclip, Mic, Sparkles, MessageCircle, Loader2, ExternalLink, Star, ShoppingBag } from "lucide-react";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  avgRating: number;
  url: string;
};

type ChatItem = {
  id: string;
  user: string;
  response: string;
  products?: Product[];
  createdAt: number;
};

function ProductListRow({ product }: { product: Product }) {
  return (
    <div className="px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1 space-y-2">
        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-pink-700 bg-pink-100/90 px-2.5 py-1 rounded-md">
          {product.category}
        </span>
        <h4 className="text-base font-semibold text-gray-900 leading-snug pr-2">{product.name}</h4>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{product.description}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
          <span className="font-medium text-gray-600">{product.brand}</span>
          <span className="flex items-center gap-1 tabular-nums">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" aria-hidden />
            <span>
              <span className="font-semibold text-gray-800">{product.avgRating.toFixed(1)}</span> avg
            </span>
          </span>
        </div>
      </div>
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 sm:min-w-[7.5rem] border-t border-gray-100 sm:border-0 pt-3 sm:pt-0">
        <div className="font-bold text-lg text-pink-600 tabular-nums">{product.price}</div>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold px-5 py-2.5 shadow-md hover:shadow-lg hover:opacity-95 transition-all w-full sm:w-auto"
        >
          <ShoppingBag className="w-4 h-4 shrink-0" />
          Buy now
          <ExternalLink className="w-3.5 h-3.5 opacity-90 shrink-0" />
        </a>
      </div>
    </div>
  );
}

export default function SkincareAIDashboard() {
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<ChatItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    const userText = message.trim();
    if (!userText || isLoading) return;

    const tempId = `${Date.now()}`;
    setMessage("");
    setIsLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch("/api/skincare-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = (await res.json()) as {
        advice?: string;
        products?: Product[];
        error?: string;
        raw?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const aiResponse =
        data.advice ??
        "I could not generate advice this time. Please try again.";
      const products = Array.isArray(data.products) ? data.products : [];

      const item: ChatItem = {
        id: tempId,
        user: userText,
        response: aiResponse,
        products: products.length > 0 ? products : undefined,
        createdAt: Date.now(),
      };

      setItems((prev) => [item, ...prev]);
      setActiveId(tempId);

      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Submit Error:", error);
      const errMsg =
        error instanceof Error ? error.message : "Something went wrong.";
      const item: ChatItem = {
        id: tempId,
        user: userText,
        response: `Sorry — ${errMsg}\n\nTip: confirm your API key is set and that Grounding with Google Search is enabled for your Gemini project.`,
        createdAt: Date.now(),
      };
      setItems((prev) => [item, ...prev]);
      setActiveId(tempId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const activeItem = useMemo(() => items.find((i) => i.id === activeId) ?? items[0] ?? null, [items, activeId]);

  return (
    <div className="w-full h-screen flex bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Sidebar */}
      <aside className="w-80 h-full border-r border-gray-200 bg-white/80 backdrop-blur-sm overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                GlowAI
              </div>
              <div className="text-xs text-gray-500">Your Skincare Assistant</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs font-semibold text-gray-500 mb-2 px-2">CHAT HISTORY</div>
          {items.length === 0 && (
            <div className="text-sm text-gray-400 px-3 py-8 text-center">
              No chats yet.<br />Start by asking a question!
            </div>
          )}
          <div className="space-y-2">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => setActiveId(it.id)}
                className={`w-full text-left rounded-xl px-4 py-3 transition-all hover:bg-pink-50 ${
                  activeItem?.id === it.id 
                    ? "bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200" 
                    : "bg-white border border-gray-100"
                }`}
              >
                <div className="text-sm font-medium line-clamp-2 mb-1">{it.user}</div>
                <div className="text-xs text-gray-400">
                  {new Date(it.createdAt).toLocaleTimeString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-4xl px-6 py-8 flex-1">
          {!activeItem ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                How can I help you today?
              </h1>
              <p className="text-gray-500 text-center mb-8 max-w-md">
                Ask me anything about skincare, routines, products, or skin concerns
              </p>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                {[
                  "What's a good skincare routine for beginners?",
                  "How do I deal with acne?",
                  "Best ingredients for anti-aging",
                  "Recommend a moisturizer for dry skin"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(suggestion)}
                    className="p-4 rounded-2xl bg-white border-2 border-gray-200 hover:border-pink-300 hover:shadow-md transition-all text-left"
                  >
                    <div className="text-sm font-medium text-gray-700">{suggestion}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-6">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-3xl px-6 py-4 shadow-lg">
                  <div className="font-medium">{activeItem.user}</div>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="max-w-2xl w-full">
                  <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {activeItem.response}
                      </div>
                    </div>
                  </div>

                  {/* Product Recommendations */}
                  {activeItem.products && activeItem.products.length > 0 && (
                    <div className="mt-6 w-full max-w-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-pink-600" />
                        <h3 className="font-semibold text-gray-800">Recommended products</h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        Average ratings are illustrative. Prices are approximate. “Buy now” opens Google Shopping in India.
                      </p>
                      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100 overflow-hidden">
                        {activeItem.products.map((product) => (
                          <ProductListRow key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="w-full max-w-4xl px-6 pb-8 sticky bottom-0">
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*"
            />

            <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden transition-all">
              <div className="flex items-end gap-3 p-4">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your skincare concerns..."
                    disabled={isLoading}
                    className="w-full resize-none border-0 focus:outline-none text-base placeholder:text-gray-400 max-h-40 disabled:opacity-50"
                    rows={1}
                  />
                </div>

                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  <Mic className="w-5 h-5 text-gray-600" />
                </button>

                {isLoading ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!message.trim()}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}