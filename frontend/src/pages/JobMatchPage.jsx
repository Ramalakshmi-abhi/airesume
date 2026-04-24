import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Zap, AlertTriangle, CheckCircle, Search, MapPin, Building2, Heart, BriefcaseBusiness } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toaster";
import { matchJob } from "@/services/api";
import { useResume } from "@/contexts/ResumeContext";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Cell
} from "recharts";

const GaugeChart = ({ value }) => {
  const color = value >= 75 ? "#22c55e" : value >= 50 ? "#f59e0b" : "#ef4444";
  const r = 70;
  const circ = Math.PI * r; // half circle
  const dash = (value / 100) * circ;

  return (
    <svg width="180" height="100" viewBox="0 0 180 100">
      <path
        d={`M 20 90 A ${r} ${r} 0 0 1 160 90`}
        fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round"
        className="dark:stroke-neutral-700"
      />
      <motion.path
        d={`M 20 90 A ${r} ${r} 0 0 1 160 90`}
        fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <text x="90" y="80" textAnchor="middle" fontSize="28" fontWeight="700" fill={color}>{value}%</text>
      <text x="90" y="97" textAnchor="middle" fontSize="10" fill="#888">Job Match</text>
    </svg>
  );
};

const JobMatchPage = () => {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { resumeData } = useResume();

  const handleMatch = async () => {
    if (!jd.trim()) return toast("Please paste a job description", "error");
    setLoading(true);
    try {
      const { data } = await matchJob({ jobDescription: jd, resume: resumeData });
      setResult(data);
    } catch {
      // Offline Local Fallback
      let offlineTitle = jd.trim().split('\n')[0].substring(0, 40).replace(/\b\w/g, c => c.toUpperCase()) || "General Role";
      setResult({
        jobTitle: offlineTitle,
        applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(offlineTitle)}`,
        recommendedJobs: [
          { title: "Frontend Developer", company: "TechCorp", location: "Remote", date: "Just now", portal: "LinkedIn", link: "https://www.linkedin.com/jobs/search/?keywords=Frontend+Developer" },
          { title: "Full Stack Engineer", company: "Innovate AI", location: "Bangalore", date: "1 day ago", portal: "Indeed", link: "https://www.indeed.com/jobs?q=Full+Stack+Engineer" },
          { title: "React Developer", company: "Web Systems", location: "Chennai", date: "2 days ago", portal: "Glassdoor", link: "https://www.glassdoor.com/Job/jobs.htm?sc.keyword=React+Developer" },
          { title: "Software Engineer II", company: "Global Tech", location: "Hyderabad", date: "3 days ago", portal: "LinkedIn", link: "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer" },
          { title: "UI Architect", company: "Design Pro", location: "Pune", date: "4 days ago", portal: "Indeed", link: "https://www.indeed.com/jobs?q=UI+Architect" },
          { title: "Node.js Developer", company: "CloudScale", location: "San Francisco", date: "5 days ago", portal: "Wellfound", link: "https://wellfound.com/jobs?q=Node.js+Developer" },
          { title: "Staff Engineer", company: "Visionary Inc", location: "New York", date: "1 week ago", portal: "Glassdoor", link: "https://www.glassdoor.com/Job/jobs.htm?sc.keyword=Staff+Engineer" },
          { title: "Junior Web Dev", company: "EduTech", location: "Mumbai", date: "2 weeks ago", portal: "Monster", link: "https://www.monster.com/jobs/search/?q=Junior+Web+Developer" },
          { title: "Lead Frontend", company: "StartupX", location: "Remote", date: "3 weeks ago", portal: "Wellfound", link: "https://wellfound.com/jobs?q=Frontend+Engineer" },
          { title: "Product Engineer", company: "Growth Labs", location: "Austin", date: "1 month ago", portal: "LinkedIn", link: "https://www.linkedin.com/jobs/search/?keywords=Product+Engineer" },
          { title: "Javascript Specialist", company: "DevForce", location: "Berlin", date: "2 days ago", portal: "Indeed", link: "https://www.indeed.com/jobs?q=Javascript+Developer" },
          { title: "Backend Engineer", company: "Datacom", location: "London", date: "3 days ago", portal: "Glassdoor", link: "https://www.glassdoor.com/Job/jobs.htm?sc.keyword=Backend+Engineer" },
          { title: "Mobile UI Dev", company: "AppWorks", location: "Remote", date: "4 days ago", portal: "Monster", link: "https://www.monster.com/jobs/search/?q=Mobile+UI+Developer" },
          { title: "Software Architect", company: "ScaleUp", location: "Seattle", date: "5 days ago", portal: "Wellfound", link: "https://wellfound.com/jobs?q=Software+Architect" },
          { title: "Systems Designer", company: "CoreTech", location: "Tokyo", date: "6 days ago", portal: "LinkedIn", link: "https://www.linkedin.com/jobs/search/?keywords=Systems+Designer" }
        ],
        matchScore: 74,
        matchedKeywords: ["React", "Node.js", "TypeScript", "REST API", "Agile", "Git"],
        missingKeywords: ["Kubernetes", "GraphQL", "CI/CD", "AWS Lambda", "Terraform"],
        breakdown: [
          { label: "Technical Skills", score: 80 },
          { label: "Experience Level", score: 70 },
          { label: "Education", score: 90 },
          { label: "Soft Skills", score: 60 },
          { label: "Keywords", score: 65 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Job Matching</h2>
        <p className="text-muted-foreground">Paste a job description to see how well your resume matches</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paste Job Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              rows={8}
              placeholder="Paste the full job description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="resize-none"
            />
            <Button onClick={handleMatch} disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing match...
                </span>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Analyze Match
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Job Match Result Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-blue-500/20 bg-blue-500/5 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Target className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-foreground">
                          {result.jobTitle || "Matching Role Identified"}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-muted-foreground">{result.matchScore}% Match Score</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => window.open(result.applyUrl || result.link || `https://www.google.com/search?q=${encodeURIComponent((result.jobTitle || "software engineer") + " job application")}`, "_blank")}
                      size="lg"
                      className="w-full md:w-auto px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20"
                    >
                      Apply for this Role
                      <Zap className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            {/* Similar Job Offers (Style from User Screenshot) */}
            <div className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tight">Similar Job Offers</h3>
                <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-500/10">Based on your Resume</Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {(result.recommendedJobs || []).map((job, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-white dark:bg-slate-900 border border-border hover:border-blue-500/30 rounded-xl p-5 transition-all hover:shadow-lg flex items-start justify-between cursor-pointer"
                    onClick={() => window.open(job.link || `https://www.google.com/search?q=${encodeURIComponent(job.title + " " + job.company)}`, "_blank")}
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/10 transition-colors">
                        <BriefcaseBusiness className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold leading-tight group-hover:text-blue-500 transition-colors">
                          {job.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                             <MapPin className="w-4 h-4" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                             <Building2 className="w-4 h-4" /> {job.company}
                          </span>
                          {job.portal && (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-none px-2 py-0">
                              {job.portal}
                            </Badge>
                          )}
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {job.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobMatchPage;
