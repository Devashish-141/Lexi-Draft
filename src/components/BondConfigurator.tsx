"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileSignature, Sparkles, ChevronDown, Mic, Radio } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { IdentityExtraction } from "@/lib/gemini-handler";
import { generateBondDraft } from "@/lib/ai-handlers";

// ─── Bhashini Mock Voice Prompts ─────────────────────────────────────────────

const BHASHINI_MOCK: Record<string, string> = {
  "Rent Agreement": `[Bhashini Voice — Marathi → English]\nI need a Rent Agreement — monthly rent ₹12,000, 11 months,\nsecurity deposit ₹36,000, jurisdiction: Nashik Courts.\nLandlord: [First Party Name], Tenant: [Second Party Name].`,
  "Name Change Affidavit": `[Bhashini Voice — Hindi → English]\nMujhe naam badlav ka shapat patra chahiye.\nPurana naam: [Old Name], Naya naam: [New Name], Pita ka naam: [Father Name].`,
  "Employment Bond": `[Bhashini Voice — Marathi → English]\nI need an Employment Bond — 2-year lock-in,\npenalty ₹1,50,000 for early exit, Nashik jurisdiction.`,
  "Indemnity Bond": `[Bhashini Voice — Marathi → English]\nI need an Indemnity Bond for lost passbook.\nIndemnifier: [Name], Bank: [Bank Name], Amount: ₹50,000.`,
  "Custom/Blank Bond": `[Bhashini Voice — Marathi → English]\nMala ek sada bond havay — Party A ani Party B madhye,\nspecific clause: [Describe your requirement here].`,
};

// ─── Bond Type Configuration ──────────────────────────────────────────────────

type BondType = "Rent Agreement" | "Name Change Affidavit" | "Indemnity Bond" | "Employment Bond" | "Custom/Blank Bond";

interface BondTypeConfig {
  label: string;
  accentBg: string;          // Tailwind bg class for button
  accentBgHover: string;     // Hover state
  accentBorder: string;      // Card top border / select border
  accentText: string;        // Text accent
  accentShadow: string;      // Button shadow color
  accentRing: string;        // Focus ring
  template: (identity: IdentityExtraction | null) => string;
}

const BOND_CONFIGS: Record<BondType, BondTypeConfig> = {
  "Rent Agreement": {
    label: "Rent Agreement",
    accentBg: "bg-blue-600",
    accentBgHover: "hover:bg-blue-700",
    accentBorder: "border-blue-300 dark:border-blue-700",
    accentText: "text-blue-600",
    accentShadow: "shadow-blue-500/30",
    accentRing: "focus:ring-blue-500",
    template: (id) =>
`RENT AGREEMENT

Landlord (First Party): ${id?.name ?? "[Full Name]"}
Address: ${id?.address ?? "[Address]"}
ID / Aadhaar: ${id?.idNumber ?? "[ID Number]"}

Tenant (Second Party):
Name: [Tenant Full Name]
Address: [Tenant Address]

Property Address: [Property Address]

Terms & Clauses:
- Monthly Rent (₹): [Amount]
- Security Deposit (₹): [Amount]
- Notice Period: [Days] days
- Lock-in Period: [Months] months
- Jurisdiction: [City] Courts`,
  },
  "Name Change Affidavit": {
    label: "Name Change Affidavit",
    accentBg: "bg-violet-600",
    accentBgHover: "hover:bg-violet-700",
    accentBorder: "border-violet-300 dark:border-violet-700",
    accentText: "text-violet-600",
    accentShadow: "shadow-violet-500/30",
    accentRing: "focus:ring-violet-500",
    template: (id) =>
`NAME CHANGE AFFIDAVIT

Deponent: ${id?.name ?? "[Full Name]"}
Address: ${id?.address ?? "[Address]"}
ID: ${id?.idNumber ?? "[ID Number]"}

Old Name (Abandoned): [Previous Legal Name]
New Legal Name: [New Name]
Father's Name: [Father's Full Name]

Reason for Change: [Optional — marriage / personal preference / spelling correction]

Clauses:
- All official records, documents, and government IDs to reflect new name.
- Deponent solemnly affirms this declaration is true and correct.
- Jurisdiction: [City] Courts`,
  },
  "Indemnity Bond": {
    label: "Indemnity Bond",
    accentBg: "bg-amber-500",
    accentBgHover: "hover:bg-amber-600",
    accentBorder: "border-amber-300 dark:border-amber-700",
    accentText: "text-amber-600",
    accentShadow: "shadow-amber-500/30",
    accentRing: "focus:ring-amber-500",
    template: (id) =>
`INDEMNITY BOND

Indemnifier (Party A): ${id?.name ?? "[Full Name]"}
Address: ${id?.address ?? "[Address]"}
ID: ${id?.idNumber ?? "[ID Number]"}

Indemnified Party (Party B):
Name: [Name of Bank / Institution / Individual]
Address: [Address]

Indemnity Clauses:
- Purpose / Reason for Indemnity: [Describe — lost document, damaged property, etc.]
- Amount of Indemnity (₹): [Amount]
- Scope: Party A shall indemnify Party B against all losses, damages, and costs arising from [specific event].
- Duration: [Period or Perpetual]
- Governing Law: Laws of India
- Jurisdiction: [City] Courts`,
  },
  "Employment Bond": {
    label: "Employment Bond",
    accentBg: "bg-orange-500",
    accentBgHover: "hover:bg-orange-600",
    accentBorder: "border-orange-300 dark:border-orange-700",
    accentText: "text-orange-600",
    accentShadow: "shadow-orange-500/30",
    accentRing: "focus:ring-orange-500",
    template: (id) =>
`EMPLOYMENT BOND

Employee: ${id?.name ?? "[Full Name]"}
Address: ${id?.address ?? "[Address]"}
ID / PAN: ${id?.idNumber ?? "[ID Number]"}
Designation: [Job Title]

Employer:
Company Name: [Company Name]
Registered Address: [Company Address]

Terms & Clauses:
- Bond Period: [X] months from date of joining
- Penalty for Early Exit (₹): [Amount]
- Confidentiality obligations apply during and post employment.
- Training Cost Invested by Employer (₹): [Amount, if applicable]
- Notice Period: [Days] days
- Jurisdiction: [City] Courts`,
  },
  "Custom/Blank Bond": {
    label: "Custom / Blank Bond",
    accentBg: "bg-pink-600",
    accentBgHover: "hover:bg-pink-700",
    accentBorder: "border-pink-300 dark:border-pink-700",
    accentText: "text-pink-600",
    accentShadow: "shadow-pink-500/30",
    accentRing: "focus:ring-pink-500",
    template: (id) =>
`CUSTOM BOND / BESPOKE AGREEMENT

Party A (First Party): ${id?.name ?? "[Full Name]"}
Address: ${id?.address ?? "[Address]"}
ID: ${id?.idNumber ?? "[ID Number]"}

Party B (Second Party):
Name: [Name]
Address: [Address]

Specific Clauses/Requirements:
- [Describe your obligation, clause, or term here]
- [Add as many clauses as needed]

Governing Law: Laws of India (Indian Contract Act, 1872)
Jurisdiction: [City] Courts`,
  },
};

