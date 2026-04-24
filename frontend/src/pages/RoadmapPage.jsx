import React from "react";
import { motion } from "framer-motion";
import { Map, CheckCircle, Circle, ArrowRight, BookOpen, ExternalLink, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getRoadmap } from "@/services/api";
import { useResume } from "@/contexts/ResumeContext";
import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

const RoadmapPage = () => {
  const [roadmap, setRoadmap] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const { resumeData } = useResume();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const { data } = await getRoadmap({ resume: resumeData });
        setRoadmap(data.roadmap);
        if (data.missingSkills) {
          setMissingSkills(data.missingSkills);
        }
      } catch (err) {
        console.error("Failed to fetch roadmap:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [resumeData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Designing your growth path...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Skill Gap Roadmap</h2>
        <p className="text-muted-foreground">Your personalized path to mastering missing skills for your dream role</p>
      </motion.div>

      {/* Skill Gap Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> My Current Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(resumeData?.skills || ["JavaScript", "React", "Node.js"]).map(s => (
                <Badge key={s} variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" /> Skills to Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(missingSkills.length > 0 ? missingSkills : (resumeData?.missingSkills || ["Data Analytics", "Cloud Computing"])).map(s => (
                <Badge key={s} variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-violet-500 to-transparent" />
        
        <div className="space-y-8">
          {roadmap.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-20"
            >
              <div className={`absolute left-4 top-1 w-9 h-9 rounded-full flex items-center justify-center z-10 
                ${item.status === 'completed' ? 'bg-green-500 shadow-lg shadow-green-500/20' : 
                  item.status === 'in-progress' ? 'bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-muted border border-border'}`}
              >
                {item.status === 'completed' ? <CheckCircle className="w-5 h-5 text-white" /> : 
                 item.status === 'in-progress' ? <Zap className="w-4 h-4 text-white animate-pulse" /> : 
                 <Circle className="w-4 h-4 text-muted-foreground" />}
              </div>

              <Card className={`transition-all duration-300 hover:shadow-xl ${item.status === 'in-progress' ? 'border-blue-500/50 bg-blue-500/[0.02]' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={item.status === 'completed' ? 'success' : item.status === 'in-progress' ? 'default' : 'secondary'}>
                      {item.stage}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Step {i + 1}</span>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  
                  {item.status === 'in-progress' && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Current Progress</span>
                        <span className="text-blue-500">{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {item.resources.map((res, j) => (
                      <button 
                        key={j} 
                        className="flex items-center gap-1.5 text-xs bg-muted hover:bg-muted/80 px-2.5 py-1.5 rounded-lg border border-border transition-colors group"
                      >
                        <BookOpen className="w-3 h-3 text-muted-foreground" />
                        {res}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 text-white text-center shadow-xl shadow-blue-500/20"
      >
        <h3 className="text-xl font-bold mb-2">Ready to take the next step?</h3>
        <p className="text-blue-100 mb-6 text-sm">Our AI coach can generate interview questions for any of these skills.</p>
        <Button variant="glass" className="w-full sm:w-auto px-10" onClick={() => navigate("/interview-prep")}>
          Open Interview Prep <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};

export default RoadmapPage;
