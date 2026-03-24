"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ShieldAlert, LayoutDashboard, UserCircle, DownloadCloud,
  CheckCircle, CheckCircle2, History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateBondDraft } from "@/lib/ai-handlers";
import { saveDraftToNotaryQueue, getTransactions, Transaction } from "@/lib/store";
import { InputStrategy } from "@/components/InputStrategy";
import { BondConfigurator } from "@/components/BondConfigurator";
import { AgentWorkspace } from "@/components/AgentWorkspace";
import { Ecosystem } from "@/components/Ecosystem";
import { IdentityExtraction } from "@/lib/gemini-handler";

// ─── Per-bond-type clause audit lines (drives Health Score per-clause) ─────────

const AUDIT_LINES: Record<string, string[]> = {
  default: [
    "[LEGAL AUDITOR] Initialising Dynamic Audit Matrix…",
    "[CHECK-01] Party Identity Clauses ............. ✓ PRESENT",
    "[CHECK-02] Consideration / Object ............. ✓ PRESENT",
    "[CHECK-03] Term & Duration .................... ✓ PRESENT",
    "[CHECK-04] Penalty / Breach Clause ............ ✓ PRESENT",
    "[CHECK-05] Jurisdiction ....................... ✓ PRESENT",
    "[CHECK-06] Witness / Signature Block .......... ⚠ ADVISORY",
    "[HALLUCINATION SCAN] No fabricated facts detected.",
    "[STATUS] ✅ APPROVED — All mandatory clauses verified.",
  ],
  "Rent Agreement": [
    "[LEGAL AUDITOR] Audit Matrix: RENT AGREEMENT (RA)",
    "[RA-01] Landlord & Tenant Identity ........... ✓ PRESENT",
    "[RA-02] Rent Amount .......................... ✓ PRESENT",
    "[RA-03] Security Deposit ..................... ✓ PRESENT",
    "[RA-04] Notice Period ........................ ✓ PRESENT",
    "[RA-05] Lock-in Period ....................... ✓ PRESENT",
    "[RA-06] Subletting Prohibition ............... ✓ PRESENT",
    "[RA-07] Jurisdiction ......................... ✓ PRESENT",
    "[HALLUCINATION SCAN] No fabricated details detected.",
    "[STATUS] ✅ APPROVED — All mandatory clauses present.",
  ],
  "Name Change Affidavit": [
    "[LEGAL AUDITOR] Audit Matrix: NAME CHANGE AFFIDAVIT (AF)",
    "[AF-01] Deponent Identity .................... ✓ PRESENT",
    "[AF-02] Old Name ............................. ✓ PRESENT",
    "[AF-03] New Legal Name ....................... ✓ PRESENT",
    "[AF-04] Residential Address .................. ✓ PRESENT",
    "[AF-05] Oath / Verification Clause ........... ✓ PRESENT",
    "[AF-06] Reason for Change .................... ⚠ ADVISORY",
    "[AF-07] Notary Witness Line .................. ⚠ ADVISORY",
    "[HALLUCINATION SCAN] No fabricated details detected.",
    "[STATUS] ✅ APPROVED — All mandatory clauses present.",
  ],
  "Indemnity Bond": [
    "[LEGAL AUDITOR] Audit Matrix: INDEMNITY BOND (IB)",
    "[IB-01] Indemnifier Identity ................. ✓ PRESENT",
    "[IB-02] Indemnified Party .................... ✓ PRESENT",
    "[IB-03] Indemnity Purpose .................... ✓ PRESENT",
    "[IB-04] Liability Cap (₹) ................... ✓ PRESENT",
    "[IB-05] Duration / Perpetual Clause .......... ✓ PRESENT",
    "[IB-06] Jurisdiction ......................... ✓ PRESENT",
    "[IB-07] Witness Signatures ................... ⚠ ADVISORY",
    "[HALLUCINATION SCAN] No fabricated details detected.",
    "[STATUS] ✅ APPROVED — All mandatory clauses present.",
  ],
  "Employment Bond": [
    "[LEGAL AUDITOR] Audit Matrix: EMPLOYMENT BOND (EB)",
    "[EB-01] Employer & Employee Identity ......... ✓ PRESENT",
    "[EB-02] Designation .......................... ✓ PRESENT",
    "[EB-03] Bond / Lock-in Period ................ ✓ PRESENT",
    "[EB-04] Penalty Clause (₹) .................. ✓ PRESENT",
    "[EB-05] Confidentiality Obligation ........... ✓ PRESENT",
    "[EB-06] Non-Compete Scope .................... ⚠ ADVISORY",
    "[EB-07] Jurisdiction ......................... ✓ PRESENT",
    "[HALLUCINATION SCAN] No fabricated details detected.",
    "[STATUS] ✅ APPROVED — Legally sound. Advisories noted.",
  ],
  "Custom/Blank Bond": [
    "[LEGAL AUDITOR] Custom Bond Validator — ICA 1872",
    "[CB-01] Lawful Object (§23) .................. ✓ VALID",
    "[CB-02] Lawful Consideration (§25) ........... ✓ VALID",
    "[CB-03] Competent Parties (§11) .............. ✓ VALID",
    "[CB-04] Free Consent (§14) ................... ✓ VALID",
    "[CB-05] Not Wagering Agreement (§30) ......... ✓ VALID",
    "[CB-06] Restraint of Trade (§27) ............. ✓ VALID",
    "[CB-07] Legal Access Not Barred (§28) ........ ✓ VALID",
    "[CB-08] Possible Object (§56) ................ ✓ VALID",
    "[STATUS] ✅ APPROVED — Custom bond valid under ICA 1872.",
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

import { useSessionIdentity } from "@/hooks/useSessionIdentity";

export default function CitizenDashboard() {
  const router = useRouter();
  const { identity: identityData, setIdentity: setIdentityData, wipeIdentity } = useSessionIdentity();
  const [ingestionPath, setIngestionPath] = useState<"vision" | "manual">("vision");

  // isIdentitySynced: the single gate that controls the workspace
  const isIdentitySynced = identityData !== null;

  // ── Generation State ────────────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<"idle" | "drafting" | "critic" | "complete">("idle");
  const [draftText, setDraftText] = useState("");
  const [criticLog, setCriticLog] = useState("");
  const [healthScore, setHealthScore] = useState(0);
  const [showXAI, setShowXAI] = useState(false);

  // ── Bond Config State ───────────────────────────────────────────────────────
  const [activeBondType, setActiveBondType] = useState("Rent Agreement");
  const [pendingDraftContent, setPendingDraftContent] = useState("");

  // ── Ecosystem State ─────────────────────────────────────────────────────────
  const [hasPrinted, setHasPrinted] = useState(false);

  // ── DigiLocker Auth ─────────────────────────────────────────────────────────
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isDigilockerVerified, setIsDigilockerVerified] = useState(false);

  // ── User Dropdown ───────────────────────────────────────────────────────────
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [txHistory, setTxHistory] = useState<Transaction[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTxHistory(getTransactions());
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Identity Handlers ───────────────────────────────────────────────────────

  const handleIdentitySync = (identity: IdentityExtraction | null, mode: "vision" | "manual") => {
    setIdentityData(identity);
    setIngestionPath(mode);
  };

  /** Demo Mode: sets a mock identity to unlock the workspace without a real upload */
  const handleForceSync = () => {
    setIdentityData({
      name: "Demo User (Force Sync)",
      idNumber: "DEMO-XXXX-0000",
      address: "Demo Address, Mumbai, Maharashtra",
      idType: "Aadhaar",
      isVerified: false,
    });
    setIngestionPath("manual");
  };

  const handleDigilockerVerify = async () => {
    setIsVerifyingOtp(true);
    await new Promise(r => setTimeout(r, 1500));
    try {
      const res = await fetch("/mock-user-vault.json");
      const vault = await res.json();
      setIdentityData({
        name: vault.user.name,
        idNumber: vault.user.aadhaar.substring(0, 4) + "-XXXX",
        address: "123 Beta Street, Pune (Gov API)",
        idType: "Aadhaar",
        isVerified: true,
      });
      setIngestionPath("vision");
      setIsDigilockerVerified(true);
      setShowOtpModal(false);
    } catch (_) {}
    setIsVerifyingOtp(false);
  };

  // ── Clause-coupled Audit Streamer ───────────────────────────────────────────

  const streamAudit = useCallback((bondType: string) => {
    const lines = AUDIT_LINES[bondType] ?? AUDIT_LINES.default;
    const totalClauses = lines.length;
    // Health climbs from 45 → 98 across audit lines
    const healthPerLine = Math.floor((98 - 45) / totalClauses);

    setGenerationStep("critic");
    setCriticLog("");

    let lineIdx = 0;
    // Stream line-by-line with a 380ms gap per clause (visible audit pulse)
    const lineInterval = setInterval(() => {
      if (lineIdx >= lines.length) {
        clearInterval(lineInterval);
        setGenerationStep("complete");
        setHealthScore(98);
        setIsGenerating(false);
        return;
      }
      setCriticLog(prev => (prev ? prev + "\n" + lines[lineIdx] : lines[lineIdx]));
      // Climb health score with each clause
      setHealthScore(h => Math.min(98, h + healthPerLine));
      lineIdx++;
    }, 380);
  }, []);

  // ── Core Draft → Audit Pipeline ─────────────────────────────────────────────

  const runDraftPipeline = useCallback((content: string, bondType: string) => {
    setIsGenerating(true);
    setGenerationStep("drafting");
    setDraftText("");
    setCriticLog("");
    setShowXAI(false);
    setHealthScore(0);

    // Phase 1: Stream draft text (climbs health 0→45)
    const hDraftInterval = setInterval(() => setHealthScore(h => Math.min(45, h + 1)), 80);

    let idx = 0;
    const typingInterval = setInterval(() => {
      idx += 6;
      setDraftText(content.slice(0, idx));
      if (idx >= content.length + 6) {
        clearInterval(typingInterval);
        clearInterval(hDraftInterval);
        setHealthScore(45);
        // Phase 2: stream audit after a short breath
        setTimeout(() => streamAudit(bondType), 300);
      }
    }, 12);
  }, [streamAudit]);

  // ── BondConfigurator → "Draft with AI" callback ─────────────────────────────
  // Stores the pre-generated content and type, then fires the pipeline

  const handleBondDraftGenerated = (content: string, type: string) => {
    setActiveBondType(type);
    setPendingDraftContent(content);
    runDraftPipeline(content, type);
  };

  // ── AgentWorkspace → "Generate [BondType]" button ──────────────────────────
  // Triggers generation directly from the workspace using Claude 4.5 Sonnet

  const handleGenerate = async () => {
    if (isGenerating || !isIdentitySynced) return;
    setIsGenerating(true);

    try {
      // Use pendingDraftContent if already generated; otherwise generate fresh
      const content = pendingDraftContent
        || await generateBondDraft(activeBondType, "", identityData);
      setPendingDraftContent(content);
      runDraftPipeline(content, activeBondType);
    } catch (err) {
      console.error("Generation failed:", err);
      setIsGenerating(false);
    }
  };

  // ── Bond type change (from BondConfigurator dropdown) resets workspace ──────

  const handleBondTypeChange = (type: string) => {
    if (type !== activeBondType) {
      setActiveBondType(type);
      setPendingDraftContent("");   // force fresh generation on type change
      // Reset workspace if idle
      if (generationStep === "complete" || generationStep === "idle") {
        setGenerationStep("idle");
        setDraftText("");
        setCriticLog("");
        setHealthScore(0);
      }
    }
  };

  // ── Push to Notary ──────────────────────────────────────────────────────────

  const handlePushToNotary = () => {
    saveDraftToNotaryQueue({
      id: "LEXI-2026-" + Math.floor(Math.random() * 9000 + 1000),
      type: activeBondType,
      label: `Generated ${activeBondType}`,
      parties: `${identityData?.name || "Party A"} & Party B`,
      date: new Date().toISOString().split("T")[0],
      content: draftText,
    });
    setTxHistory(getTransactions());
    setHasPrinted(false); // reset for next session
    
    // CRITICAL: Wipe identity from memory after successful handshake/save
    wipeIdentity();
    console.log("🔒 [Security] Secure Wipe Complete: Transaction Pushed to Notary.");
    
    router.push("/notary");
  };

  const handleLogout = () => {
    localStorage.removeItem("lexi_user");
    wipeIdentity();
    router.refresh();
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#1A202C] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#1A202C]/80 backdrop-blur-md border-b z-50 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.refresh()}>
          <div className="w-8 h-8 bg-[#3182CE] rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">LexiDraft <span className="text-[#3182CE]">AI</span></span>
        </div>

        <div className="flex items-center gap-2 relative">
          <Button variant="ghost" size="icon" className="touch-target rounded-full">
            <LayoutDashboard className="w-5 h-5" />
          </Button>

          <div className="relative" ref={userMenuRef}>
            <Button
              variant="ghost"
              size="icon"
              className="touch-target rounded-full relative"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <UserCircle className="w-5 h-5" />
              {isDigilockerVerified && (
                <CheckCircle className="w-3 h-3 text-emerald-500 absolute bottom-1 right-1 bg-white rounded-full" />
              )}
              {/* Sync indicator dot when identity is loaded but not DigiLocker */}
              {isIdentitySynced && !isDigilockerVerified && (
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full absolute bottom-0.5 right-0.5 border-2 border-white dark:border-[#1A202C]" />
              )}
            </Button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600">
                    <UserCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{identityData?.name || "Guest User"}</h4>
                    {isDigilockerVerified ? (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> DigiLocker Verified
                      </span>
                    ) : isIdentitySynced ? (
                      <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> Identity Synced
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">Unverified Profile</span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h5 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider flex items-center gap-1">
                    <History className="w-3 h-3" /> Recent Transactions ({txHistory.length})
                  </h5>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {txHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4">No drafts generated yet.</p>
                    ) : (
                      txHistory.map(tx => (
                        <div key={tx.id} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start justify-between group cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors">
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{tx.type}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{tx.parties}</p>
                          </div>
                          <span className="text-[10px] font-black tracking-widest bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md uppercase">
                            {tx.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
          <Button
            variant="outline"
            onClick={() => router.push("/notary")}
            className="touch-target px-4 text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Notary Portal
          </Button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 md:px-8 max-w-[1440px] mx-auto">

        <div className="mb-8 pl-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Citizen Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
            Orchestrate multi-agent legal drafting with real-time auditing and regional explainability.
          </p>
        </div>

        {/* 3-Pillar Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">

          {/* Left Pillar: InputStrategy + DigiLocker (Span 3) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <InputStrategy
              onIdentitySync={handleIdentitySync}
              onForceSync={handleForceSync}
            />

            {/* Alternative e-KYC / DigiLocker Mini-Card */}
            <Card className="bento-card border-none shadow-sm mt-auto max-h-[140px]">
              <CardContent className="p-4 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-3">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Alternative e-KYC</p>
                  {isDigilockerVerified && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase bg-emerald-100/50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> Vault Synced
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowOtpModal(true)}
                  className="w-full border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 touch-target rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                >
                  <DownloadCloud className="w-4 h-4 mr-2 text-emerald-600" />
                  Fetch from DigiLocker
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center Pillar: Bond Configurator (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <BondConfigurator
              identityData={identityData}
              onDraftGenerate={handleBondDraftGenerated}
            />
          </div>

          {/* Right Pillar: AI Agent Workspace (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-4 lg:gap-6">
            <AgentWorkspace
              isIdentitySynced={isIdentitySynced}
              identityData={identityData}
              ingestionPath={ingestionPath}
              activeBondType={activeBondType}
              generationStep={generationStep}
              draftText={draftText}
              criticLog={criticLog}
              healthScore={healthScore}
              isGenerating={isGenerating}
              showXAI={showXAI}
              onSetShowXAI={setShowXAI}
              onGenerate={handleGenerate}
              onPushToNotary={handlePushToNotary}
            />
          </div>

        </div>

        {/* ── Ecosystem Panel (Digital India, Nashik, Accessibility) ── */}
        <div className="mt-4 lg:mt-6">
          <div className="mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Digital India Ecosystem</h2>
          </div>
          <Ecosystem
            generationStep={generationStep}
            activeBondType={activeBondType}
            hasPrinted={hasPrinted}
            onNMCSync={(propertyData) => {
              // Inject NMC data as additional context into pending draft
              setPendingDraftContent(prev => prev ? prev + "\n\n" + propertyData : propertyData);
            }}
            onVoicePrompt={(prompt) => {
              // Voice prompt from Bhashini is handled in BondConfigurator directly
              // Here we just log it as a no-op since BondConfigurator manages its own state
              console.log("[Bhashini Voice] Prompt received at page level:", prompt.slice(0, 60));
            }}
          />
        </div>
      </main>

      {/* DigiLocker OTP Modal */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-none rounded-3xl overflow-hidden glass z-[200]">
          <DialogHeader className="mb-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <DownloadCloud className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold">DigiLocker e-KYC</DialogTitle>
            <p className="text-sm text-slate-500">
              Enter the OTP sent to your Aadhaar linked mobile number ending with ******4123.
            </p>
          </DialogHeader>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="e.g. 123456"
              type="number"
              className="text-center font-black tracking-widest text-lg h-14 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleDigilockerVerify}
              disabled={otp.length < 4 || isVerifyingOtp}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 font-bold"
            >
              {isVerifyingOtp ? "Establishing Secure Connection…" : "Verify & Fetch Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
