import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Star, Clock, ListChecks, MessageCircle, ArrowLeft, Trophy, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getInterviewPrep } from "@/services/api";
import { useResume } from "@/contexts/ResumeContext";
import { useEffect } from "react";

const InterviewPrepPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState(0);
  const [improvements, setImprovements] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const { resumeData } = useResume();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await getInterviewPrep({ resume: resumeData });
        setQuestions(data.questions);
        setReadiness(data.readinessScore);
        setImprovements(data.improvements);
      } catch (err) {
        console.error("Failed to fetch interview questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [resumeData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Generating custom interview questions...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Brain className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold">No questions prepared yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Upload your resume or wait while we analyze your profile to generate custom interview questions.
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <h2 className="text-2xl font-bold">Interview Readiness</h2>
          <p className="text-muted-foreground">Practice AI-suggested questions based on your profile</p>
        </div>
        <div className="flex items-center gap-2 sm:text-right">
          <span className="text-2xl font-black text-blue-500">{readiness}%</span>
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="text-xs text-muted-foreground">Readiness</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Left Column - Score Breakdown */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Readiness Meter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center py-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/30" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - readiness/100)}
                      className="text-blue-500" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-2xl font-bold">{readiness}%</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Tech Knowledge", val: Math.min(100, readiness + 10) },
                  { label: "Behavioral", val: Math.min(100, readiness - 10) },
                  { label: "Experience Polish", val: readiness }
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{item.label}</span>
                      <span>{item.val}%</span>
                    </div>
                    <Progress value={item.val} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-500/5 border-orange-500/20">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm flex items-center gap-2 text-orange-600">
                <AlertCircle className="w-4 h-4" /> Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-orange-600 space-y-2">
              {improvements.map((imp, idx) => (
                <p key={idx}>• {imp}</p>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Question Carousel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="h-full border-2 border-blue-500/10 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{questions[currentIdx].category}</Badge>
                    <Badge variant={questions[currentIdx].difficulty === 'Hard' ? 'danger' : 'success'}>
                      {questions[currentIdx].difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="leading-relaxed">
                    {questions[currentIdx].q}
                  </CardTitle>
                  <CardDescription>
                    Question {currentIdx + 1} of {questions.length}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border min-h-[120px] flex items-center justify-center text-center">
                    <p className="text-muted-foreground italic text-sm italic">
                      "Speak clearly, structure your answer using the STAR method..."
                    </p>
                  </div>

                  {showTip && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                      <p className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-tight">AI Hint:</p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">{questions[currentIdx].tips}</p>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setShowTip(!showTip)}>
                      {showTip ? "Hide Hint" : "Show Hint"}
                    </Button>
                    <Button className="flex-1" onClick={() => {
                        setCurrentIdx((currentIdx + 1) % questions.length);
                        setShowTip(false);
                      }}>
                      Next Question <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrepPage;
