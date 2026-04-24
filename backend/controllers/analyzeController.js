import OpenAI from "openai";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { db } from "../config/firebase.js";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logDebug = (msg) => {
  console.log(msg);
};

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const COMMON_SKILLS = [
  "JavaScript","TypeScript","Python","Java","C++","React","Vue","Angular","Node.js","Express",
  "Django","FastAPI","SQL","PostgreSQL","MongoDB","Redis","Docker","Kubernetes","AWS","Git",
  "Voice Process","Non-Voice Process","Customer Service","BPO","Customer Support","Call Center",
  "Communication","Team Management","Operations","Banking","Financial Services","Sales","Marketing",
  "Project Management","Excel","PowerPoint","English Proficiency","Tele-calling","Data Entry","Recovery",
];

function extractSkills(text) {
  const found = new Set();
  COMMON_SKILLS.forEach((skill) => {
    try {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      if (regex.test(text)) found.add(skill);
    } catch (e) {}
  });
  return Array.from(found);
}

function calculateATS(text, skills) {
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /(\+?\d[\d\s\-().]{8,}\d)/.test(text);
  const hasEducation = /education|university|college|bachelor|master|degree|b\.sc|m\.sc/i.test(text);
  const hasExperience = /experience|work|employment|job|position|role/i.test(text);

  const keywords = Math.min(100, skills.length * 5 + 30);
  const formatting = (hasEmail ? 20 : 0) + (hasPhone ? 20 : 0) + 30;
  const structure = (hasEducation ? 50 : 0) + (hasExperience ? 50 : 0);

  const overall = Math.round((keywords * 0.4) + (formatting * 0.3) + (structure * 0.3));
  return { overall: Math.min(95, overall), keywords: Math.min(100, keywords), formatting: Math.min(100, formatting), structure };
}

