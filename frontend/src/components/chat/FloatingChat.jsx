import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, MessageSquare, X, Bot, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { chatWithAI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const INITIAL_MESSAGES = [
  { id: 1, role: "assistant", content: "👋 Hi! I'm your **Resume AI Coach**!\n\nWhether you're a fresher, experienced professional, or switching careers — I'm here to help!\n\n**You can ask me:**\n• What job is right for me?\n• What skills do I need to learn?\n• How to write a resume?\n• What is Full Stack / Customer Support / Sales?\n• How to prepare for an interview?" }
];

// Simple markdown renderer for chat messages
const renderMarkdown = (text) => {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")  // **bold**
    .replace(/\n/g, "<br />")                            // newlines
    .replace(/• /g, "<span style='margin-right:6px'>•</span>"); // bullet dots
  return { __html: html };
};

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const { user } = useAuth();
  
  const SUGGESTIONS = [
    "I am a fresher, where do I start? 🌱",
    "What job suits me with no experience? 🤔",
    "How to write a resume? 📝",
    "Customer support job — what to learn? 🎧"
  ];

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;
    const userMsg = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-5).map((m) => ({ role: m.role, content: m.content }));
      const { data } = await chatWithAI({ message: text, history });
      const aiMsg = { id: Date.now() + 1, role: "assistant", content: data.response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const aiMsg = { id: Date.now() + 1, role: "assistant", content: "I'm having a bit of trouble connecting right now, but I'm still here to help! You can try asking about ATS tips, interview prep, or how to quantify your experience impact." };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-4">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[380px] md:h-[500px] flex flex-col shadow-2xl md:rounded-3xl overflow-hidden border border-border bg-card/95 backdrop-blur-xl z-50"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Resume AI Assistant</h3>
                  <p className="text-[10px] text-blue-100 uppercase tracking-tighter">Powered by GPT-3.5</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                    msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-muted text-foreground rounded-bl-none"
                  }`}>
                    {msg.role === "assistant" ? (
                      <span dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="bg-muted p-2 rounded-xl animate-pulse text-[10px]">AI is thinking...</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions & Input */}
            <div className="border-t border-border bg-card flex flex-col">
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 p-3 pb-0">
                  {SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(sug)}
                      className="text-[11px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full transition-colors font-medium border border-blue-500/10 text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="p-4 flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="rounded-full bg-muted border-none h-10 text-sm"
                />
                <Button size="icon" onClick={() => sendMessage()} className="rounded-full h-10 w-10 min-w-[40px] bg-blue-600 shadow-lg shadow-blue-500/20">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 relative group"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-blue-500 -z-10"
          />
          <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        </motion.button>
      )}
    </div>
  );
};

export default FloatingChat;
