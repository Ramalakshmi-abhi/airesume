import express from "express";
import { getInterviewQuestions } from "../controllers/interviewController.js";

const router = express.Router();

router.post("/", getInterviewQuestions);

export default router;
