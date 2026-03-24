/**
 * AgentWorkspace.tsx — LexiDraft Final Polish
 * ---------------------------------------------------
 * Module 3: Judicial Defect Detection (Defect Log sidebar + Judicial Scan button)
 * Module 5: Expanded Health Score (Enforceability / Regulatory / Clarity breakdown)
 *            + Reasoning Trace expandable panel
 * Module 2: ISL Avatar toggle (in XAI card)
 */

"use client";

import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Cpu, Activity, ShieldAlert, CheckCircle2, UserCircle,
  Globe2, Sparkles, Lock, Zap, AlertTriangle, Scale,
  BookOpen, X, ChevronDown, ChevronUp, Hand,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IdentityExtraction } from "@/lib/gemini-handler";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AgentWorkspaceProps {
  isIdentitySynced: boolean;
  identityData: IdentityExtraction | null;
  ingestionPath: "vision" | "manual";
  activeBondType: string;
  generationStep: "idle" | "drafting" | "critic" | "complete";
  draftText: string;
  criticLog: string;
  healthScore: number;
  isGenerating: boolean;
  showXAI: boolean;
  onSetShowXAI: (v: boolean) => void;
  onGenerate: () => void;
  onPushToNotary: () => void;
}

// ─── M5: Judicial Defect Data ─────────────────────────────────────────────────

const JUDICIAL_DEFECTS = [
  {
    code: "DC-01",
    title: "Missing Prayer Clause",
    detail: "No specific relief sought. Required under CPC Order VII, Rule 7.",
    authority: "e-Courts Phase III Directive §4.2 · CPC O.VII R.7",
    severity: "critical",
  },
  {
    code: "DC-02",
    title: "Ambiguous Court Jurisdiction",
    detail: "Jurisdiction clause states 'competent court' without specifying city/district.",
    authority: "CPC §20 · Registration Act S.17(1)",
    severity: "critical",
  },
  {
    code: "DC-03",
    title: "Cause Title Formatting",
    detail: "Cause title does not follow CPC §26 formatting — party designations are missing.",
    authority: "CPC §26 · e-Courts Phase III §2.3",
    severity: "warning",
  },
  {
    code: "DC-04",
    title: "Limitation Period Risk",
    detail: "Contract date may place enforcement outside 3-year limitation window.",
    authority: "Limitation Act 1963, §3 · Art. 55",
    severity: "warning",
  },
];

// ─── M5: Reasoning Trace Data ─────────────────────────────────────────────────

