import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Zap, Target, Shield, TrendingUp, MessageSquare,
  Upload, BarChart3, ArrowRight, ChevronRight, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "ATS Score Engine",
    desc: "Real-time ATS simulation with detailed breakdown and color-coded feedback",
    color: "from-blue-500 to-cyan-500",
    bg: "from-blue-500/5 to-cyan-500/5",
  },
  {
    icon: Sparkles,
    title: "AI Resume Rewriter",
    desc: "One-click intelligent rewriting with before/after comparison view",
    color: "from-violet-500 to-purple-600",
    bg: "from-violet-500/5 to-purple-500/5",
  },
  {
    icon: Target,
    title: "Job Match Analysis",
    desc: "Instant match percentage with keyword gap analysis and suggestions",
    color: "from-emerald-500 to-green-600",
    bg: "from-emerald-500/5 to-green-500/5",
  },
  {
    icon: MessageSquare,
    title: "AI Resume Coach",
    desc: "24/7 AI chatbot for interview prep, career guidance and resume tips",
    color: "from-orange-500 to-rose-500",
    bg: "from-orange-500/5 to-rose-500/5",
  },
  {
    icon: TrendingUp,
    title: "Skill Gap Roadmap",
    desc: "Personalized learning paths to bridge skill gaps for your dream job",
    color: "from-pink-500 to-rose-600",
    bg: "from-pink-500/5 to-rose-500/5",
  },
  {
    icon: BarChart3,
    title: "Version Tracking",
    desc: "Timeline-style history to compare all your resume versions visually",
    color: "from-amber-500 to-yellow-500",
    bg: "from-amber-500/5 to-yellow-500/5",
  },
];

const testimonials = [
  { name: "Sarah Chen", role: "Got hired at Google", text: "ResumeAI boosted my ATS score from 52 to 91 in one session!", avatar: "S" },
  { name: "Marcus Lee", role: "Software Engineer at Meta", text: "The job matching feature is insane. Showed me exactly what was missing.", avatar: "M" },
  { name: "Priya Singh", role: "Frontend Dev at Stripe", text: "AI rewriter turned my bland bullets into achievement powerhouses.", avatar: "P" },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
            ResumeAI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
          <Button size="sm" onClick={() => navigate("/auth")}>Get Started →</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 px-8 text-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -left-40 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -right-40 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6"
          >
            <Zap className="w-3.5 h-3.5" />
            Powered by GPT-4 · Trusted by 50,000+ job seekers
          </motion.div>

          <h1 className="text-6xl lg:text-7xl font-black leading-tight mb-6">
            <span className="bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            Resume Analyzer
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your resume and get an instant ATS score, AI-powered rewrites, job match analysis,
            and a personalized skill roadmap — all in under 60 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button size="xl" onClick={() => navigate("/auth")} className="shadow-2xl shadow-blue-500/30">
                <Upload className="w-5 h-5" />
                Analyze Your Resume Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
            <Button size="xl" variant="outline" onClick={() => navigate("/auth")}>
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            {[
              { value: "50K+", label: "Resumes analyzed" },
              { value: "92%", label: "ATS pass rate" },
              { value: "3x", label: "More interviews" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div>{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-3">Everything you need to land the job</h2>
          <p className="text-muted-foreground text-lg">14 AI-powered tools in one premium platform</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`bg-gradient-to-br ${feat.bg} border border-border/50 rounded-2xl p-6 cursor-pointer group`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center shadow-lg mb-4`}>
                <feat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              <div className="flex items-center gap-1 text-xs text-blue-500 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-2">Loved by job seekers worldwide</h2>
            <div className="flex items-center justify-center gap-1 text-yellow-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              <span className="text-muted-foreground text-sm ml-2">4.9 / 5 from 2,400+ reviews</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6"
              >
                <p className="text-sm leading-relaxed mb-4 text-muted-foreground">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-violet-600/10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-2xl mx-auto"
        >
          <h2 className="text-4xl font-black mb-4">
            Ready to land your{" "}
            <span className="bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
              dream job?
            </span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Join 50,000+ professionals who've transformed their resumes with AI
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button size="xl" onClick={() => navigate("/auth")} className="shadow-2xl shadow-blue-500/30">
              <Sparkles className="w-5 h-5" />
              Start for Free — No Credit Card
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-foreground">ResumeAI</span>
        </div>
        <p>© 2026 ResumeAI · Built with ❤️ for job seekers</p>
      </footer>
    </div>
  );
};

export default LandingPage;
