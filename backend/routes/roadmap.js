import express from "express";
import { generateRoadmap } from "../controllers/roadmapController.js";

const router = express.Router();

router.post("/", generateRoadmap);

export default router;