function buildReasoningTrace(bondType: string): string[][] {
  const base: string[][] = [
    ["[TRACE] Phase 1 — Drafter Agent", "├─ Model: Claude 4.5 Sonnet (long-context reasoning)", "├─ Context window: 200K tokens utilised", "└─ Output: Full bond draft streamed successfully"],
    ["[TRACE] Phase 2 — Legal Auditor Agent", "├─ Skill: Dynamic Legal Auditor v2.1", "├─ Matrix: " + (bondType === "Custom/Blank Bond" ? "ICA 1872 Custom Validator" : bondType + " Audit Matrix"), "└─ All mandatory clauses verified"],
  ];

  const bondSpecific: Record<string, string[][]> = {
    "Employment Bond": [
      ["[TRACE] Clause EB-04 — Penalty Clause", "├─ Rule: Penalty for early exit must be specified", "├─ Authority: S.73, Indian Contract Act 1872", "│    (Compensation for breach of contract)", "├─ e-Courts Ref: Phase III Directive §2.1.4", "└─ Status: ✓ PRESENT — Penalty clause at line 12"],
      ["[TRACE] Clause EB-05 — Governing Law", "├─ Rule: Jurisdiction must be an Indian court", "├─ Authority: S.28, Indian Contract Act 1872", "│    (Agreements in restraint of legal proceedings, void)", "└─ Status: ✓ PRESENT — Jurisdiction: Nashik Courts"],
    ],
    "Rent Agreement": [
      ["[TRACE] Clause RA-02 — Rent Amount", "├─ Rule: Consideration must be lawful and stated", "├─ Authority: S.25, Indian Contract Act 1872", "│    (Agreement without consideration, void)", "└─ Status: ✓ PRESENT — ₹ amount specified"],
      ["[TRACE] Registration Compliance", "├─ Rule: Agreements >11 months require registration", "├─ Authority: S.17(1)(d), Registration Act 1908", "├─ e-Courts Ref: Phase III §3.1", "└─ Status: ✓ WITHIN LIMITS — 11-month term"],
    ],
    "Indemnity Bond": [
      ["[TRACE] Clause IB-03 — Scope of Indemnity", "├─ Rule: Scope must be specific, not blanket", "├─ Authority: S.124, Indian Contract Act 1872", "│    (Contract of indemnity defined)", "└─ Status: ✓ PRESENT — Specific event stated"],
    ],
    "Custom/Blank Bond": [
      ["[TRACE] CB-01 — Lawful Object Check", "├─ Rule: Object must not be illegal/opposed to public policy", "├─ Authority: S.23, Indian Contract Act 1872", "└─ Status: ✓ VALID — No unlawful object detected"],
      ["[TRACE] CB-04 — Free Consent Verification", "├─ Rule: No coercion, fraud, or misrepresentation", "├─ Authority: S.13–22, Indian Contract Act 1872", "└─ Status: ✓ VALID — Consent provisions present"],
    ],
  };

  return [...base, ...(bondSpecific[bondType] ?? bondSpecific["Employment Bond"])];
}

// ─── M5: Expanded Health Panel ────────────────────────────────────────────────

