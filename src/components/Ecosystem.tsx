/**
 * Ecosystem.tsx — LexiDraft Final Polish
 * ----------------------------------------
 * Bento panel aggregating all Digital India ecosystem controls:
 *   Module 1 — Digital India Handshake (Aadhaar eSign, e-Stamp, DigiLocker)
 *   Module 2 — Sovereign Accessibility (Bhashini Voice, ISL)
 *   Module 4 — Hyper-Local Nashik (NashikLocator + NMC Sync)
 *   Module 5 — Auditability Trace link chips
 *
 * NOTE: This is a DRAFT skeleton for user review.
 *       All government integrations are MOCK — no real API calls.
 *       Stateless Identity Protocol is maintained throughout.
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Fingerprint,
  Stamp,
  FolderCloud,
  Mic,
  Hand,
  MapPin,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Radio,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EcosystemProps {
  /** Current generation state from AgentWorkspace */
  generationStep: "idle" | "drafting" | "critic" | "complete";
  /** Active bond type — used to conditionally show NMC Sync */
  activeBondType: string;
  /** Set to true once the notary has clicked 1-Click Print */
  hasPrinted: boolean;
  /** Callback: injects mock NMC property data into BondConfigurator textarea */
  onNMCSync: (propertyData: string) => void;
  /** Callback: injects mock Bhashini voice prompt into BondConfigurator */
  onVoicePrompt: (prompt: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NASHIK_KIOSKS = [
  { name: "Panchavati Setu Centre", area: "Panchavati", dist: "1.2 km", hours: "Mon–Sat 9–5" },
  { name: "CIDCO Notary Kiosk", area: "CIDCO Colony", dist: "3.4 km", hours: "Mon–Fri 10–4" },
  { name: "Nashik Road Camp Office", area: "Nashik Road", dist: "5.1 km", hours: "Mon–Sat 9–5" },
  { name: "Satpur Industrial Hub", area: "Satpur MIDC", dist: "7.8 km", hours: "Mon–Fri 9–3" },
];

const PROPERTY_BOND_TYPES = ["Rent Agreement", "Indemnity Bond"];

const MOCK_PROPERTY_DATA = `[NMC Civic Data Sync — Nashik Municipal Corporation]
Survey No: 47/2A, Ward: Panchavati (Ward 12)
Plot Area: 1,200 sq.ft | Zone: Residential R1
Registered Owner: [Fetched from NMC Registry]
Last Tax Assessment: ₹18,400 / year (FY 2025-26)
Encumbrance: NIL (as on 2026-03-24)`;

const MOCK_VOICE_PROMPTS: Record<string, string> = {
  marathi: `मला एक भाडेकरार हवा आहे — मासिक भाडे ₹12,000, 11 महिन्यांसाठी, 
सुरक्षा ठेव ₹36,000, पुणे न्यायालयाचे अधिकारक्षेत्र.`,
  translation: `[Bhashini Auto-Translated] I need a Rent Agreement — monthly rent ₹12,000, 
for 11 months, security deposit ₹36,000, jurisdiction: Pune Courts.`,
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

/** Mock Nashik map placeholder */
function NashikMapPlaceholder() {
  const [selectedKiosk, setSelectedKiosk] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {/* Map Grid Placeholder */}
      <div className="relative h-28 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #94a3b8 1px, transparent 1px),
              linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        />
        {/* Mock pin icons at hardcoded relative positions */}
        {[
          { top: "20%", left: "30%", label: "Panchavati" },
          { top: "55%", left: "60%", label: "CIDCO" },
          { top: "70%", left: "20%", label: "Nashik Rd" },
          { top: "30%", left: "75%", label: "Satpur" },
        ].map((pin, i) => (
          <button
            key={i}
            onClick={() => setSelectedKiosk(selectedKiosk === i ? null : i)}
            className="absolute group"
            style={{ top: pin.top, left: pin.left }}
            aria-label={`Select kiosk ${pin.label}`}
          >
            <MapPin
              className={cn(
                "w-5 h-5 drop-shadow transition-all",
                selectedKiosk === i ? "text-red-500 scale-125" : "text-[#2563EB] hover:scale-110"
              )}
            />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-white dark:bg-slate-800 shadow rounded text-[8px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {pin.label}
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
            onClick={() => setSelectedKiosk(selectedKiosk === i ? null : i)}
            className={cn(
              "text-left p-2.5 rounded-lg border transition-all duration-200 hover:shadow-sm",
              selectedKiosk === i
                ? "border-[#2563EB] bg-blue-50 dark:bg-blue-900/20"
                : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
            )}
          >
            <div className="flex items-start gap-2">
              <Building2
                className={cn(
                  "w-4 h-4 mt-0.5 shrink-0",
                  selectedKiosk === i ? "text-[#2563EB]" : "text-slate-400"
                )}
              />
              <div>
                <p className="text-[10px] font-bold text-slate-800 dark:text-slate-100">{kiosk.name}</p>
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
  hasPrinted,
  onNMCSync,
  onVoicePrompt,
}: EcosystemProps) {
  // Module 1 state
  const [isSigned, setIsSigned] = useState(false);
  const [eStamp, setEStamp] = useState<string | null>(null);
  const [digiLockerPushed, setDigiLockerPushed] = useState(false);

  // Module 2 state
  const [isListening, setIsListening] = useState(false);
  const [islActive, setIslActive] = useState(false);

  // Module 4 state
  const [isSyncing, setIsSyncing] = useState(false);
  const [nmcSynced, setNmcSynced] = useState(false);

  const isComplete = generationStep === "complete";
  const isPropertyBond = PROPERTY_BOND_TYPES.some((t) =>
    activeBondType.toLowerCase().includes(t.toLowerCase().split(" ")[0])
  );

  // ── Handlers ──

  const handleESign = () => {
    // Mock OTP flow — real flow would open UIDAI modal
    const confirmed = window.confirm(
      "[MOCK] UIDAI Aadhaar eSign\n\nEnter OTP: 123456\n\nClick OK to simulate successful OTP verification."
    );
    if (confirmed) setIsSigned(true);
  };

  const handleEStamp = () => {
    const grn = `GRN-2026-NeSL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    setEStamp(grn);
  };

  const handleDigiLocker = () => {
    if (!hasPrinted) return;
    const ref = `DL-2026-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setDigiLockerPushed(true);
    alert(`[MOCK] DigiLocker Push Successful!\nReference: ${ref}\n\nDocument stored in your DigiLocker vault.`);
  };

  const handleVoicePrompt = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      onVoicePrompt(MOCK_VOICE_PROMPTS.translation);
    }, 2200);
  };

  const handleNMCSync = () => {
    if (!isPropertyBond) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setNmcSynced(true);
      onNMCSync(MOCK_PROPERTY_DATA);
    }, 1500);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

      {/* ── Card 1: Digital India Handshake ── */}
      <Card className="bento-card border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
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
            <StatusChip label="Aadhaar eSign" active={isSigned} icon={Fingerprint} />
            <StatusChip label="e-Stamp" active={!!eStamp} icon={Stamp} />
            <StatusChip label="DigiLocker" active={digiLockerPushed} icon={FolderCloud} />
          </div>

          {/* e-Stamp GRN display */}
          {eStamp && (
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in duration-300">
              <p className="text-[9px] font-black uppercase text-indigo-400 tracking-wider mb-0.5">NeSL e-Stamp 2026</p>
              <p className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">{eStamp}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              id="aadhaar-esign-btn"
              size="sm"
              disabled={isSigned || !isComplete}
              onClick={handleESign}
              className={cn(
                "text-[10px] font-black h-9 rounded-xl",
                isSigned
                  ? "bg-emerald-500 text-white"
                  : "bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
              )}
            >
              <Fingerprint className="w-3.5 h-3.5 mr-1.5" />
              {isSigned ? "Signed ✓" : "Sign via OTP"}
            </Button>

            <Button
              id="fetch-estamp-btn"
              size="sm"
              disabled={!!eStamp || !isComplete}
              onClick={handleEStamp}
              className={cn(
                "text-[10px] font-black h-9 rounded-xl",
                eStamp
                  ? "bg-emerald-500 text-white"
                  : "bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
              )}
            >
              <Stamp className="w-3.5 h-3.5 mr-1.5" />
              {eStamp ? "Stamped ✓" : "Fetch e-Stamp"}
            </Button>

            <Button
              id="digilocker-push-btn"
              size="sm"
              disabled={!hasPrinted || digiLockerPushed}
              onClick={handleDigiLocker}
              className={cn(
                "text-[10px] font-black h-9 rounded-xl",
                digiLockerPushed
                  ? "bg-emerald-500 text-white"
                  : !hasPrinted
                  ? "opacity-50 bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
              )}
            >
              <FolderCloud className="w-3.5 h-3.5 mr-1.5" />
              {digiLockerPushed ? "Pushed ✓" : !hasPrinted ? "Print First" : "Push to DigiLocker"}
            </Button>
          </div>

          {/* ISL + Bhashini row */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">

            {/* Bhashini Voice */}
            <div className="flex-1 flex items-center gap-3 p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
              <Button
                id="bhashini-voice-btn"
                size="sm"
                onClick={handleVoicePrompt}
                disabled={isListening}
                className={cn(
                  "h-8 w-8 p-0 rounded-lg shrink-0",
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
                )}
                aria-label="Bhashini Voice Input"
              >
                {isListening ? <Radio className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </Button>
              <div>
                <p className="text-[9px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">
                  Bhashini Voice
                </p>
                <p className="text-[9px] text-slate-500">
                  {isListening ? "Listening in Marathi…" : "Tap to speak Marathi / Hindi"}
                </p>
              </div>
            </div>

            {/* ISL Toggle */}
            <div className="flex-1 flex items-center gap-3 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
              <Switch
                id="isl-toggle"
                checked={islActive}
                onCheckedChange={setIslActive}
                disabled={!isComplete}
                className="data-[state=checked]:bg-purple-600 shrink-0"
              />
              <div>
                <p className="text-[9px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                  ISL Avatar
                </p>
                <p className="text-[9px] text-slate-500">Indian Sign Language · AI-2026 Beta</p>
              </div>
            </div>
          </div>

          {/* ISL mock video player */}
          {islActive && isComplete && (
            <div
              className="animate-in slide-in-from-bottom-2 duration-300 rounded-xl overflow-hidden border-2 border-purple-200 dark:border-purple-800 bg-purple-900 relative h-24 flex items-center justify-center"
              aria-label="ISL Avatar Video Player"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900" />
              <div className="relative z-10 text-center">
                <Hand className="w-8 h-8 text-purple-300 mx-auto mb-1 animate-bounce" />
                <p className="text-[9px] font-black text-purple-200 uppercase tracking-wider">
                  AI-ISL Avatar Translating…
                </p>
                <p className="text-[8px] text-purple-400 mt-0.5">2026 Beta · MeitY Approved</p>
              </div>
              {/* Pulse border animation */}
              <div className="absolute inset-0 rounded-xl border-2 border-purple-400 animate-ping opacity-20" />
            </div>
          )}
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
            {/* NMC Sync Button */}
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
            Setu offices & verified kiosks · Nashik District
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-5">
          <NashikMapPlaceholder />

          {/* NMC sync status */}
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

    </div>
  );
}
