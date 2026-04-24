import OpenAI from "openai";

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

export const generateRoadmap = async (req, res) => {
  const { resume } = req.body;

  try {
    const aiInstance = getOpenAI();
    if (aiInstance) {
      console.log("🤖 Generating Skill Roadmap with AI...");
      const missingText = resume.missingSkills?.length > 0 ? `Missing Skills: ${resume.missingSkills.join(", ")}` : "Identify common gaps for their profile.";
      
      const completion = await aiInstance.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a career development expert. Generate a personalized skill roadmap based on the candidate's current capabilities. Return valid JSON only.",
          },
          {
            role: "user",
            content: `Analyze this profile and identify 3 next-level or missing skills to boost their career. Then provide a roadmap to master them.
            
            Current Skills: ${(resume.skills || []).join(", ")}
            Profile: ${resume.name} - ${resume.summary}
            Experience: ${(resume.experience || []).map(e => e.title).join(", ")}
            
            Return JSON in this format:
            {
              "missingSkills": ["Skill 1", "Skill 2", "Skill 3"],
              "roadmap": [
                {
                  "stage": "Stage Name",
                  "title": "Actionable Skill Goal",
                  "desc": "Short description",
                  "status": "pending/in-progress/completed",
                  "progress": 0,
                  "resources": ["Resource 1", "Resource 2"]
                }
              ]
            }`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const data = JSON.parse(completion.choices[0].message.content);
      return res.json(data);
    }

    // Demo Fallback (Dynamic based on missing skills)
    const fallbackSkills = resume.missingSkills?.length > 0 
      ? resume.missingSkills 
      : (resume.skills?.includes("Sales") || resume.skills?.includes("Marketing"))
        ? ["CRM Software", "Data Analytics", "Advanced Negotiation"]
        : ["Cloud Computing", "System Architecture", "Leadership"];
    
    res.json({
      missingSkills: fallbackSkills,
      roadmap: fallbackSkills.map((skill, i) => ({
        stage: i === 0 ? "Fundamentals" : i === 1 ? "Technical Deep Dive" : "Advanced Mastery",
        title: `Master ${skill}`,
        desc: `Bridge the gap by learning ${skill} and its ecosystem to enhance your profile as a ${resume.experience?.[0]?.title || "Professional"}.`,
        status: i === 0 ? "in-progress" : "pending",
        progress: i === 0 ? 35 : 0,
        resources: [`Official ${skill} Documentation`, `${skill} Bootcamp on YouTube`, `Hands-on Project with ${skill}`]
      })).slice(0, 4)
    });
  } catch (err) {
    console.error("Roadmap Error:", err);
    res.status(500).json({ error: err.message });
  }
};