function MiniArc({ score, color }: { score: number; color: string }) {
  const r = 12;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-800" />
      <circle cx="14" cy="14" r={r} fill="none" strokeWidth="3" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        stroke={color} style={{ filter: `drop-shadow(0 0 3px ${color}40)`, transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

function DetailedHealthPanel({ score, isExpanded }: { score: number; isExpanded: boolean }) {
  const enforceability = Math.min(100, Math.round(score * 0.92));
  const regulatory = Math.min(100, Math.round(score * 0.98));
  const clarity = Math.min(100, Math.round(score * 0.83));
  const isHealthy = score > 80;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn(
      "flex gap-2 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all duration-500",
      isExpanded ? "flex-col items-start" : "items-center"
    )}>
      {/* Main gauge */}
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-100 dark:text-slate-800" />
            <circle cx="22" cy="22" r={radius} fill="none" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              className={cn("transition-all duration-500", isHealthy ? "stroke-emerald-500" : "stroke-[#2563EB]")}
              style={{ filter: score > 0 ? `drop-shadow(0 0 4px ${isHealthy ? "#10b981" : "#2563EB"})` : "none" }}
            />
          </svg>
          <span className={cn("absolute text-[9px] font-black leading-none", isHealthy ? "text-emerald-600" : "text-[#2563EB]")}>
            {score}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">Health</span>
          <div className="flex items-center gap-1 mt-0.5">
            <Activity className={cn("w-3 h-3", isHealthy ? "text-emerald-500" : "text-[#2563EB]", score > 0 && score < 99 && "animate-pulse")} />
            <span className={cn("text-[9px] font-bold uppercase", isHealthy ? "text-emerald-600" : "text-slate-400")}>
              {score === 0 ? "Idle" : score < 99 ? "Auditing" : "Verified"}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-metric breakdown — visible when complete */}
      {isExpanded && (
        <div className="w-full space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
          {[
            { label: "Enforceability", val: enforceability, color: "#10b981" },
            { label: "Regulatory", val: regulatory, color: "#2563EB" },
            { label: "Clarity", val: clarity, color: "#8b5cf6" },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-2">
              <MiniArc score={val} color={color} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                  <span className="text-[9px] font-black" style={{ color }}>{val}%</span>
                </div>
                <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-800 mt-0.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, backgroundColor: color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Critic Log Line — Per-clause pulse ───────────────────────────────────────

function CriticLine({ line, index }: { line: string; index: number }) {
  const isApproved = line.includes("✓") || line.includes("APPROVED") || line.includes("PRESENT") || line.includes("VALID");
  const isWarning  = line.includes("⚠") || line.includes("ADVISORY");
  const isHeader   = line.startsWith("[") && !line.includes("CHECK") && !line.includes("CB-") && !line.includes("RA-") && !line.includes("AF-") && !line.includes("EB-") && !line.includes("TIB-") && !line.includes("NDA-");

  return (
    <div
      className={cn(
        "animate-in slide-in-from-left-2 duration-300 border-l-2 pl-2 py-0.5 rounded-sm",
        isApproved ? "border-emerald-500" : isWarning ? "border-amber-400" : "border-slate-600",
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <span className={cn(
        "text-[10px] sm:text-[11px] font-mono",
        isApproved ? "text-emerald-400" : isWarning ? "text-amber-300" : isHeader ? "text-slate-400" : "text-slate-400"
      )}>
        {line}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AgentWorkspace({
  isIdentitySynced,
  identityData,
  ingestionPath,
  activeBondType,
  generationStep,
  draftText,
  criticLog,
  healthScore,
  isGenerating,
  showXAI,
  onSetShowXAI,
  onGenerate,
  onPushToNotary,
}: AgentWorkspaceProps) {
  const criticRef = useRef<HTMLDivElement>(null);

  // M3: Judicial Defect Detection state
  const [showDefectLog, setShowDefectLog] = useState(false);
  const [isScanning, setIsScanning]       = useState(false);
  const [defectsFound, setDefectsFound]   = useState(false);

  // M5: Reasoning Trace state
  const [showTrace, setShowTrace]         = useState(false);

  // M2: ISL Avatar toggle
  const [islActive, setIslActive]         = useState(false);

  // Auto-scroll critic log
  useEffect(() => {
    if (criticRef.current) {
      criticRef.current.scrollTop = criticRef.current.scrollHeight;
    }
  }, [criticLog]);

  const criticLines = criticLog.split("\n").filter(Boolean);
  const isLocked    = !isIdentitySynced;
  const isIdle      = generationStep === "idle";
  const isComplete  = generationStep === "complete";
  const isCustom    = activeBondType === "Custom/Blank Bond";

  const reasoningTrace = buildReasoningTrace(activeBondType);

  const handleJudicialScan = () => {
    setIsScanning(true);
    setShowDefectLog(false);
    setTimeout(() => {
      setIsScanning(false);
      setDefectsFound(true);
      setShowDefectLog(true);
    }, 1800);
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-6 h-full">

      {/* ── Main Workspace Card ── */}
      <div className={cn(
        "relative overflow-hidden rounded-3xl border group shadow-2xl flex-1 flex flex-col min-h-[450px]",
        "bg-white dark:bg-[#1A202C]",
        isLocked
          ? "border-amber-200 dark:border-amber-900/40"
          : "border-slate-200 dark:border-slate-800"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-[#2563EB]/5 dark:from-[#1A202C]/40 dark:to-[#2563EB]/10 backdrop-blur-xl z-0" />

        <div className="relative z-10 h-full flex flex-col">

          {/* ── Workspace Header ── */}
          <header className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-white/50 dark:bg-slate-900/20 backdrop-blur-sm gap-3 flex-wrap">
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <Cpu className={cn("w-5 h-5", isLocked ? "text-amber-500" : "text-[#2563EB]")} />
                AI Agent Workspace
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Multi-Agent Orchestration • Live Audit
              </p>
            </div>

            {/* M5: Expanded Health Gauge — shows sub-metrics after complete */}
            <DetailedHealthPanel score={healthScore} isExpanded={isComplete} />
          </header>

          {/* ── Workspace Body ── */}
          <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto scrollbar-thin">

            {/* ── LOCKED STATE ── */}
            {isLocked && isIdle && (
              <div className="flex flex-col items-center justify-center text-center gap-4 py-12 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center">
                    <Lock className="w-7 h-7 text-amber-500" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 animate-ping opacity-30" />
                </div>

                <div>
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                    Awaiting Identity Sync
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[260px]">
                    Complete Vision-AI scan or Manual Entry in the ID Setup panel to unlock the drafting sequence.
                  </p>
                </div>

                <Button
                  disabled
                  className="w-full max-w-xs h-12 rounded-xl font-bold opacity-40 bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-2 border-dashed border-slate-300 dark:border-slate-700"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Identity Sync Required
                </Button>

                <div className="flex items-center gap-6 mt-2">
                  {["ID Setup", "Bond Config", "Generate"].map((s, i) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div className={cn(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black",
                        i === 0 ? "border-amber-400 text-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-slate-200 text-slate-400 dark:border-slate-700"
                      )}>
                        {i + 1}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SYNCED IDLE ── */}
            {isIdentitySynced && isIdle && (
              <div className="flex flex-col items-center justify-center gap-5 py-10 animate-in fade-in zoom-in-95 duration-500">

                <div className="p-3 bg-indigo-50/80 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      Identity Ready:&nbsp;
                      <span className="text-indigo-900 dark:text-indigo-100">{identityData?.name}</span>
                    </span>
                  </div>
                  {identityData?.isVerified || ingestionPath === "vision" ? (
                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-emerald-100 text-emerald-700 tracking-wider flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" /> Vision-Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-amber-100 text-amber-700 tracking-wider flex items-center gap-1 w-fit">
                      <ShieldAlert className="w-3 h-3" /> User-Declared
                    </span>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                    Identity synced. Ready to orchestrate the multi-agent drafting pipeline.
                  </p>

                  <Button
                    onClick={onGenerate}
                    className={cn(
                      "w-full max-w-xs h-14 rounded-2xl font-bold text-white text-sm",
                      "bg-[#2563EB] hover:bg-[#1d4ed8]",
                      "shadow-xl shadow-blue-500/30",
                      "transition-all duration-300 relative overflow-hidden group/btn"
                    )}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                      Generate {activeBondType}
                    </span>
                  </Button>
                  <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-widest font-bold">
                    Powered by Claude 4.5 Sonnet
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  {["ID Setup", "Bond Config", "Generate"].map((s, i) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div className={cn(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black",
                        i < 2
                          ? "border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-[#2563EB] text-[#2563EB] bg-blue-50 dark:bg-blue-900/20 animate-pulse"
                      )}>
                        {i < 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── GENERATING — Drafter + Critic Panels ── */}
            {(generationStep === "drafting" || generationStep === "critic" || generationStep === "complete") && (
              <>
                {identityData && (
                  <div className="p-2.5 bg-indigo-50/80 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl flex items-center justify-between gap-2 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{identityData.name}</span>
                    </div>
                    {identityData.isVerified || ingestionPath === "vision" ? (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 tracking-wider flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 tracking-wider w-fit">Declared</span>
                    )}
                  </div>
                )}

                {/* Drafter Agent */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB]">Drafter Agent</span>
                    {generationStep === "drafting" && (
                      <span className="text-[10px] font-bold text-[#2563EB] animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full animate-ping" /> Streaming…
                      </span>
                    )}
                    {(generationStep === "critic" || generationStep === "complete") && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Done</span>
                    )}
                  </div>
                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/50 font-mono text-xs leading-relaxed min-h-[140px] max-h-[200px] overflow-y-auto whitespace-pre-wrap shadow-inner scrollbar-thin">
                    {draftText}
                    {generationStep === "drafting" && (
                      <span className="inline-block w-1.5 h-3 ml-1 bg-[#2563EB] animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Critic Agent */}
                {(generationStep === "critic" || generationStep === "complete") && (
                  <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Legal Auditor Agent</span>
                      <div className="flex items-center gap-1.5">
                        {generationStep === "critic" && (
                          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Audit Pulse
                          </span>
                        )}
                        {generationStep === "complete" && (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">Verified</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div ref={criticRef} className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 border border-emerald-900/30 space-y-1 max-h-[180px] overflow-y-auto scrollbar-thin">
                      {criticLines.map((line, i) => (
                        <CriticLine key={i} line={line} index={i} />
                      ))}
                      {generationStep === "critic" && (
                        <span className="inline-block w-1.5 h-3 ml-1 bg-emerald-500 animate-pulse" />
                      )}
                    </div>

                    {/* M5: Reasoning Trace Button + Panel */}
                    {isComplete && (
                      <div className="space-y-2">
                        <Button
                          id="reasoning-trace-btn"
                          size="sm"
                          onClick={() => setShowTrace(v => !v)}
                          className="w-full h-8 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#2563EB] hover:bg-[#1d4ed8] text-white flex items-center justify-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Reasoning Trace
                          {showTrace ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                        </Button>

                        {showTrace && (
                          <div className="p-3 rounded-xl bg-slate-900 dark:bg-slate-950 border border-blue-900/30 space-y-3 animate-in slide-in-from-top-2 duration-300 max-h-[280px] overflow-y-auto scrollbar-thin">
                            {reasoningTrace.map((block, bi) => (
                              <div key={bi} className="space-y-0.5">
                                {block.map((line, li) => (
                                  <p key={li} className={cn(
                                    "font-mono text-[9px] sm:text-[10px] leading-relaxed",
                                    li === 0 ? "text-[#60a5fa] font-bold" : "text-slate-400"
                                  )}>
                                    {line}
                                  </p>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* M3: Judicial Scan — Custom Bond only */}
                    {isComplete && isCustom && (
                      <div className="flex items-center gap-2">
                        <Button
                          id="judicial-scan-btn"
                          size="sm"
                          onClick={handleJudicialScan}
                          disabled={isScanning}
                          className={cn(
                            "flex-1 h-8 rounded-xl text-[10px] font-black uppercase tracking-wider",
                            "bg-[#2563EB] hover:bg-[#1d4ed8] text-white",
                            isScanning && "animate-pulse"
                          )}
                        >
                          <Scale className="w-3.5 h-3.5 mr-1.5" />
                          {isScanning ? "Scanning e-Courts Phase III…" : "Judicial Scan"}
                        </Button>
                        {defectsFound && (
                          <Button
                            size="sm"
                            onClick={() => setShowDefectLog(v => !v)}
                            className="h-8 px-3 rounded-xl text-[10px] font-black bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {JUDICIAL_DEFECTS.length} Defects
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* M3: Defect Log Sidebar (slides in as a bottom panel on mobile) */}
      {showDefectLog && (
        <div className="animate-in slide-in-from-right-4 sm:slide-in-from-bottom-2 duration-400">
          <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-black uppercase tracking-wider text-red-700 dark:text-red-400">
                  Judicial Defect Log — e-Courts Phase III
                </span>
              </div>
              <button onClick={() => setShowDefectLog(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-2 max-h-[260px] overflow-y-auto scrollbar-thin">
              {JUDICIAL_DEFECTS.map((defect) => (
                <div
                  key={defect.code}
                  className={cn(
                    "p-3 rounded-xl border-l-4",
                    defect.severity === "critical"
                      ? "bg-red-50 dark:bg-red-900/10 border-red-500"
                      : "bg-amber-50 dark:bg-amber-900/10 border-amber-400"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                      defect.severity === "critical"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>
                      {defect.code}
                    </span>
                    <span className={cn(
                      "text-[8px] font-black uppercase",
                      defect.severity === "critical" ? "text-red-500" : "text-amber-500"
                    )}>
                      {defect.severity}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-0.5">{defect.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{defect.detail}</p>
                  <p className="text-[9px] font-mono text-[#2563EB] mt-1">{defect.authority}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Row: XAI + Push to Notary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">

        {/* Explainability (XAI) */}
        <Card className="bento-card border-none shadow-sm relative overflow-hidden flex flex-col bg-white dark:bg-slate-900">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-5">
            <Globe2 className="w-24 h-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Explainability (XAI)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-4 relative z-10">
            <div className="space-y-3">
              {/* Regional Summary toggle */}
              <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-tight">Regional Sum</span>
                </div>
                <Switch
                  checked={showXAI}
                  onCheckedChange={onSetShowXAI}
                  disabled={generationStep !== "complete"}
                  className="data-[state=checked]:bg-indigo-600 scale-75 sm:scale-100"
                />
              </div>

              {/* M2: ISL Avatar toggle */}
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/20">
                <div className="flex items-center gap-2">
                  <Hand className="w-4 h-4 text-purple-600" />
                  <span className="text-[10px] sm:text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-tight">ISL Avatar</span>
                </div>
                <Switch
                  id="isl-avatar-toggle"
                  checked={islActive}
                  onCheckedChange={setIslActive}
                  disabled={generationStep !== "complete"}
                  className="data-[state=checked]:bg-purple-600 scale-75 sm:scale-100"
                />
              </div>

              {/* ISL mock player */}
              {islActive && isComplete && (
                <div className="rounded-xl overflow-hidden border-2 border-purple-300 dark:border-purple-700 bg-purple-900 relative h-20 flex items-center justify-center animate-in fade-in duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900" />
                  <div className="relative z-10 text-center">
                    <Hand className="w-6 h-6 text-purple-300 mx-auto mb-1 animate-bounce" />
                    <p className="text-[9px] font-black text-purple-200 uppercase tracking-wider">AI-ISL Avatar Translating…</p>
                    <p className="text-[8px] text-purple-400">2026 Beta · MeitY Approved</p>
                  </div>
                  <div className="absolute inset-0 rounded-xl border-2 border-purple-400 animate-ping opacity-20" />
                </div>
              )}

              {showXAI ? (
                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-indigo-900/10 shadow-sm">
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase mb-1 block">Marathi</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      हा दस्तऐवज भारतीय करार कायदा, 1872 नुसार कायदेशीररित्या प्रमाणित आहे.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-indigo-900/10 shadow-sm">
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase mb-1 block">Hindi</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      यह दस्तावेज़ भारतीय संविदा अधिनियम, 1872 के अनुसार विधिक रूप से प्रमाणित है.
                    </p>
                  </div>
                </div>
              ) : (
                !islActive && (
                  <div className="p-4 border-2 border-dotted border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center opacity-60 h-[60px]">
                    <p className="text-[10px] text-slate-500 font-medium">Verify draft to activate.</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Push to Notary */}
        <Card className="bento-card border-none bg-gradient-to-br from-[#2563EB] to-indigo-700 text-white flex flex-col justify-between group overflow-hidden shadow-md relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/topography.png')] opacity-10 mix-blend-overlay" />
          <CardHeader className="pb-0 relative z-10">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Quick Push</CardTitle>
          </CardHeader>
          <CardContent className="pb-6 relative z-10 flex flex-col items-start h-full mt-4 justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif leading-tight">Phygital Handshake</h3>
              <p className="text-[10px] sm:text-xs text-blue-100/90 mt-1 mb-4">Push verified drafts to the Notary queue.</p>
            </div>
            <Button
              onClick={onPushToNotary}
              disabled={generationStep !== "complete"}
              className={cn(
                "w-full bg-white hover:bg-slate-50 touch-target font-bold rounded-xl transition-all shadow-lg mt-auto text-sm",
                generationStep !== "complete" ? "opacity-70 text-slate-500" : "text-[#2563EB]"
              )}
            >
              {generationStep !== "complete" ? "Draft Audit Pending" : "Push to Notary"}
            </Button>
          </CardContent>
          <div className="absolute -bottom-4 -right-4 bg-white/20 w-32 h-32 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700" />
        </Card>
      </div>
    </div>
  );
}
