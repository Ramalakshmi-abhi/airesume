import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { chatWithAI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const INITIAL_MESSAGES = [
  {
    id: 1, role: "assistant",
    content: "Hi! 👋 I'm your AI resume coach. I can help you improve your resume, prepare for interviews, or analyze your skills. What would you like to work on today?"
  }
];

const QUICK_PROMPTS = [
  "How can I improve my ATS score?",
  "What skills should I add for a frontend role?",
  "Give me interview questions for a React developer",
  "Review my resume summary",
];

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-2">
    {[0, 0.2, 0.4].map((d) => (
      <motion.span
        key={d}
        className="w-2 h-2 rounded-full bg-blue-500"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: d }}
      />
    ))}
  </div>
);

const ChatPage = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;
    const userMsg = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const { data } = await chatWithAI({ message: text, history });
      const aiMsg = { id: Date.now() + 1, role: "assistant", content: data.response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Demo response
      const demos = {
        "How can I improve my ATS score?": "To boost your ATS score:\n\n1. **Use keywords** from the job description naturally\n2. **Simple formatting** — avoid tables, headers, fancy fonts\n3. **Quantify achievements** (e.g., 'Increased sales by 40%')\n4. **Standard section names** — Work Experience, Education, Skills\n5. **Save as PDF** from a clean Word/Google Docs template\n\nAim for 75+ to pass most ATS filters! 🎯",
        default: "Great question! Based on your resume profile, I'd suggest focusing on:\n\n• **Tailoring** your resume for each job application\n• Adding **measurable outcomes** to every bullet point\n• Expanding your **technical skills** section with trending technologies\n• Improving your **professional summary** to match your target role\n\nWould you like me to dive deeper into any of these areas? 💡"
      };
      const reply = demos[text] || demos.default;
      const aiMsg = { id: Date.now() + 1, role: "assistant", content: reply };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages(INITIAL_MESSAGES);
    toast("Chat reset", "info");
  };

  const renderContent = (text) => {
    // Simple markdown-lite rendering
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i}>{line.slice(2, -2)}</strong>;
      }
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((p, j) =>
            p.startsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : p
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Resume Coach</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Online & ready</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={resetChat}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Messages */}
      <Card className="flex-1 overflow-y-auto p-4 space-y-4 mb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-blue-500 to-violet-600"
                  : "bg-gradient-to-br from-green-400 to-emerald-600"
              }`}>
                {msg.role === "assistant"
                  ? <Sparkles className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-white" />
                }
              </div>
              {/* Bubble */}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}>
                {renderContent(msg.content)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-sm">
              <TypingIndicator />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </Card>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200 text-muted-foreground hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask anything about your resume..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          className="flex-1 h-12 rounded-2xl"
        />
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          size="icon"
          className="h-12 w-12 rounded-2xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;
