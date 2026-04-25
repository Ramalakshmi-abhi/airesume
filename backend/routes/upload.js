import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import admin from "../config/firebase.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const bucket = admin.storage().bucket();
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const file = bucket.file(`resumes/${fileName}`);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
      public: true
    });

    // Construct the public URL (Firebase Storage format)
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/resumes/${fileName}`;
    
    res.json({
      success: true,
      filename: fileName,
      url: fileUrl,
      size: req.file.size,
    });
  } catch (error) {
    console.error("❌ Firebase upload error:", error);
    res.status(500).json({ error: "Failed to upload to cloud storage" });
  }
});


export default router;
