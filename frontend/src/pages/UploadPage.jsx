import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, X, Sparkles, File, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toaster";
import { useResume } from "@/contexts/ResumeContext";
import { uploadResume, analyzeResume } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stage, setStage] = useState("idle"); // idle | uploading | analyzing | done | error
  const [aiMsg, setAiMsg] = useState("");
  const { setResumeData, setAtsScore, setSkills, setSuggestions, setIsAnalyzing } = useResume();
  const { user } = useAuth();
  const navigate = useNavigate();

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast("Only PDF or DOCX files are accepted", "error");
      return;
    }
    setFile(accepted[0]);
    setStage("idle");
    setUploadProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const aiMessages = [
    "Extracting text from resume...",
    "Identifying skills and experience...",
    "Running ATS simulation...",
    "Calculating match scores...",
    "Generating AI suggestions...",
    "Analysis complete! ✨",
  ];

  const handleUpload = async () => {
    if (!file) return toast("Please select a file first", "error");
    setStage("uploading");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const uploadRes = await uploadResume(formData, (p) => setUploadProgress(p));
      const fileUrl = uploadRes.data.url;
      toast("File uploaded!", "success");

      setStage("analyzing");
      setIsAnalyzing(true);

      let msgIdx = 0;
      setAiMsg(aiMessages[0]);
      const interval = setInterval(() => {
        msgIdx++;
        if (msgIdx < aiMessages.length) {
          setAiMsg(aiMessages[msgIdx]);
        } else {
          clearInterval(interval);
        }
      }, 900);

      const { data } = await analyzeResume({ 
        filename: file.name, 
        userId: user?.uid,
        fileUrl: fileUrl 
      });

      clearInterval(interval);
      setResumeData(data);
      setAtsScore(data.atsScore);
      setSkills(data.skills || []);
      setSuggestions(data.suggestions || []);
      setStage("done");
      setIsAnalyzing(false);
      toast("Analysis complete!", "success");

      setTimeout(() => navigate("/analyze"), 1500);
    } catch (err) {
      console.error("Analysis error:", err);
      setStage("error");
      setIsAnalyzing(false);
      
      const errMsg = err.response?.data?.error || err.message || "Unknown error";
      toast(`Analysis failed: ${errMsg}`, "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Upload Resume</h2>
        <p className="text-muted-foreground">Drop your PDF or DOCX and let AI do the magic</p>
      </motion.div>

      {/* Drop Zone */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <div
          {...getRootProps()}
          className={`relative rounded-3xl border-2 border-dashed p-8 md:p-12 text-center cursor-pointer transition-all duration-300 overflow-hidden
            ${isDragActive
              ? "border-blue-500 bg-blue-500/5 scale-[1.02]"
              : file
              ? "border-green-500 bg-green-500/5"
              : "border-border hover:border-blue-400 hover:bg-blue-500/5"
            }`}
        >
          {/* Glowing pulse ring when dragging */}
          {isDragActive && (
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-blue-500"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}

          <input {...getInputProps()} />

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-semibold text-green-600 dark:text-green-400">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setStage("idle"); }}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={isDragActive ? { scale: 1.2, y: -10 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-500/20 flex items-center justify-center"
                >
                  <Upload className={`w-10 h-10 ${isDragActive ? "text-blue-500" : "text-muted-foreground"}`} />
                </motion.div>
                <div>
                  <p className="text-lg font-semibold mb-1">
                    {isDragActive ? "Drop it here!" : "Drag & drop your resume"}
                  </p>
                  <p className="text-sm text-muted-foreground">or click to browse — PDF, DOCX up to 10MB</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Upload Progress */}
      <AnimatePresence>
        {stage === "uploading" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Uploading...</span>
                  <span className="text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {stage === "analyzing" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <motion.p
                    key={aiMsg}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400"
                  >
                    {aiMsg}
                  </motion.p>
                  <span className="ml-auto flex gap-1">
                    {[0, 0.2, 0.4].map((d) => (
                      <motion.span
                        key={d}
                        className="w-2 h-2 rounded-full bg-blue-500"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d }}
                      />
                    ))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {stage === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-5 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <p className="font-medium text-green-600 dark:text-green-400">
                  Analysis complete! Redirecting to results...
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      {file && stage === "idle" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button className="w-full" size="lg" onClick={handleUpload}>
            <Sparkles className="w-5 h-5" />
            Analyze with AI
          </Button>
        </motion.div>
      )}

      {/* Supported formats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-6 text-xs text-muted-foreground"
      >
        {["PDF", "DOCX"].map((fmt) => (
          <div key={fmt} className="flex items-center gap-1.5">
            <File className="w-3 h-3" />
            <span>{fmt} supported</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3" />
          <span>Max 10MB</span>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadPage;
