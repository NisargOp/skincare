"use client";

import React, { useRef, useState, useMemo } from "react";
import { Send, Paperclip, Mic, Sparkles, MessageCircle, Loader2 } from "lucide-react";

type ChatItem = {
  id: string;
  user: string;
  response: string;
  createdAt: number;
};

async function callGeminiAPI(userMessage: string): Promise<string> {
  // Replace this with your actual API key
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
  
  console.log("🚀 Starting API call...");
  console.log("📝 User message:", userMessage);
  console.log("🔑 API Key present?", apiKey !== "YOUR_API_KEY_HERE");
  
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.log("⚠️ No API key found, using mock response");
    // Mock response for demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `Thank you for asking! Here's what I recommend for your skincare concern:\n\n1. Start with a gentle cleanser suited to your skin type\n2. Use a hydrating serum with ingredients like hyaluronic acid\n3. Don't forget SPF 30+ sunscreen every morning\n4. Keep your routine consistent for best results\n\nWould you like specific product recommendations?`;
  }

  try {
    console.log("📡 Calling Gemini API...");
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`;
    
    const payload = {
      contents: [
        {
          parts: [
            { 
              text: `You are a helpful skincare AI assistant. Provide clear, friendly advice about skincare. User question: ${userMessage}` 
            },
          ],
        },
      ],
    };
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    console.log("📥 Response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response:", errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Raw API Response:", data);
    
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error("❌ No text found in API response");
      throw new Error("No text in API response");
    }
    
    console.log("🎉 Successfully extracted text, length:", text.length);
    console.log("📄 Response preview:", text.substring(0, 100) + "...");
    
    return text;
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    return `I'm having trouble connecting right now. Here's some general skincare advice:\n\n• Cleanse gently twice daily\n• Use sunscreen every day\n• Stay hydrated\n• Be consistent with your routine\n\nPlease try again in a moment!`;
  }
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

    console.log("🎬 Submit started");
    const tempId = `${Date.now()}`;
    setMessage("");
    setIsLoading(true);
    console.log("⏳ Loading state set to true");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      console.log("🔄 Calling API with message:", userText);
      const aiResponse = await callGeminiAPI(userText);
      console.log("✨ Received AI response");
      
      const item: ChatItem = {
        id: tempId,
        user: userText,
        response: aiResponse,
        createdAt: Date.now(),
      };
      
      setItems((prev) => [item, ...prev]);
      setActiveId(tempId);
      console.log("💾 Chat item saved to state");
      
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("❌ Submit Error:", error);
    } finally {
      setIsLoading(false);
      console.log("✅ Loading complete, state set to false");
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