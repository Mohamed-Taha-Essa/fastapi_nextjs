"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, BookOpen } from "lucide-react";
import api from "@/lib/api";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: any[];
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welc",
            role: "assistant",
            content: "Hello! I am your AI Copilot. Ask me questions about the documents you've uploaded to your knowledge base.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const query = input.trim();
        setInput("");

        // Add user message to UI immediately
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: query };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Execute the query against FastAPI backend Retrieval QA
            const res = await api.post("/api/v1/ai/query", { query });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: res.data.answer || res.data.response || "No response text found.",
                sources: res.data.sources || [],
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I encountered an error while searching your knowledge base.",
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto py-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-800">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <Sparkles className="w-5 h-5 text-blue-400 mr-2" />
                        Copilot Chat
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">Chat securely with your proprietary documents.</p>
                </div>
            </div>

            {/* Messages Window */}
            <div className="flex-1 overflow-y-auto pr-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700">
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>

                        <div className={`flex w-full max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === "user"
                                    ? "bg-zinc-800 ml-3"
                                    : "bg-blue-600 mr-3 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                }`}>
                                {m.role === "user" ? <User className="w-5 h-5 text-zinc-400" /> : <Bot className="w-5 h-5 text-white" />}
                            </div>

                            {/* Message Bubble */}
                            <div className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                                <div className={`px-5 py-3.5 rounded-2xl ${m.role === "user"
                                        ? "bg-zinc-800 text-white rounded-tr-none"
                                        : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none shadow-xl"
                                    }`}>
                                    <div className="leading-relaxed whitespace-pre-wrap">{m.content}</div>
                                </div>

                                {/* Sources Display (If attached) */}
                                {m.sources && m.sources.length > 0 && (
                                    <div className="mt-2 space-y-2 w-full">
                                        <p className="text-xs font-semibold text-zinc-500 uppercase flex items-center">
                                            <BookOpen className="w-3 h-3 mr-1" />
                                            Sources
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {m.sources.map((s, i) => (
                                                <div key={i} className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 px-3 py-1.5 rounded-lg max-w-[200px] truncate hover:whitespace-normal cursor-pointer hover:bg-zinc-800 transition-colors">
                                                    <span className="font-medium text-blue-400">{s.title || "Document"}</span>
                                                    {s.page ? ` (Page ${s.page})` : ""}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex w-full max-w-[80%] flex-row">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-600 mr-3">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="pt-6 relative">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        placeholder="Ask about your documents..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-5 pr-14 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-xl disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
                <p className="text-center text-xs text-zinc-600 mt-3">
                    AI Copilot algorithms can make mistakes. Always verify important documents manually.
                </p>
            </div>

        </div>
    );
}
