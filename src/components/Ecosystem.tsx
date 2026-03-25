/**
 * Ecosystem.tsx — LexiDraft Final Polish
 * ----------------------------------------
 * Bento panel aggregating all Digital India ecosystem controls:
 *   Module 1 — Digital India Handshake (Aadhaar eSign, e-Stamp, DigiLocker)
 *   Module 2 — Sovereign Accessibility (Bhashini Voice, ISL inline panel)
 *   Module 4 — Hyper-Local Nashik (NashikLocator + NMC Sync)
 *
 * All government integrations are MOCK — no real API calls.
 * Stateless Identity Protocol is maintained throughout.
 */

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Fingerprint,
  Stamp,
  Cloud,
  Mic,
  Hand,
  MapPin,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Radio,
  X,
  Send,
  Volume2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EcosystemProps {
  /** Current generation state from AgentWorkspace */
  generationStep: "idle" | "drafting" | "critic" | "complete";
  /** Active bond type — used to conditionally show NMC Sync */
  activeBondType: string;
  /** Content of the draft for ISL narrator */
  draftText?: string;
  /** Set to true once the notary has clicked 1-Click Print */
  hasPrinted: boolean;
  /** Callback: injects mock NMC property data into BondConfigurator textarea */
  onNMCSync: (propertyData: string) => void;
  /** Callback: injects mock Bhashini voice prompt into BondConfigurator */
  onVoicePrompt: (prompt: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NASHIK_KIOSKS = [
  { name: "Panchavati Setu Centre", area: "Panchavati", dist: "1.2 km", hours: "Mon–Sat 9–5",  pin: { top: "22%", left: "28%" } },
  { name: "CIDCO Notary Kiosk",     area: "CIDCO Colony", dist: "3.4 km", hours: "Mon–Fri 10–4", pin: { top: "40%", left: "62%" } },
  { name: "Nashik Road Camp Office", area: "Nashik Road", dist: "5.1 km", hours: "Mon–Sat 9–5", pin: { top: "65%", left: "18%" } },
  { name: "Satpur Industrial Hub",  area: "Satpur MIDC", dist: "7.8 km",  hours: "Mon–Fri 9–3",  pin: { top: "32%", left: "78%" } },
];

const PROPERTY_BOND_TYPES = ["Rent Agreement", "Indemnity Bond"];

const MOCK_PROPERTY_DATA = `[NMC Civic Data Sync — Nashik Municipal Corporation]
Survey No: 47/2A, Ward: Panchavati (Ward 12)
Plot Area: 1,200 sq.ft | Zone: Residential R1
Registered Owner: [Fetched from NMC Registry]
Last Tax Assessment: ₹18,400 / year (FY 2025-26)
Encumbrance: NIL (as on 2026-03-24)`;

const MOCK_VOICE_PROMPTS: Record<string, string> = {
  marathi: `मला एक भाडेकरार हवा आहे — मासिक भाडे ₹12,000, 11 महिन्यांसाठी, सुरक्षा ठेव ₹36,000, पुणे न्यायालयाचे अधिकारक्षेत्र.`,
  translation: `[Bhashini Auto-Translated] I need a Rent Agreement — monthly rent ₹12,000, for 11 months, security deposit ₹36,000, jurisdiction: Pune Courts.`,
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

/** Digital India status chip */
function StatusChip({
  label,
  active,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  icon: React.ElementType;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all duration-300",
        active
          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400"
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", active ? "text-emerald-500" : "text-slate-300")} />
      {label}
      {active && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-0.5" />}
    </div>
  );
}

/** ISL Avatar inline panel */
function ISLAvatarPanel({ draftText }: { draftText: string }) {
  const [inputText, setInputText]     = useState(draftText.slice(0, 120));
  const [isTranslating, setIsTranslating] = useState(false);
  const [outputText, setOutputText]   = useState<string | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleTranslate = () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    setOutputText(null);
    setTimeout(() => {
      setIsTranslating(false);
      setOutputText(`Playing ISL translation for: ${inputText.trim()}`);
      // Also speak the text if speech API available
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(inputText.trim());
        utt.lang = "en-IN";
        utt.rate = 0.82;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang.startsWith("en-IN")) || voices.find(v => v.lang.startsWith("en"));
        if (preferred) utt.voice = preferred;
        speechRef.current = utt;
        window.speechSynthesis.speak(utt);
      }
    }, 1800);
  };

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  return (
    <div className="mt-3 rounded-2xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
      {/* Avatar video area */}
      <div className="relative bg-gradient-to-br from-purple-950 to-indigo-950 flex items-center justify-center h-28 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, #a855f7 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%)" }} />
        {isTranslating ? (
          <div className="flex flex-col items-center gap-2 relative z-10">
            <Loader2 className="w-8 h-8 text-purple-300 animate-spin" />
            <p className="text-[9px] font-black text-purple-300 uppercase tracking-wider">Processing ISL Translation…</p>
          </div>
        ) : outputText ? (
          <div className="relative z-10 px-6 text-center">
            <Hand className="w-7 h-7 text-purple-200 mx-auto mb-2 animate-bounce" />
            <p className="text-xs font-bold text-purple-100 leading-relaxed">{outputText}</p>
            <span className="text-[8px] text-purple-400 mt-1 block">2026 Beta · MeitY Approved</span>
          </div>
        ) : (
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-purple-700 bg-purple-900 flex items-center justify-center mx-auto mb-2">
              <Hand className="w-7 h-7 text-purple-400" />
            </div>
            <p className="text-[9px] font-black text-purple-400 uppercase tracking-wider">AI-ISL Avatar · Standby</p>
            <p className="text-[8px] text-purple-600 mt-0.5">Enter text below and submit</p>
          </div>
        )}
        <Volume2 className="absolute top-2 right-2 w-3.5 h-3.5 text-purple-600" />
      </div>

      {/* Text input area */}
      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 flex gap-2">
        <Input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Enter legal text for ISL translation…"
          className="flex-1 h-9 text-xs bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-800 focus-visible:ring-purple-500 rounded-xl"
          onKeyDown={e => { if (e.key === "Enter") handleTranslate(); }}
        />
        <Button
          size="sm"
          onClick={handleTranslate}
          disabled={isTranslating || !inputText.trim()}
          className="h-9 px-3 rounded-xl shrink-0 bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50"
        >
          {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );
}

