import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Camera, Mail, Phone, MapPin, Save, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const scoreHistory = [
  { date: "Apr 5", score: 58 },
  { date: "Apr 10", score: 74 },
  { date: "Apr 15", score: 88 },
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.displayName || "Alex Johnson",
    email: user?.email || "alex@example.com",
    phone: "+1 555-0123",
    location: "San Francisco, CA",
    title: "Senior Frontend Developer",
  });

  const handleSave = async () => {
    try {
      await updateUser({ displayName: form.name });
      toast("Profile updated!", "success");
      setEditing(false);
    } catch {
      toast("Profile saved (demo)", "success");
      setEditing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">My Profile</h2>
        <p className="text-muted-foreground">Manage your account and track your resume performance</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6 flex-wrap">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-400 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/30">
                  {form.name?.[0] || "U"}
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors shadow-md">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                {editing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Full Name", key: "name", icon: User },
                      { label: "Job Title", key: "title", icon: Award },
                      { label: "Phone", key: "phone", icon: Phone },
                      { label: "Location", key: "location", icon: MapPin },
                    ].map(({ label, key, icon: Icon }) => (
                      <div key={key} className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          value={form[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="pl-9 text-sm"
                          placeholder={label}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold">{form.name}</h3>
                    <p className="text-blue-500 font-medium">{form.title}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{form.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{form.phone}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{form.location}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="w-3 h-3" /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit Profile</Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-center sm:flex-col sm:gap-2 sm:text-right">
                {[
                  { label: "Resumes", value: 3 },
                  { label: "Best Score", value: 88 },
                  { label: "Days", value: 12 },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Score over time */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> ATS Score Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: "#6366f1", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Skills */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skill Proficiency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "React.js", level: 92, color: "blue" },
              { name: "TypeScript", level: 78, color: "blue" },
              { name: "Node.js", level: 70, color: "green" },
              { name: "Python", level: 65, color: "yellow" },
              { name: "System Design", level: 55, color: "yellow" },
            ].map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-muted-foreground">{skill.level}%</span>
                </div>
                <Progress value={skill.level} color={skill.color} />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