const BOND_TYPES = Object.keys(BOND_CONFIGS) as BondType[];

// ─── Props ────────────────────────────────────────────────────────────────────

interface BondConfiguratorProps {
  identityData: IdentityExtraction | null;
  onDraftGenerate: (content: string, type: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BondConfigurator({ identityData, onDraftGenerate }: BondConfiguratorProps) {
  const [bondType, setBondType] = useState<BondType>("Rent Agreement");
  const [customReq, setCustomReq] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [hasInjected, setHasInjected] = useState(false);

  // M2: Bhashini Voice state
  const [isListening, setIsListening] = useState(false);

  const handleBhashiniVoice = () => {
    if (isListening) return;
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const mockPrompt = BHASHINI_MOCK[bondType] ?? BHASHINI_MOCK["Rent Agreement"];
      setCustomReq(mockPrompt);
    }, 2200);
  };

  const config = BOND_CONFIGS[bondType];

  // ── Reset textarea template when bond type changes ──
  useEffect(() => {
    setCustomReq(BOND_CONFIGS[bondType].template(identityData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bondType]);

  // ── Smart Variable Sync: inject identity data when it arrives ──
  useEffect(() => {
    if (identityData && !hasInjected) {
      setCustomReq(BOND_CONFIGS[bondType].template(identityData));
      setHasInjected(true);
    }
    // Re-inject on every identity data change (rescan / manual re-submit)
    if (identityData) {
      setCustomReq(BOND_CONFIGS[bondType].template(identityData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identityData]);

  const handleBondTypeChange = (type: BondType) => {
    setBondType(type);
    // Re-inject identity data into the new template immediately
    setCustomReq(BOND_CONFIGS[type].template(identityData));
  };

  const handleDraftWithAI = async () => {
    if (isDrafting) return;
    setIsDrafting(true);

    try {
      const generated = await generateBondDraft(bondType, customReq, identityData);
      onDraftGenerate(generated, bondType);
    } catch (err) {
      console.error("Draft generation failed:", err);
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <Card
      className={cn(
        "bento-card flex-1 flex flex-col relative z-20 pointer-events-auto h-full",
        "border-2 sm:border border-slate-200 dark:border-slate-800", // high-contrast on mobile
        "bg-white dark:bg-slate-900 overflow-hidden"
      )}
    >
      {/* Accent top bar — color shifts with bond type */}
      <div className={cn("h-1 w-full", config.accentBg)} />

      {/* Header */}
      <CardHeader className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <CardTitle className="text-sm font-bold flex items-center justify-between gap-2">
          <span className="uppercase tracking-wider text-slate-500">Bond Configuration</span>
          <div className="flex items-center gap-2">
            <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", config.accentBorder, config.accentText, "bg-white dark:bg-slate-900")}>
              Claude 4.5
            </span>
            <FileSignature className={cn("w-4 h-4", config.accentText)} />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col gap-4">

        {/* ── Document Type Dropdown ── */}
        <div className="space-y-2 relative z-50 pointer-events-auto">
          <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Select Document Type
          </Label>
          <div className="relative">
            <select
              value={bondType}
              onChange={(e) => handleBondTypeChange(e.target.value as BondType)}
              className={cn(
                "w-full h-10 pl-3 pr-9 rounded-xl appearance-none",
                "bg-slate-50 dark:bg-slate-800",
                "border-2",
                config.accentBorder,
                "text-sm font-semibold text-slate-800 dark:text-slate-100",
                "focus:outline-none focus:ring-2",
                config.accentRing,
                "relative z-50 pointer-events-auto touch-target cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
              )}
            >
              {BOND_TYPES.map((type) => (
                <option key={type} value={type} className="bg-white dark:bg-slate-800 font-medium">
                  {type === "Custom/Blank Bond" ? "✦ " : ""}{BOND_CONFIGS[type].label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* ── Draft Content / Custom Requirements Textarea ── */}
        <div className="space-y-2 flex-1 flex flex-col relative z-40 pointer-events-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Draft Content / Custom Requirements
              </Label>
              {/* M2: Bhashini Voice Button */}
              <button
                id="bhashini-voice-btn"
                type="button"
                onClick={handleBhashiniVoice}
                disabled={isListening}
                aria-label="Bhashini Voice Input"
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200",
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                    : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-200 dark:hover:bg-orange-800/40"
                )}
                title={isListening ? "Listening in Marathi/Hindi…" : "Bhashini Voice Input (Marathi / Hindi)"}
              >
                {isListening ? <Radio className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
              {isListening && (
                <span className="text-[9px] font-bold text-orange-600 animate-pulse">Listening…</span>
              )}
            </div>
            {identityData && (
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
                "border border-emerald-100 dark:border-emerald-900/30",
                "animate-in fade-in duration-300"
              )}>
                ✓ ID Synced
              </span>
            )}
          </div>
          <Textarea
            className={cn(
              "flex-1 min-h-[200px]",
              "bg-slate-50 dark:bg-slate-800/50",
              "border-slate-200 dark:border-slate-700",
              "resize-none rounded-xl text-xs sm:text-sm leading-relaxed touch-target",
              "font-mono placeholder:font-sans placeholder:text-slate-400",
              "focus-visible:ring-2",
              config.accentRing,
              "transition-all duration-200"
            )}
            placeholder="Enter specific clauses or edits you require..."
            value={customReq}
            onChange={(e) => setCustomReq(e.target.value)}
          />
          {bondType === "Custom/Blank Bond" && (
            <div className="flex items-start gap-2 mt-1 p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-100 dark:border-pink-900/30 animate-in fade-in duration-300">
              <span className="text-pink-500 text-sm leading-none shrink-0 mt-0.5">⚖</span>
              <p className="text-[10px] text-pink-700 dark:text-pink-300 leading-relaxed">
                The Legal Auditor Agent will validate your prompt against the{" "}
                <strong>Indian Contract Act, 1872</strong> before drafting. Void or illegal terms will be flagged.
              </p>
            </div>
          )}
        </div>

        {/* ── XAI Content Generator Button ── */}
        <div className="mt-auto pt-2 relative z-50 pointer-events-auto space-y-3">
          <Button
            onClick={handleDraftWithAI}
            disabled={isDrafting || !customReq.trim()}
            className={cn(
              "w-full h-12 rounded-xl font-bold text-white",
              "transition-all duration-200 relative overflow-hidden group",
              "touch-target cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed",
              config.accentBg,
              config.accentBgHover,
              `shadow-lg ${config.accentShadow}`
            )}
          >
            {/* Reasoning Pulse — shimmer sweep during drafting */}
            {isDrafting && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_1.4s_ease-in-out_infinite] -translate-x-full" />
            )}

            {/* Hover shimmer glow (idle) */}
            {!isDrafting && (
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
            )}

            <span className="relative z-10 flex items-center justify-center gap-2">
              <Sparkles
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isDrafting
                    ? "animate-pulse text-white/70 scale-90"
                    : "group-hover:scale-110 group-hover:rotate-12"
                )}
              />
              {isDrafting
                ? "Claude 4.5 Sonnet is Reasoning…"
                : "Draft with AI (XAI)"}
            </span>
          </Button>

          {/* Reasoning pulse indicator bars */}
          {isDrafting && (
            <div className="flex items-center justify-center gap-1 animate-in fade-in duration-300">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={cn("inline-block w-1 rounded-full", config.accentBg)}
                  style={{
                    height: `${8 + (i % 3) * 6}px`,
                    opacity: 0.7,
                    animation: `reasoningPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-2">
                Structured Drafting…
              </span>
            </div>
          )}

          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles className={cn("w-3 h-3", config.accentText)} />
            Powered by Claude 4.5 Sonnet
          </p>
        </div>
      </CardContent>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes reasoningPulse {
          0%, 100% { transform: scaleY(0.5); opacity: 0.4; }
          50%       { transform: scaleY(1.4); opacity: 1;   }
        }
      ` }} />
    </Card>
  );
}