/** Nashik map + kiosk cards with shared active state */
function NashikMapPlaceholder() {
  const [activeLocation, setActiveLocation] = useState<number | null>(null);

  const toggle = useCallback((i: number) => {
    setActiveLocation(prev => (prev === i ? null : i));
  }, []);

  return (
    <div className="space-y-3">
      {/* Map Grid */}
      <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {NASHIK_KIOSKS.map((kiosk, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="absolute group transition-transform duration-200 hover:scale-110"
            style={{ top: kiosk.pin.top, left: kiosk.pin.left }}
            aria-label={`Select kiosk ${kiosk.name}`}
          >
            <MapPin
              className={cn(
                "w-5 h-5 drop-shadow-md transition-all duration-200",
                activeLocation === i
                  ? "text-red-500 scale-125 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]"
                  : "text-[#2563EB] hover:text-indigo-700"
              )}
            />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-white dark:bg-slate-800 shadow rounded text-[8px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {kiosk.area}
            </span>
          </button>
        ))}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#2563EB] text-white text-[8px] font-black uppercase tracking-wider">
          Nashik District
        </div>
      </div>

      {/* Kiosk Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {NASHIK_KIOSKS.map((kiosk, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={cn(
              "text-left p-2.5 rounded-lg border transition-all duration-200 hover:shadow-md",
              activeLocation === i
                ? "border-[#2563EB] bg-blue-50 dark:bg-blue-900/20 shadow-sm shadow-blue-200"
                : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200"
            )}
          >
            <div className="flex items-start gap-2">
              <Building2
                className={cn(
                  "w-4 h-4 mt-0.5 shrink-0 transition-colors",
                  activeLocation === i ? "text-[#2563EB]" : "text-slate-400"
                )}
              />
              <div>
                <p className={cn("text-[10px] font-bold transition-colors", activeLocation === i ? "text-[#2563EB]" : "text-slate-800 dark:text-slate-100")}>
                  {kiosk.name}
                </p>
                <p className="text-[9px] text-slate-500">{kiosk.area} · {kiosk.dist}</p>
                <p className="text-[9px] text-slate-400">{kiosk.hours}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Ecosystem({
  generationStep,
  activeBondType,
  draftText = "",
  hasPrinted,
  onNMCSync,
  onVoicePrompt,
}: EcosystemProps) {

  // ── Module 1: Digital India Handshake ─────────────────────────────────────
  const [isSigned,          setIsSigned]          = useState(false);
  const [isSigningLoading,  setIsSigningLoading]   = useState(false);
  const [showOtpModal,      setShowOtpModal]       = useState(false);
  const [otp,               setOtp]               = useState("");
  const [isVerifyingOtp,    setIsVerifyingOtp]     = useState(false);

  const [eStamp,            setEStamp]             = useState<string | null>(null);
  const [isStampLoading,    setIsStampLoading]     = useState(false);

  const [digiLockerPushed,  setDigiLockerPushed]   = useState(false);
  const [isDigiPushing,     setIsDigiPushing]      = useState(false);
  const [digiRef,           setDigiRef]            = useState<string | null>(null);

  // ── Module 2: Sovereign Accessibility ─────────────────────────────────────
  const [isListening,  setIsListening]  = useState(false);
  const [islExpanded,  setIslExpanded]  = useState(false);

  // ── Module 4: NMC Sync ────────────────────────────────────────────────────
  const [isSyncing, setIsSyncing] = useState(false);
  const [nmcSynced, setNmcSynced] = useState(false);

  const isComplete     = generationStep === "complete";
  const isPropertyBond = PROPERTY_BOND_TYPES.some(t =>
    activeBondType.toLowerCase().includes(t.toLowerCase().split(" ")[0])
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Step 1: Click "Sign via OTP" → show OTP modal */
  const handleESignClick = () => {
    if (isSigned || isSigningLoading || !isComplete) return;
    setOtp("");
    setShowOtpModal(true);
  };

  /** Step 2: Verify OTP (2s async mock) */
  const handleOtpVerify = async () => {
    setIsVerifyingOtp(true);
    await new Promise(r => setTimeout(r, 1600));
    setIsVerifyingOtp(false);
    setShowOtpModal(false);
    setIsSigned(true);
    setOtp("");
  };

  /** Fetch e-Stamp: 2s async loading → GRN */
  const handleEStamp = async () => {
    if (eStamp || isStampLoading || !isComplete) return;
    setIsStampLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    const grn = `GRN-2026-NeSL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    setEStamp(grn);
    setIsStampLoading(false);
  };

  /** Push to DigiLocker: 2s async mock */
  const handleDigiLocker = async () => {
    if (!hasPrinted || digiLockerPushed || isDigiPushing) return;
    setIsDigiPushing(true);
    await new Promise(r => setTimeout(r, 2000));
    const ref = `DL-2026-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setDigiRef(ref);
    setDigiLockerPushed(true);
    setIsDigiPushing(false);
  };

  /** Bhashini Voice: pulsing animation for 2.2s then inject prompt */
  const handleVoicePrompt = () => {
    if (isListening) return;
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      onVoicePrompt(MOCK_VOICE_PROMPTS.translation);
    }, 2200);
  };

  const handleNMCSync = () => {
    if (!isPropertyBond || isSyncing || nmcSynced) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setNmcSynced(true);
      onNMCSync(MOCK_PROPERTY_DATA);
    }, 1500);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

      {/* ── Card 1: Digital India Handshake ── */}
      <Card className="bento-card border-none shadow-sm bg-white dark:bg-slate-900">
        <div className="h-1 w-full bg-gradient-to-r from-[#2563EB] to-indigo-500" />
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            Digital India Handshake
          </CardTitle>
          <p className="text-[10px] text-slate-400 font-medium">
            Mock UIDAI · NeSL · DigiLocker integrations
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-5 space-y-3">

          {/* Status chips row */}
          <div className="flex flex-wrap gap-2">
            <StatusChip label="Aadhaar eSign" active={isSigned}         icon={Fingerprint} />
            <StatusChip label="e-Stamp"       active={!!eStamp}         icon={Stamp} />
            <StatusChip label="DigiLocker"    active={digiLockerPushed} icon={Cloud} />
          </div>

          {/* e-Stamp GRN display */}
          {eStamp && (
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in duration-300">
              <p className="text-[9px] font-black uppercase text-indigo-400 tracking-wider mb-0.5">NeSL e-Stamp 2026</p>
              <p className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">{eStamp}</p>
            </div>
          )}

          {/* DigiLocker reference display */}
          {digiRef && (
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 animate-in fade-in duration-300">
              <p className="text-[9px] font-black uppercase text-emerald-500 tracking-wider mb-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> DigiLocker Vault
              </p>
              <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">{digiRef}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* Sign via OTP */}
            <Button
              id="aadhaar-esign-btn"
              size="sm"
              disabled={isSigned || isSigningLoading || !isComplete}
              onClick={handleESignClick}
              className={cn(
                "text-[10px] font-black h-9 rounded-xl transition-all",
                isSigned
                  ? "bg-emerald-500 text-white"
                  : isSigningLoading
                  ? "bg-blue-400 text-white"
                  : !isComplete
                  ? "opacity-50 bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
              )}
            >
              {isSigningLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isSigned ? (
                <><CheckCircle2 className="w-3 h-3 mr-1" /> Signed</>
              ) : (
                <><Fingerprint className="w-3.5 h-3.5 mr-1" /> Sign via OTP</>
              )}
            </Button>

            {/* Fetch e-Stamp */}
            <Button
              id="fetch-estamp-btn"
              size="sm"
              disabled={!!eStamp || isStampLoading || !isComplete}
              onClick={handleEStamp}
              className={cn(
                "text-[10px] font-black h-9 rounded-xl transition-all",
                eStamp
                  ? "bg-emerald-500 text-white"
                  : isStampLoading
                  ? "bg-blue-400 text-white"
                  : !isComplete
                  ? "opacity-50 bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
              )}
            >
              {isStampLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : eStamp ? (
                <><CheckCircle2 className="w-3 h-3 mr-1" /> Stamped</>
              ) : (
                <><Stamp className="w-3.5 h-3.5 mr-1" /> Fetch e-Stamp</>
              )}
            </Button>

            {/* Push to DigiLocker */}
            <Button
              id="digilocker-push-btn"
              size="sm"
              disabled={!hasPrinted || digiLockerPushed || isDigiPushing}
              onClick={handleDigiLocker}
              className={cn(
                "text-[10px] font-black h-9 rounded-xl transition-all",
                digiLockerPushed
                  ? "bg-emerald-500 text-white"
                  : isDigiPushing
                  ? "bg-blue-400 text-white"
                  : !hasPrinted
                  ? "opacity-50 bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
              )}
            >
              {isDigiPushing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : digiLockerPushed ? (
                <><CheckCircle2 className="w-3 h-3 mr-1" /> Pushed</>
              ) : !hasPrinted ? (
                <><Cloud className="w-3.5 h-3.5 mr-1" /> Print First</>
              ) : (
                <><Cloud className="w-3.5 h-3.5 mr-1" /> DigiLocker</>
              )}
            </Button>
          </div>

          {/* Bhashini Voice + ISL row */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">

            {/* Bhashini Voice */}
            <div className={cn(
              "flex-1 flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300",
              isListening
                ? "bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700"
                : "bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20"
            )}>
              <button
                id="bhashini-voice-btn"
                onClick={handleVoicePrompt}
                disabled={isListening}
                aria-label="Bhashini Voice Input"
                className={cn(
                  "h-8 w-8 rounded-lg shrink-0 flex items-center justify-center transition-all duration-200",
                  isListening
                    ? "bg-red-500 text-white shadow-lg shadow-red-400/50 animate-pulse scale-110"
                    : "bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
                )}
              >
                {isListening ? <Radio className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
              <div>
                <p className={cn(
                  "text-[9px] font-black uppercase tracking-wider transition-colors",
                  isListening ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"
                )}>
                  Bhashini Voice
                </p>
                <p className="text-[9px] text-slate-500">
                  {isListening ? "Listening in Marathi…" : "Tap to speak Marathi / Hindi"}
                </p>
              </div>
              {isListening && (
                <div className="ml-auto flex items-end gap-[2px] h-5">
                  {[0.5, 1, 0.7, 0.9, 0.4, 0.8, 0.6].map((h, i) => (
                    <div
                      key={i}
                      className="w-[3px] rounded-full bg-red-400"
                      style={{
                        height: `${h * 100}%`,
                        animation: `pulse ${0.4 + i * 0.08}s ease-in-out infinite alternate`,
                        animationDelay: `${i * 50}ms`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ISL Avatar button */}
            <div
              className={cn(
                "flex-1 flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all duration-300",
                islExpanded
                  ? "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700"
                  : "bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/20 hover:border-purple-200"
              )}
              onClick={() => setIslExpanded(v => !v)}
            >
              <div className={cn(
                "h-8 w-8 rounded-lg shrink-0 flex items-center justify-center transition-all",
                islExpanded ? "bg-purple-600 text-white" : "bg-purple-100 dark:bg-purple-900/40 text-purple-600"
              )}>
                <Hand className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                  ISL Avatar
                </p>
                <p className="text-[9px] text-slate-500">Indian Sign Language · AI-2026 Beta</p>
              </div>
              {islExpanded && <X className="ml-auto w-3.5 h-3.5 text-purple-400" />}
            </div>
          </div>

          {/* ISL Inline Panel */}
          {islExpanded && <ISLAvatarPanel draftText={draftText} />}

        </CardContent>
      </Card>

      {/* ── Card 2: Nashik Hyper-Local Integration ── */}
      <Card className="bento-card border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-bold flex items-center justify-between gap-2 text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Nashik Notary Locator
            </div>
            <Button
              id="nmc-sync-btn"
              size="sm"
              disabled={!isPropertyBond || isSyncing || nmcSynced}
              onClick={handleNMCSync}
              className={cn(
                "text-[9px] font-black h-7 px-3 rounded-lg shrink-0",
                nmcSynced
                  ? "bg-emerald-500 text-white"
                  : !isPropertyBond
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
              )}
              aria-label="NMC Civic Data Sync"
            >
              {isSyncing ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : nmcSynced ? (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              ) : (
                <Building2 className="w-3 h-3 mr-1" />
              )}
              {isSyncing ? "Syncing…" : nmcSynced ? "NMC Synced" : "NMC Civic Sync"}
            </Button>
          </CardTitle>
          <p className="text-[10px] text-slate-400 font-medium">
            Setu offices &amp; verified kiosks · Nashik District
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-5">
          <NashikMapPlaceholder />

          {nmcSynced && (
            <div className="mt-3 p-2.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/30 animate-in fade-in duration-300">
              <p className="text-[9px] font-black uppercase text-teal-500 tracking-wider mb-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> NMC Data Injected
              </p>
              <p className="text-[9px] text-slate-500">Property details synced into bond template.</p>
            </div>
          )}
          {!isPropertyBond && (
            <div className="mt-3 flex items-center gap-1.5 text-[9px] text-slate-400 font-medium">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              NMC Sync available for Rent Agreement &amp; Indemnity Bond types.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Aadhaar OTP Modal ── */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm mx-4 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-[#2563EB]" />
                </div>
                <button
                  onClick={() => { setShowOtpModal(false); setOtp(""); }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-black text-lg text-slate-800 dark:text-slate-100">Aadhaar eSign</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                [MOCK UIDAI] Enter the 6-digit OTP sent to your Aadhaar-linked mobile ending in ••••4123.
              </p>
            </div>

            {/* OTP Input */}
            <div className="p-6 space-y-4">
              <input
                type="number"
                value={otp}
                onChange={e => setOtp(e.target.value.slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="w-full h-14 text-center text-2xl font-black tracking-[0.5em] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-slate-800 dark:text-slate-100"
                onKeyDown={e => { if (e.key === "Enter" && otp.length >= 4) handleOtpVerify(); }}
                autoFocus
              />
              <p className="text-[10px] text-center text-slate-400">
                For demo, enter any 4–6 digits and click Verify.
              </p>
              <Button
                onClick={handleOtpVerify}
                disabled={otp.length < 4 || isVerifyingOtp}
                className="w-full h-12 rounded-2xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-black text-sm disabled:opacity-50"
              >
                {isVerifyingOtp ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying with UIDAI…</>
                ) : (
                  <><Fingerprint className="w-4 h-4 mr-2" /> Verify &amp; Sign</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
