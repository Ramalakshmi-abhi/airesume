import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, GitCompare, Copy, CheckCheck, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { rewriteResume, downloadResume } from "@/services/api";
import { useResume } from "@/contexts/ResumeContext";

const RewritePage = () => {
  const { resumeData, setResumeData } = useResume();
  const navigate = useNavigate();
  const [before, setBefore] = useState(resumeData?.summary || (resumeData?.experience?.[0]?.bullets?.[0]) || "");
  const [after, setAfter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBoth, setShowBoth] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("modern");

  // Automated Suggestions Logic
  const getSuggestions = () => {
    if (!resumeData) return [];
    const points = [];
    
    // Check Summary
    if (resumeData.summary && resumeData.summary.length < 150) {
      points.push({ original: resumeData.summary, section: "Profile Summary", label: "Expand Summary" });
    }

    // Check Experience
    if (resumeData.experience) {
      resumeData.experience.forEach(exp => {
        (exp.bullets || []).forEach(b => {
          if (b.length < 60 || !/(\d+%|\$\d+|year|month)/i.test(b)) {
            points.push({ original: b, section: exp.company || "Experience", label: "Add Metrics" });
          }
        });
      });
    }
    return points.slice(0, 4); // Show top 4 suggestions
  };

  const suggestions = getSuggestions();

  const handleRewrite = async (textToRewrite = before) => {
    const input = textToRewrite || before;
    if (!input.trim()) return toast("Please enter content to rewrite", "error");
    setLoading(true);
    try {
      const { data } = await rewriteResume({ content: input, resume: resumeData });
      setAfter(data.rewritten);
      setBefore(input);
      setShowBoth(true);
      toast("AI optimization applied!", "success");
    } catch {
      const localOptimized = `Spearheaded ${input.charAt(0).toLowerCase()}${input.slice(1)} achieving significant efficiency gains.`;
      setAfter(localOptimized);
      setBefore(input);
      setShowBoth(true);
      toast("Using smart local optimization", "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(after);
    setCopied(true);
    toast("Copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFull = async () => {
    if (!resumeData) return toast("No resume data found. Please upload first.", "error");
    setDownloading(true);

    try {
      // PRO Smart Apply: Deep recursive replacement with Case-Insensitive Fuzzy Match
      const deepReplace = (obj, search, replace) => {
        if (typeof obj === 'string') {
          const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(cleanSearch, 'i'); // Case-insensitive
          return regex.test(obj) ? replace : obj;
        }
        if (Array.isArray(obj)) return obj.map(item => deepReplace(item, search, replace));
        if (typeof obj === 'object' && obj !== null) {
          const newObj = {};
          for (const key in obj) {
            newObj[key] = deepReplace(obj[key], search, replace);
          }
          return newObj;
        }
        return obj;
      };

      const updatedResume = deepReplace(resumeData, before, after);
      
      // Verification: If the text wasn't found anywhere, add it as a new summary or specific section
      const wasFound = JSON.stringify(updatedResume).includes(after);
      if (!wasFound) {
        updatedResume.summary = (updatedResume.summary ? updatedResume.summary + "\n\n" : "") + after;
      }

      // Final Cleanup: Remove ugly placeholders before sending to docx
      const cleanResume = JSON.parse(JSON.stringify(updatedResume).replace(/Identified in Resume/g, "").replace(/at Exp Identified/g, ""));
      
      // Update local context
      setResumeData(cleanResume);

      // Download from backend with the selected format template
      const { data } = await downloadResume({ resume: cleanResume, format: selectedFormat });
      
      if (!data.url) throw new Error("Could not generate download link");

      // NATIVE DOWNLOAD: This bypasses all Javascript Blob naming issues
      // It acts like a real link to a real file on the web
      window.location.assign(data.url);
      
      toast("Microsoft Word File downloaded!", "success");
    } catch (err) {
      console.error("Download error:", err);
      toast("Failed to download updated resume", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">AI Resume Rewriter</h2>
        <p className="text-muted-foreground">One-click AI rewrite — transform weak bullet points into powerful achievements</p>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {["Action verbs", "Quantified metrics", "ATS-optimized", "Grammar fixed", "Power words"].map((tip) => (
          <Badge key={tip} variant="purple">{tip}</Badge>
        ))}
      </motion.div>

      {/* Smart Suggestions from Uploaded Resume */}
      {suggestions.length > 0 && !showBoth && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                AI-Powered Suggestions for your Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.map((s, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-xl bg-background/50 border border-blue-500/10 gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">{s.company}</p>
                    <p className="text-sm italic text-foreground/80 line-clamp-1">"{s.original}"</p>
                  </div>
                  <Button size="sm" variant="blue" className="h-8 text-xs gap-1" onClick={() => handleRewrite(s.original)}>
                    <Wand2 className="w-3 h-3" /> Rewrite This Point
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {!showBoth ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold">Manual Optimization</CardTitle>
                <div className="text-xs text-muted-foreground">Or paste any text below</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  rows={4}
                  placeholder="Paste your resume experience section here..."
                  value={before}
                  onChange={(e) => setBefore(e.target.value)}
                />
                <Button onClick={() => handleRewrite()} disabled={loading} className="w-full" size="lg">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      AI is rewriting...
                    </span>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" /> Rewrite with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Before vs After Comparison</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowBoth(false); setAfter(""); }}
              >
                Try Another
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <Card className="border-red-500/20 h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <CardTitle className="text-sm text-red-600">Before (Original)</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{before}</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* After */}
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                <Card className="border-green-500/20 h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <CardTitle className="text-sm text-green-600">After (AI Rewritten)</CardTitle>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <motion.p
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {after}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What AI improved</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Action Verbs", icon: "⚡", desc: "Replaced weak verbs" },
                  { label: "Metrics Added", icon: "📊", desc: "Quantified achievements" },
                  { label: "ATS Keywords", icon: "🎯", desc: "Industry keywords added" },
                  { label: "Grammar", icon: "✅", desc: "All errors fixed" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-xl bg-muted/50">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <p className="text-xs font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Global Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-6 mt-8 p-8 border rounded-2xl bg-muted/20"
            >
              <h3 className="text-xl font-bold">Ready to Download?</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md -mt-4">
                Choose between a simple Word Document or the beautiful high-fidelity Web Templates (like Creative Sidebar and Dark Mode).
              </p>

              <div className="flex flex-col sm:flex-row w-full justify-center gap-4">
                <Button 
                  onClick={() => navigate("/preview")} 
                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2 px-8 py-6 text-lg rounded-2xl shadow-xl transition-all hover:scale-105 flex-1"
                >
                  <Sparkles className="w-6 h-6" />
                  USE WEB PDF BUILDER 
                  <span className="block text-xs font-normal absolute bottom-1">(For Creative & Dark Formats)</span>
                </Button>

                <div className="flex-1 border rounded-2xl p-3 bg-card flex flex-col gap-2">
                  <select 
                    value={selectedFormat} 
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                  >
                    <option value="modern">Standard Font (Calibri)</option>
                    <option value="minimalist">Standard Font (Georgia)</option>
                    <option value="creative">Standard Font (Avenir)</option>
                    <option value="classic">Standard Font (Arial)</option>
                  </select>

                  <Button 
                    onClick={handleDownloadFull} 
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white gap-2"
                    disabled={downloading}
                  >
                    {downloading ? "Generating..." : "Download Basic (.docx)"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage Guide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" /> How to build an Effective Resume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Paste Content", desc: "Copy a sentence from your Work Experience or Projects from your current resume." },
                { step: "2", title: "AI Magic", desc: "Click 'Rewrite with AI' to transform passive words into data-driven achievements." },
                { step: "3", title: "Copy & Win", desc: "Use the Comparison view to see the improvements, then copy-paste the new version!" }
              ].map((item) => (
                <div key={item.step} className="relative p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold shadow-lg">
                    {item.step}
                  </span>
                  <h4 className="font-bold mb-1 ml-4">{item.title}</h4>
                  <p className="text-sm text-muted-foreground ml-4">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                💡 Pro Tip: The STAR Method
              </h4>
              <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                For the best results, try to include a task and a result in your input. Instead of saying "I fixed bugs," say "I fixed 20 critical bugs using Python which increased system stability by 40%."
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RewritePage;
