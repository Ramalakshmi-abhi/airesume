import { Router } from "express";
import { matchJob } from "../controllers/matchController.js";

const router = Router();
router.post("/", matchJob);
export default router;
