import { Router } from "express";
import { rewriteResume } from "../controllers/rewriteController.js";

const router = Router();
router.post("/", rewriteResume);
export default router;
