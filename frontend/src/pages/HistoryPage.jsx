import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, GitCommit, FileText, Eye, Trash2, GitCompare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useResume } from "@/contexts/ResumeContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/toaster";
import { getHistory } from "@/services/api";
import { Loader2 } from "lucide-react";

const DEMO_VERSIONS = [
  {
    id: "v3",
    version: "v3.0",
    label: "Tailored for Google SWE",
    date: "2026-04-15",
    score: 88,
    changes: ["Added quantified metrics", "Removed outdated skills", "Improved summary"],
    isLatest: true,
  },
  {
    id: "v2",
    version: "v2.0",
    label: "Senior Role Optimization",
    date: "2026-04-10",
    score: 74,
    changes: ["Fixed grammar issues", "Added 2 new projects", "Updated education"],
    isLatest: false,
  },
  {
    id: "v1",
    version: "v1.0",
    label: "Initial Upload",
    date: "2026-04-05",
    score: 58,
    changes: ["Original resume"],
    isLatest: false,
  },
];

const HistoryPage = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const { data } = await getHistory(user.uid);
        setHistory(data.versions);
      } catch (err) {
        toast("Failed to load history", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const allVersions = history.length > 0 ? history : (loading ? [] : DEMO_VERSIONS);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Version History</h2>
        <p className="text-muted-foreground">Track and compare all your resume versions over time</p>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Line */}
        <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-violet-500 to-muted" />

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Loading your history...</p>
            </div>
          ) : allVersions.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No resume versions found yet.</p>
              <Button variant="link" onClick={() => window.location.href='/upload'}>Analyze your first resume</Button>
            </Card>
          ) : (
            allVersions.map((ver, i) => (
              <motion.div
                key={ver.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-16"
              >
                {/* Dot */}
                <div className={`absolute left-4 top-5 w-7 h-7 rounded-full flex items-center justify-center border-2 bg-background ${
                  ver.isLatest ? "border-blue-500" : "border-muted"
                }`}>
                  <GitCommit className={`w-3 h-3 ${ver.isLatest ? "text-blue-500" : "text-muted-foreground"}`} />
                </div>
  
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                    ver.isLatest ? "border-blue-500/30 bg-blue-500/5" : ""
                  } ${selected === ver.id ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => setSelected(selected === ver.id ? null : ver.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">{ver.version}</span>
                          {ver.isLatest && <Badge variant="default">Latest</Badge>}
                        </div>
                        <p className="font-semibold">{ver.label}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ver.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            ver.score >= 80 ? "text-green-500" : ver.score >= 65 ? "text-yellow-500" : "text-red-500"
                          }`}>{ver.score}</div>
                          <div className="text-xs text-muted-foreground">ATS</div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); toast("Opening preview...", "info"); }}
                            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!ver.isLatest && (
                            <button
                              onClick={(e) => { e.stopPropagation(); toast("Version deleted", "success"); }}
                              className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
  
                    {/* Changes */}
                    {selected === ver.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="mt-4 pt-4 border-t border-border"
                      >
                        <p className="text-xs font-medium text-muted-foreground mb-2">CHANGES IN THIS VERSION</p>
                        <ul className="space-y-1">
                          {(ver.changes || ["Analysis completed", "Keywords optimized"]).map((c) => (
                            <li key={c} className="flex items-center gap-2 text-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                        <Button className="mt-3 w-full" variant="outline" size="sm">
                          <FileText className="w-4 h-4" /> Restore this version
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
