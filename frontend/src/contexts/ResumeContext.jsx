import React, { createContext, useContext, useState } from "react";

const ResumeContext = createContext();

export const useResume = () => useContext(ResumeContext);

export const ResumeProvider = ({ children }) => {
  const [resumeData, setResumeData] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [skills, setSkills] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [jobMatch, setJobMatch] = useState(null);
  const [versions, setVersions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <ResumeContext.Provider
      value={{
        resumeData, setResumeData,
        atsScore, setAtsScore,
        skills, setSkills,
        suggestions, setSuggestions,
        jobMatch, setJobMatch,
        versions, setVersions,
        isAnalyzing, setIsAnalyzing,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};
