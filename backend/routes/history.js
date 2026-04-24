import { Router } from "express";
import { db } from "../config/firebase.js";

const router = Router();

router.get("/", async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.json({ versions: [
        { id: "v1", version: "v1.0", label: "Example Version", date: "2026-04-15", score: 85, isLatest: true }
      ]});
    }

    const snapshot = await db.collection("analyses")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const versions = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        version: `v${data.atsScore.overall}`,
        label: data.filename || "Resume Analysis",
        date: data.createdAt,
        score: data.atsScore.overall,
        isLatest: false // Logic can be improved
      };
    });

    res.json({ versions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", (req, res) => {
  const newVersion = { id: `v${versions.length + 1}`, ...req.body, date: new Date().toISOString().split('T')[0] };
  versions.unshift(newVersion);
  res.json({ success: true, version: newVersion });
});

export default router;
