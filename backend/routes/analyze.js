import { Router } from "express";
import { analyzeResume, downloadResume, downloadFileNative } from "../controllers/analyzeController.js";

const router = Router();
router.post("/", analyzeResume);
router.post("/download", downloadResume);
router.get("/download-file", downloadFileNative);

export default router;