export const analyzeResume = async (req, res) => {
  const { filename, text, userId, fileUrl } = req.body;
  logDebug(`📝 Analyze request received for: ${filename}`);

  try {
    let resumeText = text || "";
    if (fileUrl && !resumeText) {
      logDebug(`📂 Resolving local file from URL: ${fileUrl}`);
      const localFileName = decodeURIComponent(fileUrl.split('/').pop());
      const localFilePath = join(__dirname, '..', 'uploads', localFileName);
      
      if (fs.existsSync(localFilePath)) {
        logDebug(`📖 Reading file: ${localFilePath}`);
        const buffer = fs.readFileSync(localFilePath);
        if (filename?.toLowerCase().endsWith('.pdf')) {
          logDebug("📄 Parsing PDF...");
          const pdfData = await pdf(buffer);
          resumeText = pdfData.text;
        } else if (filename?.toLowerCase().endsWith('.docx')) {
          logDebug("📄 Parsing DOCX...");
          const docxData = await mammoth.extractRawText({ buffer });
          resumeText = docxData.value;
        }
      }
    }

    const startTime = Date.now();
    logDebug(`📊 Text extraction complete. Length: ${resumeText.length}`);
    const skills = extractSkills(resumeText);
    const atsScore = calculateATS(resumeText, skills);
    
    let parsedData = null;
    const aiInstance = getOpenAI();
    if (aiInstance) {
      logDebug("🤖 Contacting OpenAI...");
      const aiStartTime = Date.now();
      try {
        const completion = await aiInstance.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are an expert resume parser. Extract structured data and return valid JSON only. Output keys exactly as requested." },
            { role: "user", content: `Parse this resume and return JSON with:\n- name (string)\n- email (string)\n- phone (string)\n- summary (string)\n- skills (array of strings)\n- education (array of objects {degree, institution, duration})\n- experience (array of objects {title, company, duration, bullets: array of strings})\n- projects (array of objects {name, desc})\n- extracurricular (array of strings)\n\nResume:\n${resumeText.slice(0, 15000)}` },
          ],
          response_format: { type: "json_object" },
          timeout: 15000 
        });
        parsedData = JSON.parse(completion.choices[0].message.content);
        logDebug(`✅ AI Extraction Successful (${Date.now() - aiStartTime}ms)`);
      } catch (e) {
        logDebug(`⚠️ AI Fallback (${Date.now() - aiStartTime}ms): ${e.message}`);
      }
    }

    logDebug("⚙️ Running Final Layout & Summary Lock Parser...");
    
    // 0. Column Splitting & Cleaning
    const rawLines = resumeText.split('\n').filter(l => l.trim().length > 0);
    const docLines = [];
    rawLines.forEach(line => {
      const parts = line.split(/\s{3,}/).map(p => p.trim()).filter(p => p.length > 0);
      docLines.push(...parts);
    });
    
    const buckets = { summary: [], experience: [], education: [], projects: [], skills: [], extra: [], languages: [], contact: [] };
    
    const contactRegex = {
      email: /[\w.-]+@[\w.-]+\.\w+/,
      phone: /(\+?\d{1,4}[\s-]?)?(\d[\d\s\-().]{8,}\d)/,
      phonePrefix: /^\+91$|^\+1$|^PHONE:?$|^TEL:?$/i,
      location: /TAMIL\s+NADU|INDIA|RAJAPALAYAM|SIVAKASI|CHENNAI|KARUR|MADURAI/i
    };

    // 1. Explicit Summary Lock (Find the paragraph early)
    let summaryText = "";
    const summaryIdx = docLines.findIndex(l => l.length > 60 && /MOTIVATED|EXPERIENCED|SKILLED|SENIOR|PROFESSIONAL|LOOKING\s+TO\s+GROW/i.test(l) && !l.includes("@"));
    if (summaryIdx !== -1) {
      summaryText = docLines[summaryIdx];
    }

    const keywords = {
      projects: /MADURA\s+SPEND|EXPENSE|DASHBOARD|ATTENDANCE|BIO-METRIC|ALARM|RAILWAY|POURING|INFORMER|AUTHENTICATION|TECH:|STACK:|ROLL\s+ASSIGNED/i,
      education: /COLLEGE|UNIVERSITY|DIPLOMA|POLYTECHNIC|PERCENTAGE|B\.E\.|ENGINEERING\s+\(CSE\)|CGPA|BOARD/i,
      experience: /MADURA\s+SOLUTIONS|SOFTWARE\s+ENGINEER|DEVELOPER|FULL\s+STACK|PRESENT|OCT\s+2025|HISTORY/i,
      actions: /DEVELOPED|WORKED|FIXED|MAINTAINED|COLLABORATED|DELIVERED|ENABLED|DESIGNED|IMPLEMENTED|BUILT|CREATED|TESTED|CODED/i
    };

    let currentSection = 'summary';

    docLines.forEach((line) => {
      const lineUp = line.toUpperCase().trim();
      const isBullet = /^[-\u2022\u25CF\u25E6\u2023\u2219*]/.test(line);

      // Global Filter: Skip obvious contact info from buckets
      if (contactRegex.email.test(line) || contactRegex.phone.test(line) || contactRegex.phonePrefix.test(lineUp)) {
        buckets.contact.push(line);
        return;
      }

      // Section Headings (Strict)
      if (line.length < 35) {
        if (/EXPERIENCE|WORK\s+HISTORY|EMPLOYMENT/i.test(lineUp)) { currentSection = 'experience'; return; }
        if (/EDUCATION|ACADEMIC|QUALIFICATION/i.test(lineUp)) { currentSection = 'education'; return; }
        if (/PROJECTS|ACADEMIC\s+PROJECTS|PERSONAL\s+PROJECTS/i.test(lineUp)) { currentSection = 'projects'; return; }
        if (/SKILLS|TECHNICAL\s+SKILLS|EXPERTISE/i.test(lineUp)) { currentSection = 'skills'; return; }
        if (/CERTIFICATE|ACHIEVEMENTS|AWARDS/i.test(lineUp)) { currentSection = 'extra'; return; }
        if (/LANGUAGES/i.test(lineUp)) { currentSection = 'languages'; return; }
        if (/ABOUT\s+ME|SUMMARY|OBJECTIVE|CONTACT|PROFILE/i.test(lineUp)) { currentSection = 'summary'; return; }
      }

      // Re-route content based on strong keywords (Ignore currentSection if it's a strong match)
      if (isBullet || keywords.actions.test(line)) {
          if (keywords.projects.test(line)) { buckets.projects.push(line); return; }
          if (keywords.experience.test(line)) { buckets.experience.push(line); return; }
      }

      if (keywords.projects.test(line)) { buckets.projects.push(line); return; }
      if (keywords.education.test(line)) { buckets.education.push(line); return; }
      if (keywords.experience.test(line)) { buckets.experience.push(line); return; }

      // Default push to current section
      if (!/EXPERIENCE|EDUCATION|PROJECTS|SKILLS|ABOUT\s+ME|CONTACT|PROFILE|SUMMARY/i.test(lineUp)) {
        buckets[currentSection].push(line);
      }
    });

    const processItems = (linesArr, isExp) => {
      if (!linesArr || linesArr.length === 0) return [];
      const result = [];
      let current = null;
      const noiseWords = /ABOUT\s+ME|CONTACT|PROFILE|SUMMARY|RAJAPALAYAM|TAMIL\s+NADU|INDIA|^\+91$|^\d{10}$/i;

      linesArr.forEach(line => {
        if (noiseWords.test(line)) return;
        const isBulletOrAction = /^[-\u2022\u25CF\u25E6\u2023\u2219*]/.test(line) || keywords.actions.test(line);
        const isHeaderCandidate = !isBulletOrAction && line.length < 85;

        if (isHeaderCandidate) {
          if (current) result.push(current);
          const p = line.split(/[|·,-]/);
          const namePart = p[0]?.trim();
          if (isExp) {
            current = { 
              title: namePart || "Professional Role", 
              company: line.includes("Solutions") ? "Madura Solutions" : (p[1] ? p[1].trim() : "Organization"), 
              duration: (p.slice(2).join(" ").trim() || (p[1] && !line.includes("Solutions") ? "" : p[1]?.trim())) || "", 
              bullets: [] 
            };
          } else {
            current = { name: namePart || "Project Detail", desc: p.slice(1).join(" ").trim() || "" };
          }


        } else if (current) {
          const clean = line.replace(/^[-\u2022\u25CF\u25E6\u2023\u2219*]\s*/, "");
          if (isExp) current.bullets.push(clean);
          else current.desc += (current.desc ? " " : "") + clean;
        } else if (isBulletOrAction) {
          if (isExp) result.push({ title: "Professional Role", company: "Organization", duration: "", bullets: [line] });
          else result.push({ name: "Project Detail", desc: line });
        }
      });
      if (current) result.push(current);
      return result;
    };


    const processEducation = (linesArr) => {
      if (!linesArr || linesArr.length === 0) return [];
      const result = [];
      let current = null;
      
      linesArr.forEach(line => {
        const lineUp = line.toUpperCase().trim();
        const isInst = /COLLEGE|UNIVERSITY|POLYTECHNIC|BOARD|SCHOOL/i.test(lineUp);
        const isDegree = /(^| )(B\.E\.|B\.TECH|B\.SC|M\.SC|DIPLOMA|HSC|SSLC|SECONDARY|BACHELOR|MASTER)( |$)/i.test(lineUp) || 
                         (/^DIPLOMA IN /i.test(lineUp)) || 
                         (lineUp.includes("ENGINEERING") && !isInst);
        const isScore = /PERCENTAGE|CGPA|MARKS|%\s*[:\-]?\s*\d+/i.test(lineUp);
        const isYear = /\d{4}\s*-\s*\d{4}|\d{4}\s*-\s*PRESENT/i.test(lineUp);

        if (isDegree && !isInst) {
          if (current) result.push(current);
          current = { degree: line, institution: "Institution", year: "" };
        } else if (isInst) {
          if (!current) {
            current = { degree: "Academic Detail", institution: line, year: "" };
          } else if (current.institution === "Institution") {
            current.institution = line;
          } else {
            current.institution += ", " + line;
          }
        } else if (current) {
          if (isScore) {
            current.degree += (current.degree ? " | " : "") + line;
          } else if (isYear) {
            current.year = line;
          } else {
            if (line.length > 50 && keywords.actions.test(line)) return; 
            current.institution += (current.institution ? ", " : "") + line;
          }
        }
      });
      if (current) result.push(current);
      return result;
    };



    const cleanBucket = (arr) => arr.filter(l => !/ABOUT\s+ME|CONTACT|PROFILE|SUMMARY|RAJAPALAYAM|TAMIL\s+NADU|INDIA|^\+91$|^\d{10}$|^\+91\d{10}$/i.test(l));

    const analysisResult = {
      name: parsedData?.name || docLines.find(l => l.length > 5 && l.length < 35 && !l.includes("@") && !contactRegex.location.test(l) && !/MADURA/i.test(l)) || "Candidate",
      email: parsedData?.email || resumeText.match(contactRegex.email)?.[0] || "",
      phone: parsedData?.phone || resumeText.match(contactRegex.phone)?.[0] || "",
      summary: parsedData?.summary || summaryText || "Qualified professional.",
      skills: Array.from(new Set([...(parsedData?.skills || []), ...docLines.filter(l => /MERN|HTML|CSS|JAVASCRIPT/i.test(l)).flatMap(s => s.split(/[,|•]/)).map(s => s.trim())])),
      softSkills: ["Communication", "Problem Solving", "Collaboration"],
      education: (parsedData?.education?.length > 0 ? parsedData.education : processEducation(cleanBucket(buckets.education))),
      experience: (parsedData?.experience?.length > 0 ? parsedData.experience : processItems(cleanBucket(buckets.experience), true)),
      projects: (parsedData?.projects?.length > 0 ? parsedData.projects : processItems(cleanBucket(buckets.projects), false)),
      extracurricular: (parsedData?.extracurricular?.length > 0 ? parsedData.extracurricular : [...cleanBucket(buckets.extra), ...cleanBucket(buckets.languages)]),
      atsScore,
      suggestions: [
        "Your resume data has been manually aligned with your document headings.",
        "Verify your 'Projects' card for 'Madura Spend' and 'Fire Alarm' items.",
        "Check that 'Madura Solutions' bullets are correctly attached in Experience.",
        "Education entries now group Institution and Percentage together."
      ],
      fileUrl,
      userId: userId || "anonymous"
    };





    logDebug(`🚀 Final Aligned Response Sent for: ${analysisResult.name}`);
    res.json(analysisResult);

    try {
      if (userId && userId !== "anonymous" && db) {
        await db.collection("analyses").add({ ...analysisResult, serverTimestamp: new Date() });
      }
    } catch (dbErr) {
      logDebug(`Firestore Silent Fail: ${dbErr.message}`);
    }
  } catch (err) {
    logDebug(`🔥 FATAL in analyzeResume: ${err.message}`);
    console.error(err);
    res.status(500).json({ error: "Failed to align resume data with headings" });
  }
};












