import OpenAI from "openai";
import fs from "fs";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logDebug = (msg) => {
  const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
  const logPath = join(__dirname, '..', 'debug.log');
  fs.appendFileSync(logPath, logMsg);
  console.log(msg);
};

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

export const getInterviewQuestions = async (req, res) => {
  const { resume } = req.body;

  try {
    // If no resume provided, return a generic set of questions
    if (!resume) {
      return res.json({
        questions: [
          { id: 1, q: "Tell me about yourself and your career journey so far.", category: "Behavioral", difficulty: "Easy", tips: "Keep it professional — 2 minutes max. End with why you want this role." },
          { id: 2, q: "What are your greatest strengths and how do they apply to this role?", category: "Behavioral", difficulty: "Easy", tips: "Pick 2-3 strengths with real examples to back each one." },
          { id: 3, q: "Where do you see yourself in 5 years?", category: "Behavioral", difficulty: "Medium", tips: "Align your goal with growth in the company. Show ambition." },
          { id: 4, q: "Describe a challenging project and how you handled it.", category: "Behavioral", difficulty: "Medium", tips: "Use the STAR method: Situation → Task → Action → Result." },
          { id: 5, q: "How do you prioritize tasks when you have multiple deadlines?", category: "Situational", difficulty: "Medium", tips: "Mention tools like to-do lists, calendar blocking, or Kanban boards." },
          { id: 6, q: "Tell me about a time you worked in a team and what your role was.", category: "Behavioral", difficulty: "Easy", tips: "Show collaboration, communication, and your specific contribution." },
          { id: 7, q: "How do you handle criticism or negative feedback?", category: "Behavioral", difficulty: "Medium", tips: "Show openness to improvement. Give a real example of applying feedback." },
          { id: 8, q: "What do you know about our company and why do you want to join us?", category: "Situational", difficulty: "Medium", tips: "Always research the company before any interview. Mention specifics." },
          { id: 9, q: "What is your expected salary and notice period?", category: "Situational", difficulty: "Easy", tips: "Give a range based on market research. Be honest about notice period." },
          { id: 10, q: "Do you have any questions for us?", category: "Behavioral", difficulty: "Easy", tips: "Always ask at least 2 questions — about culture, growth, or the team." }
        ],
        readinessScore: 65,
        improvements: [
          "Upload your resume to get personalized questions",
          "Practice the STAR method for behavioral questions",
          "Research the company's products, culture, and recent news"
        ]
      });
    }
    const aiInstance = getOpenAI();
    if (aiInstance) {
      logDebug("🤖 Generating Interview Questions with AI...");
      try {
        const completion = await aiInstance.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert HR and Technical Interviewer. Analyze the provided resume thoroughly and generate exactly 20 tailored interview questions. Mix behavioral (STAR method), technical (specific to their skills), and situational questions. Return valid JSON only.",
            },
            {
              role: "user",
              content: `Generate 20 personalized interview questions for this candidate based on their background.
              
              Resume Data: ${JSON.stringify(resume)}
              
              Return JSON in this format:
              {
                "questions": [
                  {
                    "id": 1..20,
                    "q": "Highly specific question based on their resume highlights or skills?",
                    "category": "Technical/Behavioral/Situational",
                    "difficulty": "Easy/Medium/Hard",
                    "tips": "Specific advice for this question"
                  }
                ],
                "readinessScore": 85,
                "improvements": ["Specific improvement 1", "Specific improvement 2", "Specific improvement 3"]
              }`,
            },
          ],
          response_format: { type: "json_object" },
          timeout: 45000 // Increased timeout for 20 questions
        });

        const data = JSON.parse(completion.choices[0].message.content);
        return res.json(data);
      } catch (aiErr) {
        logDebug(`⚠️ AI Interview Error: ${aiErr.message}. Switching to Smart Fallback.`);
      }
    }

    // High-Quality Dynamic Fallback Pool
    const topSkills = resume?.skills?.slice(0, 3) || ["your core skills", "communication", "problem solving"];
    const exp = resume?.experience?.[0]?.company || "your previous role";
    
    res.json({
      questions: [
        { id: 1, q: `Walk me through the architecture of a major project you built at ${exp}.`, category: "Technical", difficulty: "Hard", tips: "Use the whiteboard approach. Explain data flow and tech choices." },
        { id: 2, q: `How would you explain the benefits of ${topSkills[0]} to a non-technical stakeholder?`, category: "Communication", difficulty: "Medium", tips: "Avoid jargon. Focus on business value like speed or cost." },
        { id: 3, q: `Describe a time you disagreed with a technical decision at ${exp}. How did you handle it?`, category: "Behavioral", difficulty: "Medium", tips: "Focus on data-driven persuasion and professional compromise." },
        { id: 4, q: `What is the most complex bug you solved using ${topSkills[1] || 'modern debugging tools'}?`, category: "Technical", difficulty: "Hard", tips: "Detail your isolation process and the final root cause fix." },
        { id: 5, q: "Tell me about a time you had to learn a new technology in a very short period of time.", category: "Behavioral", difficulty: "Easy", tips: "Showcase your learning methodology (docs, tutorials, pair programming)." },
        { id: 6, q: "How do you handle high-pressure situations or tight deadlines?", category: "Behavioral", difficulty: "Medium", tips: "Talk about prioritization and effective communication with managers." },
        { id: 7, q: `If you had to rebuild your ${topSkills[2] || 'core system'} today, what would you do differently?`, category: "Technical", difficulty: "Medium", tips: "Show growth and awareness of newer, better patterns." },
        { id: 8, q: "What do you consider your greatest professional achievement so far?", category: "Behavioral", difficulty: "Easy", tips: "Align this with the impact you had on the business or user base." },
        { id: 9, q: "Describe a situation where you had to work with a difficult team member.", category: "Behavioral", difficulty: "Medium", tips: "Focus on empathy and how you maintained project progress." },
        { id: 10, q: "How do you ensure the quality and security of the code you write?", category: "Technical", difficulty: "Medium", tips: "Mention unit tests, code reviews, and security scanning tools." }
      ],
      readinessScore: 78,
      improvements: [
        "Be more specific with metrics (%, $, time) in your project explanations",
        "Practice explaining high-level system components clearly",
        "Prepare more 'conflict resolution' stories from your past experience"
      ]
    });
  } catch (err) {
    logDebug(`Interview Controller Fatal Error: ${err.message}`);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};
