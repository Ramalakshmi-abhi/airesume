import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Configure local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post("/", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    // Return the local file path and a public URL
    const fileUrl = `http://localhost:5005/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      filename: req.file.filename,
      url: fileUrl, // Frontend uses this
      path: req.file.path, // Backend uses this
      size: req.file.size,
    });
  } catch (error) {
    console.error("❌ Local upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
