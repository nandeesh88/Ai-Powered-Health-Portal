"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

function respond(input: string): string {
  const text = input.toLowerCase();
  const suggestions: string[] = [];
  if (/fever|temperature/.test(text)) suggestions.push("Fever detected: stay hydrated, monitor temperature, consider acetaminophen if needed.");
  if (/cough|sore throat/.test(text)) suggestions.push("Possible upper respiratory symptoms: rest, warm fluids, and monitor for shortness of breath.");
  if (/headache|migraine/.test(text)) suggestions.push("Headache noted: reduce screen time, stay hydrated, and consider OTC analgesics.");
  if (/chest pain|pressure/.test(text)) suggestions.push("Chest discomfort can be serious. If severe or with shortness of breath, seek emergency care.");
  if (/rash|itch/.test(text)) suggestions.push("Skin rash: avoid scratching, use hypoallergenic moisturizer; consult a dermatologist if spreading.");
  if (!suggestions.length) suggestions.push("Thanks for sharing. I recommend a clinical evaluation if symptoms persist or worsen.");

  return suggestions.join("\n• ");
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI health assistant. Describe your symptoms and I'll suggest next steps. This is not medical advice." },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function onSend() {
    if (!input.trim()) return;
    const user: Message = { role: "user", content: input.trim() };
    const ai: Message = { role: "assistant", content: `• ${respond(input.trim())}` };
    setMessages((m) => [...m, user, ai]);
    setInput("");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">AI Health Chatbot</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Symptom checker and health recommendations</p>
      </div>

      <section className="card p-4">
        <div ref={listRef} className="h-[420px] overflow-y-auto pr-2">
          {messages.map((m, i) => (
            <div key={i} className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user" ? "bg-emerald-500 text-white" : "border"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onSend())}
            placeholder="Describe your symptoms (e.g., mild fever and cough for 2 days)"
            className="flex-1 rounded-md border px-3 py-2 bg-transparent"
          />
          <button onClick={onSend} className="rounded-md bg-emerald-500 text-white px-4 py-2 hover:bg-emerald-600">Send</button>
        </div>
        <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
          Disclaimer: This assistant provides general information and is not a substitute for professional medical advice. In emergencies, call your local emergency number.
        </p>
      </section>
    </main>
  );
}