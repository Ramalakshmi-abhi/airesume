import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const LoadingScreen = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500" />
        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-blue-500" />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-muted-foreground text-sm font-medium"
      >
        {message}
      </motion.p>
    </motion.div>
  </div>
);

export default LoadingScreen;
