import OpenAI from "openai";

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

export const rewriteResume = async (req, res) => {
  const { content } = req.body;

  try {
    let rewritten = null;
    const aiInstance = getOpenAI();

    if (aiInstance && content) {
      try {
        const completion = await aiInstance.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an expert resume writer. Rewrite resume content to be:
- ATS-optimized with strong action verbs
- Quantified with specific metrics and numbers
- Professional and impactful
- Using industry-standard terminology
Return only the rewritten text, no explanations.`,
            },
            {
              role: "user",
              content: `Rewrite this resume section to be more impactful and ATS-friendly:\n\n${content}`,
            },
          ],
        });
        rewritten = completion.choices[0].message.content;
      } catch (e) {
        console.error("Rewrite AI Error:", e.message);
      }
    }

    // Dynamic Smart Fallback (when AI is down/quota exceeded)
    let fallbackText = content;
    if (!rewritten && content) {
       const verbs = ["Spearheaded", "Engineered", "Optimized", "Architected", "Automated"];
       const impacts = ["to improve performance", "enhancing overall user experience", "achieving significant efficiency gains"];
       
       // Simple transformation: add a power verb and an impact phrase
       fallbackText = `${verbs[Math.floor(Math.random() * verbs.length)]} ${content.charAt(0).toLowerCase()}${content.slice(1)} ${impacts[Math.floor(Math.random() * impacts.length)]}.`;
    }

    res.json({
      rewritten: rewritten || fallbackText,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