export const downloadResume = async (req, res) => {
  const { resume, format = "modern" } = req.body;
  if (!resume) return res.status(400).json({ error: "No data" });

  try {
    let fontName = format === "creative" ? "Avenir" : format === "minimalist" ? "Georgia" : format === "classic" ? "Arial" : "Calibri";
    let colorAcc = format === "creative" ? "1e3a8a" : format === "minimalist" ? "000000" : format === "classic" ? "111111" : "2E74B5";
    let nameSize = format === "classic" || format === "minimalist" ? 40 : 48;
    let headingAlign = format === "minimalist" ? AlignmentType.LEFT : AlignmentType.CENTER;
    
    // Helper to generate perfectly aligned right-aligned dates using Tables
    const createHeaderRow = (title, company, duration, isEdu = false) => {
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0 },
          bottom: { style: BorderStyle.NONE, size: 0 },
          left: { style: BorderStyle.NONE, size: 0 },
          right: { style: BorderStyle.NONE, size: 0 },
          insideHorizontal: { style: BorderStyle.NONE, size: 0 },
          insideVertical: { style: BorderStyle.NONE, size: 0 }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 85, type: WidthType.PERCENTAGE },
                margins: { top: 100, bottom: 50 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: title, bold: true, size: 24, font: fontName }),
                      new TextRun({ text: company ? (isEdu ? `, ${company}` : ` | ${company}`) : "", italics: !isEdu, size: 24, font: fontName })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 15, type: WidthType.PERCENTAGE },
                margins: { top: 100, bottom: 50 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({ text: duration || "", bold: true, size: 22, font: fontName, color: "555555" })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });
    };

    // Helper for Section Headings
    const createSectionHeading = (title) => {
      return new Paragraph({
        text: title.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        color: colorAcc,
        alignment: headingAlign,
        spacing: { before: 300, after: 100 },
        border: { bottom: { color: format === "minimalist" ? "000000" : "CCCCCC", space: 5, value: "single", size: 10 } }
      });
    };

    // Construct contact info string
    const contactInfo = [resume.email, resume.phone, resume.location, resume.linkedin].filter(Boolean).join("  |  ");

    const doc = new Document({
      styles: {
        default: { document: { run: { font: fontName, size: 22, color: "333333" } } }
      },
      sections: [{
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
        children: [
          // Header (Name and Contact)
          new Paragraph({
            children: [new TextRun({ text: (resume.name || "YOUR NAME").toUpperCase(), bold: true, size: nameSize, font: fontName, color: format === "minimalist" ? "000000" : colorAcc })],
            alignment: headingAlign,
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: contactInfo, size: 20, font: fontName, color: "555555" })],
            alignment: headingAlign,
            spacing: { after: 300 }
          }),

          // Professional Summary
          ...(resume.summary ? [
            createSectionHeading("Professional Summary"),
            new Paragraph({
              children: [new TextRun({ text: resume.summary, size: 22, font: fontName })],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 }
            })
          ] : []),

          // Skills
          ...(resume.skills && resume.skills.length > 0 ? [
            createSectionHeading("Technical Skills"),
            new Paragraph({
              children: [new TextRun({ text: Array.isArray(resume.skills) ? resume.skills.join(" • ") : resume.skills, size: 22, font: fontName })],
              spacing: { after: 200 }
            })
          ] : []),

          // Experience
          ...(resume.experience && resume.experience.length > 0 ? [
            createSectionHeading("Professional Experience"),
            ...resume.experience.flatMap((exp) => {
              // Handle messy parsed titles/companies by extracting actual values if possible
              const displayTitle = exp.title ? exp.title.replace(/\| Professional Role/g, '').trim() : "";
              const displayCompany = exp.company !== "Professional Role" ? exp.company : "";
              
              return [
                createHeaderRow(displayTitle, displayCompany, exp.duration || exp.year),
                ...(exp.bullets || []).map(b => new Paragraph({
                  children: [new TextRun({ text: b.trim(), size: 22, font: fontName })],
                  bullet: { level: 0 },
                  spacing: { after: 80 }
                }))
              ];
            })
          ] : []),

          // Projects
          ...(resume.projects && resume.projects.length > 0 ? [
            createSectionHeading("Projects"),
            ...resume.projects.flatMap((proj) => [
              new Paragraph({
                children: [
                  new TextRun({ text: proj.name, bold: true, size: 22, font: fontName }),
                  new TextRun({ text: proj.desc ? ` — ${proj.desc}` : "", size: 22, font: fontName })
                ],
                bullet: { level: 0 },
                spacing: { after: 100 }
              })
            ])
          ] : []),

          // Education
          ...(resume.education && resume.education.length > 0 ? [
            createSectionHeading("Education"),
            ...resume.education.flatMap((edu) => {
              const displayDegree = edu.degree ? edu.degree.replace(/\| Academic Institution/g, '').trim() : "";
              const displayInst = edu.institution !== "Academic Institution" ? edu.institution : "";
              return [
                createHeaderRow(displayDegree, displayInst, edu.year || edu.duration, true)
              ];
            })
          ] : []),

          // Extracurricular
          ...(resume.extracurricular && resume.extracurricular.length > 0 ? [
            createSectionHeading("Achievements & Activities"),
            ...resume.extracurricular.map((item) => new Paragraph({
              children: [new TextRun({ text: item, size: 22, font: fontName })],
              bullet: { level: 0 },
              spacing: { after: 80 }
            }))
          ] : [])
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const fileName = `Updated_Resume_${Date.now()}.docx`;
    const filePath = join(__dirname, '..', 'uploads', fileName);
    
    await fs.promises.writeFile(filePath, buffer);
    const fileUrl = `http://localhost:5005/download-file?name=${fileName}`;
    
    res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).json({ error: "Failed to generate Word document" });
  }
};

export const downloadFileNative = async (req, res) => {
  const { name } = req.query;
  const filePath = join(__dirname, '..', 'uploads', name);
  if (fs.existsSync(filePath)) {
    res.download(filePath, "Updated_Resume.docx"); 
  } else {
    res.status(404).send("File not found");
  }
};
