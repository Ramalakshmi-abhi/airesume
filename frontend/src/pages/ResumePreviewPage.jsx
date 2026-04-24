import React, { useState } from "react";
import { motion } from "framer-motion";
import { useResume } from "@/contexts/ResumeContext";
import { Download, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";

const ResumePreviewPage = () => {
  const { resumeData } = useResume();
  const [template, setTemplate] = useState("creative"); // 'creative', 'minimalist', 'classic'

  // Print utility
  const handlePrint = () => {
    window.print();
  };

  if (!resumeData) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Please upload a resume first to view the preview.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 md:h-[80vh]">
      {/* Sidebar Controls (Hidden on Print) */}
      <div className="w-full md:w-80 flex flex-col gap-4 bg-card rounded-2xl p-4 md:p-6 border shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            <Layout className="w-5 h-5 text-blue-500" /> Web PDF Builder
          </h2>
          <p className="text-sm text-muted-foreground">High-fidelity formats</p>
        </div>

        <div className="space-y-4 flex-1">
          <label className="text-sm font-bold block">Select Visual Template</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "creative", name: "Creative Sidebar", desc: "Two-column vibrant layout" },
              { id: "minimalist", name: "Minimalist Dark", desc: "Sleek and modern dark theme" },
              { id: "classic", name: "Professional Standard", desc: "Clean, classic typography" }
            ].map(t => (
              <div 
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${template === t.id ? 'border-blue-500 bg-blue-500/5' : 'border-transparent bg-muted hover:bg-muted/80'}`}
              >
                <div className="font-bold text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handlePrint} className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
          <Download className="w-5 h-5 mr-2" /> Save PDF (A4)
        </Button>
      </div>

      {/* Live Preview Area */}
      <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-900 rounded-2xl border p-4 md:p-8 print:p-0 print:bg-white print:border-none print:rounded-none min-h-[60vh] md:min-h-0">
        
        {/* Render Selected Template */}
        {template === "creative" && (
          <div className="mx-auto bg-white text-slate-800 shadow-2xl w-[210mm] min-h-[297mm] flex print:shadow-none print:w-full">
            {/* Left Sidebar */}
            <div className="w-[35%] bg-blue-900 text-white p-8">
              <h1 className="text-3xl font-black mb-2 leading-tight">{resumeData.name}</h1>
              <div className="text-blue-200 text-sm mb-6 flex flex-col gap-1">
                <span>{resumeData.email}</span>
                <span>{resumeData.phone}</span>
              </div>
              
              <h2 className="text-lg font-bold border-b border-white/20 pb-2 mb-4 uppercase tracking-widest text-blue-300">Skills</h2>
              <div className="flex flex-wrap gap-2 mb-8">
                {(resumeData.skills || []).map((skill, i) => (
                  <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded">{skill}</span>
                ))}
              </div>

              <h2 className="text-lg font-bold border-b border-white/20 pb-2 mb-4 uppercase tracking-widest text-blue-300">Attributes</h2>
              <div className="flex flex-wrap gap-2">
                {(resumeData.softSkills || []).map((skill, i) => (
                  <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded">{skill}</span>
                ))}
              </div>
            </div>
            
            {/* Right Content */}
            <div className="w-[65%] p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold border-b-2 border-blue-900 pb-1 mb-3 text-blue-900 uppercase">Profile</h2>
                <p className="text-sm leading-relaxed text-slate-600">{resumeData.summary}</p>
              </div>

              {resumeData.experience?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold border-b-2 border-blue-900 pb-1 mb-3 text-blue-900 uppercase">Experience</h2>
                  <div className="space-y-4">
                    {resumeData.experience.map((exp, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-slate-800">{exp.title}</h3>
                          <span className="text-xs font-bold text-blue-600">{exp.duration}</span>
                        </div>
                        <div className="text-sm text-slate-500 font-medium mb-2">{exp.company}</div>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-slate-600">
                          {(exp.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resumeData.education?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold border-b-2 border-blue-900 pb-1 mb-3 text-blue-900 uppercase">Education</h2>
                  <div className="space-y-3">
                    {resumeData.education.map((edu, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold text-slate-800">{edu.degree}</h3>
                          <span className="text-xs text-slate-500">{edu.duration}</span>
                        </div>
                        <div className="text-sm text-slate-600">{edu.institution}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {template === "minimalist" && (
          <div className="mx-auto bg-[#121212] text-slate-300 shadow-2xl w-[210mm] min-h-[297mm] p-10 print:shadow-none print:w-full font-mono">
            <h1 className="text-4xl font-light text-white mb-2">{resumeData.name?.toUpperCase()}</h1>
            <div className="flex gap-4 text-xs text-slate-500 mb-8 border-b border-slate-800 pb-4">
              <span>{resumeData.email}</span> • <span>{resumeData.phone}</span>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-sm font-bold text-blue-400 tracking-widest uppercase mb-4">Summary</h2>
                <p className="text-sm leading-relaxed">{resumeData.summary}</p>
              </div>

              {resumeData.experience?.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-blue-400 tracking-widest uppercase mb-4">Experience</h2>
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-white text-sm">
                          <strong>{exp.title} — {exp.company}</strong>
                          <span className="text-slate-500">{exp.duration}</span>
                        </div>
                        <ul className="mt-3 list-none space-y-2 text-sm">
                          {(exp.bullets || []).map((b, j) => (
                            <li key={j} className="flex gap-3">
                              <span className="text-blue-500">→</span> <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-sm font-bold text-blue-400 tracking-widest uppercase mb-4">Skills</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm selection:bg-blue-500/30">
                  {(resumeData.skills || []).map((skill, i) => <span key={i}>{skill}</span>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {template === "classic" && (
          <div className="mx-auto bg-white text-black shadow-2xl w-[210mm] min-h-[297mm] p-12 print:shadow-none print:w-full font-serif">
            <div className="text-center mb-8 border-b-2 border-black pb-4">
              <h1 className="text-3xl font-bold mb-2">{resumeData.name}</h1>
              <div className="text-sm text-gray-700">
                {resumeData.email} | {resumeData.phone}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider mb-2">Professional Summary</h2>
                <p className="text-sm leading-relaxed text-gray-800">{resumeData.summary}</p>
              </div>

              {resumeData.experience?.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wider mb-2 border-b border-gray-300">Experience</h2>
                  <div className="space-y-4 pt-2">
                    {resumeData.experience.map((exp, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold">{exp.title}</h3>
                          <span className="text-sm text-gray-600 font-bold">{exp.duration}</span>
                        </div>
                        <div className="text-sm italic text-gray-800 mb-2">{exp.company}</div>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                          {(exp.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resumeData.education?.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wider mb-2 border-b border-gray-300">Education</h2>
                  <div className="space-y-3 pt-2">
                    {resumeData.education.map((edu, i) => (
                      <div key={i} className="flex justify-between">
                        <div>
                          <div className="font-bold text-sm">{edu.degree}</div>
                          <div className="text-sm text-gray-700">{edu.institution}</div>
                        </div>
                        <div className="text-sm font-bold text-gray-600">{edu.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #root > div:nth-child(2) > main { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default ResumePreviewPage;
