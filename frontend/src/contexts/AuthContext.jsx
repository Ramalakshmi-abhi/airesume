import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/firebase/config";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const token = await u.getIdToken(true); // Force refresh
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
      setLoading(false);
    });

    // Auto-refresh token every 45 mins (Firebase tokens expire in 60 mins)
    const refreshInterval = setInterval(async () => {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken(true);
        localStorage.setItem("token", token);
        console.log("🔄 Auth token refreshed automatically");
      }
    }, 45 * 60 * 1000);

    return () => {
      unsub();
      clearInterval(refreshInterval);
    };
  }, []);

  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const signin = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signinGoogle = () =>
    signInWithPopup(auth, new GoogleAuthProvider());

  const logout = () => signOut(auth);

  const updateUser = (data) => updateProfile(auth.currentUser, data);

  return (
    <AuthContext.Provider value={{ user, loading, signup, signin, signinGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
