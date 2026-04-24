import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const icons = {
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
};

let toastId = 0;
let addToastFn = null;

export const toast = (message, type = "info") => {
  if (addToastFn) addToastFn({ id: ++toastId, message, type });
};

export const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastFn = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 4000);
    };
    return () => { addToastFn = null; };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            className="flex items-center gap-3 bg-card/95 backdrop-blur-md border border-border rounded-2xl px-4 py-3 shadow-2xl min-w-[280px] max-w-[380px]"
          >
            {icons[t.type]}
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
