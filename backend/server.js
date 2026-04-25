import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uploadRouter from "./routes/upload.js";
import analyzeRouter from "./routes/analyze.js";
import matchRouter from "./routes/match.js";
import rewriteRouter from "./routes/rewrite.js";
import historyRouter from "./routes/history.js";
import chatRouter from "./routes/chat.js";

import roadmapRouter from "./routes/roadmap.js";
import interviewRouter from "./routes/interview.js";

const app = express();
const PORT = 5005; 

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/upload", uploadRouter);
app.use("/api/analyze", analyzeRouter);
app.use("/api/match-job", matchRouter);
app.use("/api/rewrite", rewriteRouter);
app.use("/api/history", historyRouter);
app.use("/api/chat", chatRouter);
app.use("/api/roadmap", roadmapRouter);
app.use("/api/interview-prep", interviewRouter);

import { downloadFileNative } from "./controllers/analyzeController.js";

app.get("/api/download-file", downloadFileNative);
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(e);
    }
  });
};

if (!process.env.VERCEL) {
  startServer(PORT);
}

export default app;

