import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { FileText, Zap, Target, Sparkles, TrendingUp, Award, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useResume } from "@/contexts/ResumeContext";
import { useNavigate } from "react-router-dom";

const CircularScore = ({ score, label, color = "#3b82f6" }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
        <motion.circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="65" textAnchor="middle" fill="currentColor" fontSize="28" fontWeight="700" className="fill-foreground">
          {score}
        </text>
        <text x="70" y="82" textAnchor="middle" fill="#888" fontSize="11">/ 100</text>
      </svg>
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
    </div>
  );
};

const SkillBar = ({ skill, value, delay = 0 }) => {
  const color = value >= 80 ? "green" : value >= 60 ? "blue" : "yellow";
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-1"
    >
      <div className="flex justify-between text-sm">
        <span className="font-medium">{skill}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} color={color} />
    </motion.div>
  );
};

const statCards = [
  {
    title: "ATS Score",
    value: "78",
    unit: "/100",
    icon: Award,
    color: "from-blue-500 to-cyan-500",
    bg: "from-blue-500/5 to-cyan-500/5",
    change: "+5 this week",
    changeType: "up",
  },
  {
    title: "Skills Found",
    value: "24",
    unit: " skills",
    icon: Zap,
    color: "from-violet-500 to-purple-600",
    bg: "from-violet-500/5 to-purple-500/5",
    change: "8 missing",
    changeType: "warn",
  },
  {
    title: "Job Match",
    value: "72",
    unit: "%",
    icon: Target,
    color: "from-emerald-500 to-green-600",
    bg: "from-emerald-500/5 to-green-500/5",
    change: "Good match",
    changeType: "up",
  },
  {
    title: "Suggestions",
    value: "12",
    unit: " tips",
    icon: Sparkles,
    color: "from-orange-500 to-rose-500",
    bg: "from-orange-500/5 to-rose-500/5",
    change: "3 critical",
    changeType: "warn",
  },
];

const skillsData = [
  { skill: "React.js", value: 90 },
  { skill: "Node.js", value: 75 },
  { skill: "Python", value: 65 },
  { skill: "SQL", value: 80 },
  { skill: "TypeScript", value: 55 },
];

const radarData = [
  { subject: "Technical", A: 80 },
  { subject: "Leadership", A: 55 },
  { subject: "Communication", A: 70 },
  { subject: "Problem Solving", A: 85 },
  { subject: "Teamwork", A: 75 },
  { subject: "Creativity", A: 60 },
];

const DashboardPage = () => {
  const { resumeData, atsScore } = useResume();
  const navigate = useNavigate();

  // Dynamic Data
  const score = atsScore?.overall || 0;
  const skillsCount = resumeData?.skills?.length || 0;
  const suggestionsCount = resumeData?.suggestions?.length || 0;
  const jobMatch = 72; // Placeholder for now

  const dynamicStats = [
    { title: "ATS Score", value: score, unit: "/100", icon: Award, color: "from-blue-500 to-cyan-500", bg: "from-blue-500/5 to-cyan-500/5", change: score > 70 ? "Healthy" : "Needs Work", changeType: score > 70 ? "up" : "warn" },
    { title: "Skills Found", value: skillsCount, unit: " skills", icon: Zap, color: "from-violet-500 to-purple-600", bg: "from-violet-500/5 to-purple-500/5", change: `${resumeData?.missingSkills?.length || 0} missing`, changeType: "warn" },
    { title: "Job Match", value: jobMatch, unit: "%", icon: Target, color: "from-emerald-500 to-green-600", bg: "from-emerald-500/5 to-green-500/5", change: "Average", changeType: "up" },
    { title: "Suggestions", value: suggestionsCount, unit: " tips", icon: Sparkles, color: "from-orange-500 to-rose-500", bg: "from-orange-500/5 to-rose-500/5", change: "Action required", changeType: "warn" },
  ];

  const chartSkills = (resumeData?.skills || ["React", "Node", "Python", "SQL", "Git"]).slice(0, 5).map(s => ({
    skill: s,
    value: Math.floor(Math.random() * 40) + 60
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Welcome back! 👋</h2>
        <p className="text-muted-foreground">Here's an overview of your resume performance</p>
      </motion.div>

      {!resumeData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 rounded-2xl p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold">No resume uploaded yet</p>
              <p className="text-sm text-muted-foreground">Upload your resume to get AI-powered insights</p>
            </div>
          </div>
          <Button onClick={() => navigate("/upload")}>
            Upload Resume <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {dynamicStats.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className={`bg-gradient-to-br ${card.bg} border-0 cursor-pointer`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <Badge variant={card.changeType === "up" ? "success" : "warning"} className="text-xs">
                    {card.changeType === "up" ? "↑" : "⚠"} {card.change}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{card.value}</span>
                  <span className="text-muted-foreground text-sm">{card.unit}</span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">{card.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ATS Circular */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">ATS Score Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-around">
              <CircularScore score={score} label="Overall" color="#3b82f6" />
              <div className="space-y-3 flex-1 ml-4">
                {[
                  { label: "Keywords", val: atsScore?.keywords || 0 },
                  { label: "Formatting", val: atsScore?.formatting || 0 },
                  { label: "Structure", val: atsScore?.structure || 0 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span>{item.val}%</span>
                    </div>
                    <Progress value={item.val} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills Bar Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skills Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartSkills} barSize={32}>
                  <XAxis dataKey="skill" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="url(#gradient)" />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Skill Strengths Radar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Competency Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Skills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {chartSkills.map((s, i) => (
                <SkillBar key={s.skill} skill={s.skill} value={s.value} delay={i * 0.08} />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
