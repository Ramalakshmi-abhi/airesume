import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Sparkles, Eye, EyeOff, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { signup, signin, signinGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const cred = await signup(form.email, form.password);
        if (form.name) await cred.user.updateProfile({ displayName: form.name });
        toast("Account created! Welcome 🎉", "success");
      } else {
        await signin(form.email, form.password);
        toast("Welcome back!", "success");
      }
      navigate("/dashboard");
    } catch (err) {
      toast(err.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signinGoogle();
      toast("Signed in with Google!", "success");
      navigate("/dashboard");
    } catch (err) {
      toast(err.message || "Google sign-in failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-violet-600/5 to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
              ResumeAI
            </span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Land your{" "}
            <span className="bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
              dream job
            </span>{" "}
            faster
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            AI-powered resume analysis, ATS optimization, and smart career guidance — all in one place.
          </p>
          {[
            "Instant ATS Score with detailed breakdown",
            "AI-powered resume rewriting & improvement",
            "Job matching with keyword gap analysis",
            "Smart skill roadmap & interview prep",
          ].map((feat, i) => (
            <motion.div
              key={feat}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3 mb-3"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm text-muted-foreground">{feat}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl">
            {/* Toggle */}
            <div className="flex bg-muted rounded-2xl p-1 mb-6">
              {["Sign In", "Sign Up"].map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setIsSignup(i === 1)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isSignup === (i === 1)
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Full Name"
                    className="pl-10"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  className="pl-10"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  className="pl-10 pr-10"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : isSignup ? "Create Account →" : "Sign In →"}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleGoogle}
              disabled={loading}
            >
              <Globe className="w-4 h-4" />
              Continue with Google
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              By continuing, you agree to our{" "}
              <span className="text-blue-500 cursor-pointer hover:underline">Terms</span> &{" "}
              <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
