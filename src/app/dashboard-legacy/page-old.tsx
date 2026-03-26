"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert, FileText, Plus, Download, Eye, LogOut,
  CheckCircle2, Clock, User, Mail, ArrowRight, Stamp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MockUser {
  name: string;
  email: string;
}

interface DocumentRecord {
  id: string;
  type: string;
  typeKey: string;
  parties: string;
  date: string;
  status: "Verified" | "Pending";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DOCUMENTS: DocumentRecord[] = [
  { id: "LEXI-2026-001A", type: "Rent Agreement", typeKey: "rent", parties: "Rajesh Kumar & Priya Sharma", date: "20 Mar 2026", status: "Verified" },
  { id: "LEXI-2026-002B", type: "NDA", typeKey: "nda", parties: "Infosys Ltd & Dev Mehta", date: "21 Mar 2026", status: "Verified" },
  { id: "LEXI-2026-003C", type: "Employment Bond", typeKey: "employment", parties: "TechCorp Pvt Ltd & Aarav Singh", date: "22 Mar 2026", status: "Pending" },
  { id: "LEXI-2026-004D", type: "Name Change Affidavit", typeKey: "affidavit", parties: "Sunil Kumar Verma", date: "22 Mar 2026", status: "Verified" },
  { id: "LEXI-2026-005E", type: "Training Indemnity Bond", typeKey: "training", parties: "GlobalTech & Meera Nair", date: "23 Mar 2026", status: "Pending" },
  { id: "LEXI-2026-006F", type: "Custom / Blank Bond", typeKey: "custom", parties: "Ananya Patel & Rohan Kapoor", date: "23 Mar 2026", status: "Verified" },
];

const TYPE_COLORS: Record<string, string> = {
  rent: "bg-blue-100 text-blue-700 border-blue-200",
  nda: "bg-purple-100 text-purple-700 border-purple-200",
  employment: "bg-amber-100 text-amber-700 border-amber-200",
  affidavit: "bg-violet-100 text-violet-700 border-violet-200",
  training: "bg-orange-100 text-orange-700 border-orange-200",
  custom: "bg-pink-100 text-pink-700 border-pink-200",
};

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: (user: MockUser) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    onLogin({ name: name.trim(), email: email.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">LexiDraft AI</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-6">Sign in to access your documents</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-slate-300 text-sm">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="name"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300 text-sm">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. priya@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 mt-2">
              Continue to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
          <p className="text-center text-slate-500 text-xs mt-4">
            No account needed — this is a demo login.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("lexi_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const handleLogin = (u: MockUser) => {
    localStorage.setItem("lexi_user", JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem("lexi_user");
    setUser(null);
  };

  const handleDownload = (doc: DocumentRecord) => {
    alert(`Downloading ${doc.type} (${doc.id}) as PDF…\n\n[Mock: In production this would generate a real PDF using a server action.]`);
  };

  if (!mounted) return null;
  if (!user) return <LoginForm onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => router.push("/")} className="flex items-center gap-2 group">
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-sm">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-slate-800 dark:text-white tracking-tight hidden sm:block">LexiDraft AI</span>
          </button>

          {/* Nav */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/generate")} className="text-xs hidden sm:flex">
              <FileText className="w-3.5 h-3.5 mr-1.5" />Generate
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/notary")} className="text-xs hidden sm:flex">
              <Stamp className="w-3.5 h-3.5 mr-1.5" />Notary
            </Button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 ml-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] text-white font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 hidden sm:block max-w-[120px] truncate">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-red-500 p-1.5">
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Documents
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Welcome back, <span className="font-semibold text-blue-600">{user.name}</span> — {MOCK_DOCUMENTS.length} documents in history
            </p>
          </div>
          <Button
            onClick={() => router.push("/generate")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Documents", value: MOCK_DOCUMENTS.length, color: "blue" },
            { label: "Verified", value: MOCK_DOCUMENTS.filter(d => d.status === "Verified").length, color: "emerald" },
            { label: "Pending Review", value: MOCK_DOCUMENTS.filter(d => d.status === "Pending").length, color: "amber" },
          ].map((s) => (
            <Card key={s.label} className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 font-medium mb-1">{s.label}</p>
                <p className={`text-2xl font-extrabold ${s.color === "blue" ? "text-blue-600" : s.color === "emerald" ? "text-emerald-600" : "text-amber-500"}`}>
                  {s.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MOCK_DOCUMENTS.map((doc) => (
            <Card
              key={doc.id}
              className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
            >
              <CardContent className="p-4 sm:p-5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide ${TYPE_COLORS[doc.typeKey]}`}>
                      {doc.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{doc.id}</span>
                  </div>
                  {doc.status === "Verified" ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 shrink-0">
                      <Clock className="w-3 h-3" />Pending
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-0.5 truncate">{doc.parties}</p>
                <p className="text-xs text-slate-400 mb-4">{doc.date}</p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/generate?type=${doc.typeKey}`)}
                    className="text-xs flex-1"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    className="text-xs flex-1"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
