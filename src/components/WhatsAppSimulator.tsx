import React, { useState, useEffect, useRef } from "react";
import { Send, MoreVertical, Search, Paperclip, Smile, Mic, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
    status: "sent" | "delivered" | "read";
}

interface WhatsAppSimulatorProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    isTyping: boolean;
}

export function WhatsAppSimulator({ messages, onSendMessage, isTyping }: WhatsAppSimulatorProps) {
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput("");
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex h-[600px] w-full max-w-4xl mx-auto overflow-hidden rounded-xl shadow-2xl border border-white/10 bg-whatsapp-bg">
            {/* Sidebar (Contacts) - Hidden on mobile, simplified for demo */}
            <div className="hidden md:flex w-[30%] flex-col border-r border-white/10 bg-whatsapp-header">
                <div className="h-16 bg-whatsapp-header flex items-center justify-between px-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" alt="User" className="w-8 h-8" />
                    </div>
                    <div className="flex gap-4 text-whatsapp-text-secondary">
                        <MoreVertical size={20} />
                    </div>
                </div>
                <div className="p-2">
                    <div className="bg-whatsapp-bg rounded-lg flex items-center px-3 py-1.5">
                        <Search size={18} className="text-whatsapp-text-secondary mr-3" />
                        <input
                            type="text"
                            placeholder="Search or start new chat"
                            className="bg-transparent border-none outline-none text-whatsapp-text-primary text-sm w-full placeholder:text-whatsapp-text-secondary"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="flex items-center gap-3 p-3 bg-whatsapp-header hover:bg-[#2a3942] cursor-pointer border-l-4 border-whatsapp-accent">
                        <div className="w-12 h-12 rounded-full bg-whatsapp-accent/20 flex items-center justify-center overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=SolanaBot" alt="Bot" className="w-10 h-10" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-whatsapp-text-primary font-medium truncate">Solana Bot</h3>
                                <span className="text-xs text-whatsapp-text-secondary">Now</span>
                            </div>
                            <p className="text-whatsapp-text-secondary text-sm truncate">
                                {isTyping ? "typing..." : messages[messages.length - 1]?.text || "Start chatting..."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[#0b141a] relative">
                {/* Chat Background Pattern */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}>
                </div>

                {/* Header */}
                <div className="h-16 bg-whatsapp-header flex items-center px-4 justify-between z-10 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-whatsapp-accent/20 flex items-center justify-center overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=SolanaBot" alt="Bot" className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-whatsapp-text-primary font-medium">Solana Bot</h3>
                            <p className="text-xs text-whatsapp-text-secondary">
                                {isTyping ? "typing..." : "Online"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4 text-whatsapp-text-secondary">
                        <Search size={20} />
                        <MoreVertical size={20} />
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 z-10" ref={scrollRef}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex w-full",
                                msg.sender === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[70%] rounded-lg px-3 py-1.5 relative shadow-sm text-sm",
                                    msg.sender === "user"
                                        ? "bg-whatsapp-outgoing text-whatsapp-text-primary rounded-tr-none"
                                        : "bg-whatsapp-incoming text-whatsapp-text-primary rounded-tl-none"
                                )}
                            >
                                <p className="mr-8 pb-1">{msg.text}</p>
                                <div className="absolute bottom-1 right-2 flex items-center gap-1">
                                    <span className="text-[10px] text-whatsapp-text-secondary/80">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                    {msg.sender === "user" && (
                                        <span className={cn(
                                            "text-[14px]",
                                            msg.status === "read" ? "text-[#53bdeb]" : "text-whatsapp-text-secondary"
                                        )}>
                                            <CheckCheck size={14} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="bg-whatsapp-incoming text-whatsapp-text-primary rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-whatsapp-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-whatsapp-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-whatsapp-text-secondary rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input Area */}
                <div className="min-h-[62px] bg-whatsapp-header px-4 py-2 flex items-center gap-3 z-10">
                    <Smile size={24} className="text-whatsapp-text-secondary cursor-pointer" />
                    <Paperclip size={24} className="text-whatsapp-text-secondary cursor-pointer" />
                    <div className="flex-1 bg-[#2a3942] rounded-lg flex items-center px-4 py-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Type a message"
                            className="bg-transparent border-none outline-none text-whatsapp-text-primary w-full placeholder:text-whatsapp-text-secondary"
                        />
                    </div>
                    {input.trim() ? (
                        <button onClick={handleSend} className="text-whatsapp-accent">
                            <Send size={24} />
                        </button>
                    ) : (
                        <Mic size={24} className="text-whatsapp-text-secondary cursor-pointer" />
                    )}
                </div>
            </div>
        </div>
    );
}
