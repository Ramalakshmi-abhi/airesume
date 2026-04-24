import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Briefcase, GraduationCap, Code2,
  FolderKanban, Award, AlertTriangle, CheckCircle, Lightbulb, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useResume } from "@/contexts/ResumeContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DEMO = {
  name: "Alex Johnson",
  email: "alex@example.com",
  phone: "+1 555-0111",
  skills: ["React", "Node.js", "TypeScript", "Python", "GraphQL", "Docker", "PostgreSQL", "Redis", "AWS", "Git"],
  missingSkills: ["Kubernetes", "Terraform", "System Design", "gRPC"],
  education: [{ degree: "B.Sc. Computer Science", institution: "Stanford University", year: "2021", gpa: "3.8" }],
  experience: [
    { title: "Senior Frontend Developer", company: "Google", duration: "2021–Present", bullets: ["Led team of 5", "Improved performance by 40%", "Shipped 3 major features"] },
    { title: "Software Engineer Intern", company: "Meta", duration: "Summer 2020", bullets: ["Worked on React Native", "Fixed 80+ bugs"] },
  ],
  projects: [
    { name: "AI Resume Parser", tech: "Python, NLP, FastAPI", desc: "Built an NLP model to parse resumes with 95% accuracy" },
    { name: "Real-time Dashboard", tech: "React, D3.js, WebSocket", desc: "Live analytics dashboard with 50k+ users" },
  ],
};

const DEMO_ATS = { overall: 78, keywords: 82, formatting: 70, structure: 75, experience: 80 };
const DEMO_SUGGESTIONS = [
  { type: "critical", text: "Add quantified metrics to all experience bullet points" },
  { type: "critical", text: "Include more ATS keywords: Kubernetes, Docker, CI/CD" },
  { type: "improvement", text: "Strengthen your summary/objective section" },
  { type: "improvement", text: "Add links to GitHub projects" },
  { type: "grammar", text: "Fix passive voice in 2 bullet points" },
];

const ScoreRing = ({ score, size = 120 }) => {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" className="dark:stroke-neutral-700" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize={size * 0.22} fontWeight="700" fill={color}>{score}</text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize={size * 0.09} fill="#888">ATS Score</text>
    </svg>
  );
};

const AnalyzePage = () => {
  const { resumeData, atsScore, skills, suggestions } = useResume();
  const navigate = useNavigate();
  
  if (!resumeData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertTriangle className="w-16 h-16 text-yellow-500 animate-pulse" />
        <h2 className="text-xl font-bold">No Analysis Found</h2>
        <p className="text-muted-foreground">Please upload your resume to see the full AI breakdown.</p>
        <Button onClick={() => navigate("/upload")}>Upload Now</Button>
      </div>
    );
  }

  const resume = resumeData;
  const score = atsScore || { overall: 0, keywords: 0, formatting: 0, structure: 0 };
  const allSuggestions = suggestions.map((s, i) => ({ type: i < 2 ? "critical" : "improvement", text: s }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Resume Analysis</h2>
        <p className="text-muted-foreground">Complete AI-powered breakdown of your resume</p>
      </motion.div>

      {/* Top Row: ATS + Personal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ATS Score */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="flex flex-col items-center justify-center py-6">
            <ScoreRing score={score.overall} />
            <div className="mt-4 space-y-2 w-full px-6">
              {[
                { label: "Keywords", val: score.keywords, color: "blue" },
                { label: "Formatting", val: score.formatting, color: "green" },
                { label: "Structure", val: score.structure, color: "yellow" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.val}%</span>
                  </div>
                  <Progress value={item.val} color={item.color} />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Personal Info */}
        <motion.div className="md:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
                  {resume.name?.[0] || "?"}
                </div>
                <div>
                  <p className="font-bold text-lg">{resume.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {resume.experience?.[0]?.title || "Profession Identified"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />{resume.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />{resume.phone}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Skills */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Code2 className="w-4 h-4" /> Skills Detected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">FOUND ({resume.skills?.length || 0})</p>
              <div className="flex flex-wrap gap-2">
                {(resume.skills || []).map((s) => (
                  <motion.span
                    key={s}
                    whileHover={{ scale: 1.08 }}
                    className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-sm font-medium cursor-default"
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </div>
            {resume.missingSkills?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" /> MISSING SKILLS
                </p>
                <div className="flex flex-wrap gap-2">
                  {resume.missingSkills.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-sm font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Experience + Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Briefcase className="w-4 h-4" /> Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(resume.experience || []).map((exp, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-blue-500/30">
                  <p className="font-semibold text-sm">{exp.title}</p>
                  <p className="text-xs text-muted-foreground">{exp.company} · {exp.duration}</p>
                  {exp.bullets && (
                    <ul className="mt-2 space-y-1">
                      {exp.bullets.map((b, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />{b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(resume.education || []).map((edu, i) => (
                  <div key={i}>
                    <p className="font-semibold text-sm">{edu.degree}</p>
                    <p className="text-xs text-muted-foreground">{edu.institution} · {edu.year}</p>
                    {edu.gpa && <Badge variant="success" className="mt-1 text-xs">GPA {edu.gpa}</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><FolderKanban className="w-4 h-4" /> Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(resume.projects || []).map((proj, i) => (
                  <div key={i}>
                    <p className="font-semibold text-sm">{proj.name}</p>
                    <p className="text-xs text-muted-foreground">{proj.desc}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.tech?.split(",").map((t) => (
                        <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded-md">{t.trim()}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* AI Suggestions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="w-4 h-4" /> AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allSuggestions.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                  s.type === "critical"
                    ? "bg-red-500/5 border-red-500/20"
                    : s.type === "grammar"
                    ? "bg-yellow-500/5 border-yellow-500/20"
                    : "bg-blue-500/5 border-blue-500/20"
                }`}
              >
                {s.type === "critical" ? (
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                ) : s.type === "grammar" ? (
                  <Award className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm">{s.text}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => navigate("/job-match")} className="flex-1 min-w-[150px]">
          Check Job Match →
        </Button>
        <Button onClick={() => navigate("/rewrite")} variant="outline" className="flex-1 min-w-[150px]">
          Rewrite with AI
        </Button>
        <Button onClick={() => window.print()} variant="secondary" className="flex-1 min-w-[150px]">
          <Download className="w-4 h-4 mr-2" /> Download Report
        </Button>
      </div>
    </div>
  );
};

export default AnalyzePage;
