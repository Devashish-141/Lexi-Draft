"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldAlert, UploadCloud, FileText, Bot, Cpu, Globe2,
  ChevronDown, Stamp, CheckCircle2, LogOut, User, LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ─── Document Types ───────────────────────────────────────────────────────────

type DocType = "rent" | "affidavit" | "employment" | "nda" | "training" | "custom";

interface DocConfig {
  label: string;
  accentClass: string;
  textClass: string;
  borderClass: string;
  visionHint: string;
  fields: { id: string; label: string; placeholder: string; type?: string; multiline?: boolean }[];
  mockDraft: string;
  mockCritic: string;
  xaiMarathi: string;
  xaiHindi: string;
}

const DOC_CONFIGS: Record<DocType, DocConfig> = {
  rent: {
    label: "Rent Agreement",
    accentClass: "bg-blue-600 hover:bg-blue-700",
    textClass: "text-blue-600",
    borderClass: "border-blue-200",
    visionHint: "Aadhaar / PAN / Voter ID of Landlord & Tenant",
    fields: [
      { id: "landlord", label: "Landlord Name", placeholder: "e.g. Rajesh Kumar" },
      { id: "tenant", label: "Tenant Name", placeholder: "e.g. Priya Sharma" },
      { id: "rent", label: "Rent Amount (₹)", placeholder: "15000", type: "number" },
      { id: "deposit", label: "Security Deposit (₹)", placeholder: "45000", type: "number" },
      { id: "notice", label: "Notice Period (Days)", placeholder: "30", type: "number" },
      { id: "address", label: "Property Address", placeholder: "Flat 4B, Andheri West, Mumbai — 400053", multiline: true },
    ],
    mockDraft: `RENT AGREEMENT

This Rent Agreement is made between:
  1. Landlord: Mr. Rajesh Kumar, Park Avenue, Mumbai.
  2. Tenant:   Ms. Priya Sharma, Nehru Nagar, Pune.

TERMS:
  1. Rent Amount     : ₹15,000 per month.
  2. Notice Period   : 30 days written notice.
  3. Security Deposit: ₹45,000 (Refundable).
  4. Jurisdiction    : Mumbai Courts.
  5. Lock-in Period  : 11 months.

Landlord Signature: ___________
Tenant Signature  : ___________`,
    mockCritic: `[DYNAMIC LEGAL AUDITOR] Audit Matrix: RENT AGREEMENT (RA)
[RA-01] Party Details ............. ✓ PRESENT
[RA-02] Rent Amount ............... ✓ PRESENT (₹15,000)
[RA-03] Notice Period ............. ✓ PRESENT (30 days)
[RA-04] Security Deposit .......... ✓ PRESENT (₹45,000)
[RA-05] Jurisdiction .............. ✓ PRESENT (Mumbai)
[RA-06] Maintenance ............... ⚠ ADVISORY
[RA-07] Lock-in Period ............ ⚠ ADVISORY
[HALLUCINATION SCAN] No fabricated details detected.
[STATUS] ✅ APPROVED — All mandatory clauses present.`,
    xaiMarathi: "हे भाडे करार ₹१५,०००/महिना असून ३० दिवसांची पूर्वसूचना अनिवार्य आहे. ₹४५,००० अनामत रक्कम परत दिली जाईल.",
    xaiHindi: "यह किराया समझौता ₹१५,०००/माह है। ३० दिन का नोटिस और ₹४५,००० की सुरक्षा राशि वापस की जाएगी।",
  },
  affidavit: {
    label: "Name Change Affidavit",
    accentClass: "bg-violet-600 hover:bg-violet-700",
    textClass: "text-violet-600",
    borderClass: "border-violet-200",
    visionHint: "Aadhaar / Passport of Deponent",
    fields: [
      { id: "deponent", label: "Deponent Full Name", placeholder: "e.g. Sunil Kumar Verma" },
      { id: "oldName", label: "Old Name (Abandoned)", placeholder: "e.g. Sunil Kumar" },
      { id: "newName", label: "New Legal Name", placeholder: "e.g. Sunil Verma" },
      { id: "fatherName", label: "Father's Name", placeholder: "e.g. Ramesh Kumar" },
      { id: "address", label: "Permanent Address", placeholder: "House 12, Lajpat Nagar, Delhi — 110024", multiline: true },
    ],
    mockDraft: `AFFIDAVIT OF NAME CHANGE

I, Sunil Kumar Verma, S/o Ramesh Kumar, aged 32 years,
residing at House 12, Lajpat Nagar, Delhi — 110024,
do hereby solemnly affirm and declare:

  1. My old name: SUNIL KUMAR.
  2. My new legal name: SUNIL VERMA.
  3. This change applies to all official records.

VERIFICATION: Contents are true & correct.

Deponent Signature: ___________`,
    mockCritic: `[DYNAMIC LEGAL AUDITOR] Audit Matrix: NAME CHANGE AFFIDAVIT (AF)
[AF-01] Deponent Identity ......... ✓ PRESENT
[AF-02] Old Name .................. ✓ PRESENT (Sunil Kumar)
[AF-03] New Name .................. ✓ PRESENT (Sunil Verma)
[AF-04] Residential Address ....... ✓ PRESENT
[AF-05] Oath/Verification ......... ✓ PRESENT
[AF-06] Reason for Change ......... ⚠ ADVISORY
[AF-07] Witness/Notary Line ....... ⚠ ADVISORY
[STATUS] ✅ APPROVED — All mandatory clauses present.`,
    xaiMarathi: "हे शपथपत्र 'सुनील कुमार' वरून 'सुनील वर्मा' असे नाव बदलण्यासाठी आहे. सर्व सरकारी नोंदींमध्ये बदल होईल.",
    xaiHindi: "यह शपथपत्र 'सुनील कुमार' का नाम 'सुनील वर्मा' करने के लिए है। सभी सरकारी दस्तावेज़ों में सुधार होगा।",
  },
  employment: {
    label: "Employment Bond",
    accentClass: "bg-amber-500 hover:bg-amber-600",
    textClass: "text-amber-600",
    borderClass: "border-amber-200",
    visionHint: "PAN Card / Aadhaar of Employee",
    fields: [
      { id: "employer", label: "Employer Name / Company", placeholder: "e.g. TechCorp Pvt Ltd" },
      { id: "employee", label: "Employee Name", placeholder: "e.g. Aarav Singh" },
      { id: "designation", label: "Designation", placeholder: "e.g. Software Engineer" },
      { id: "bondPeriod", label: "Bond Period (months)", placeholder: "24", type: "number" },
      { id: "penalty", label: "Penalty Amount (₹)", placeholder: "200000", type: "number" },
      { id: "jurisdiction", label: "Jurisdiction", placeholder: "e.g. Bengaluru Courts" },
    ],
    mockDraft: `EMPLOYMENT BOND

This Employment Bond is made between:
  Employer: TechCorp Pvt Ltd, Bengaluru.
  Employee: Mr. Aarav Singh, Designation: Software Engineer.

TERMS:
  1. Bond Period  : 24 months from date of joining.
  2. Penalty      : ₹2,00,000 for early exit without notice.
  3. Jurisdiction : Bengaluru Courts.
  4. Confidentiality obligations apply during and post employment.

Employee Signature : ___________
Employer Signature : ___________
Witness 1          : ___________`,
    mockCritic: `[DYNAMIC LEGAL AUDITOR] Audit Matrix: EMPLOYMENT BOND (EB)
[EB-01] Employer Identity ......... ✓ PRESENT (TechCorp Pvt Ltd)
[EB-02] Employee + Designation .... ✓ PRESENT (Aarav Singh, SWE)
[EB-03] Bond Period ............... ✓ PRESENT (24 months)
[EB-04] Penalty Clause ............ ✓ PRESENT (₹2,00,000)
[EB-05] Jurisdiction .............. ✓ PRESENT (Bengaluru)
[EB-06] Confidentiality ........... ⚠ ADVISORY (include explicit NDA clause)
[EB-07] Witness Signatures ........ ⚠ ADVISORY
[STATUS] ✅ APPROVED — Legally sound. 2 advisories noted.`,
    xaiMarathi: "हा रोजगार बंधपत्र २४ महिन्यांसाठी आहे. नोकरी लवकर सोडल्यास ₹२,००,००० दंड भरावा लागेल.",
    xaiHindi: "यह रोजगार बंध-पत्र २४ महीनों के लिए है। नौकरी जल्दी छोड़ने पर ₹२,००,००० का जुर्माना देना होगा।",
  },
  nda: {
    label: "Non-Disclosure Agreement",
    accentClass: "bg-purple-600 hover:bg-purple-700",
    textClass: "text-purple-600",
    borderClass: "border-purple-200",
    visionHint: "PAN / Company Incorporation Cert of both parties",
    fields: [
      { id: "disclosing", label: "Disclosing Party", placeholder: "e.g. Infosys Ltd" },
      { id: "receiving", label: "Receiving Party", placeholder: "e.g. Dev Mehta" },
      { id: "purpose", label: "Purpose / Scope", placeholder: "e.g. Evaluation of software product", multiline: true },
      { id: "duration", label: "Obligation Duration (years)", placeholder: "3", type: "number" },
      { id: "jurisdiction", label: "Jurisdiction", placeholder: "e.g. Pune Courts" },
    ],
    mockDraft: `NON-DISCLOSURE AGREEMENT (NDA)

This NDA is made between:
  Disclosing Party : Infosys Ltd, Pune.
  Receiving Party  : Mr. Dev Mehta, Mumbai.

PURPOSE: Evaluation of proprietary software product.

TERMS:
  1. Confidential Info: All technical, business, and financial data shared.
  2. Exclusions: Info already in public domain is excluded.
  3. Obligation Duration: 3 years from date of execution.
  4. Remedies: Breach entitles Disclosing Party to injunctive relief.
  5. Jurisdiction: Pune Courts.

Disclosing Party Signature : ___________
Receiving Party Signature  : ___________`,
    mockCritic: `[DYNAMIC LEGAL AUDITOR] Audit Matrix: NDA
[NDA-01] Disclosing Party ......... ✓ PRESENT (Infosys Ltd)
[NDA-02] Receiving Party .......... ✓ PRESENT (Dev Mehta)
[NDA-03] Confidential Info Defn ... ✓ PRESENT
[NDA-04] Exclusions ............... ✓ PRESENT (public domain)
[NDA-05] Duration ................. ✓ PRESENT (3 years)
[NDA-06] Remedies ................. ✓ PRESENT (injunctive relief)
[NDA-07] Return of Materials ...... ⚠ ADVISORY
[STATUS] ✅ APPROVED — All mandatory NDA clauses present.`,
    xaiMarathi: "हा NDA ३ वर्षांसाठी आहे. Infosys ची सर्व गोपनीय माहिती Dev Mehta यांनी उघड करता कामा नये. उल्लंघनावर न्यायालयीन आदेश मिळू शकतो.",
    xaiHindi: "यह NDA ३ साल के लिए है। Infosys की गोपनीय जानकारी Dev Mehta को किसी से साझा नहीं करनी है। उल्लंघन पर कोर्ट का आदेश मिल सकता है।",
  },
  training: {
    label: "Training Indemnity Bond",
    accentClass: "bg-orange-500 hover:bg-orange-600",
    textClass: "text-orange-600",
    borderClass: "border-orange-200",
    visionHint: "PAN / Aadhaar of Employee",
    fields: [
      { id: "employer", label: "Employer Name", placeholder: "e.g. GlobalTech India Pvt Ltd" },
      { id: "employee", label: "Employee Name", placeholder: "e.g. Meera Nair" },
      { id: "trainingCost", label: "Training Cost (₹)", placeholder: "150000", type: "number" },
      { id: "minService", label: "Min. Service Period (months)", placeholder: "18", type: "number" },
      { id: "penalty", label: "Breach Penalty (₹)", placeholder: "150000", type: "number" },
      { id: "jurisdiction", label: "Jurisdiction", placeholder: "e.g. Hyderabad Courts" },
    ],
    mockDraft: `TRAINING INDEMNITY BOND

This Bond is made between:
  Employer : GlobalTech India Pvt Ltd, Hyderabad.
  Employee : Ms. Meera Nair.

WHEREAS the Employer has sponsored training costing ₹1,50,000.

TERMS:
  1. Minimum Service : 18 months post-training.
  2. Breach Penalty  : ₹1,50,000 (pro-rated recovery).
  3. Jurisdiction    : Hyderabad Courts.

Employee Signature : ___________
Employer Signature : ___________
Witness 1          : ___________`,
    mockCritic: `[DYNAMIC LEGAL AUDITOR] Audit Matrix: TRAINING INDEMNITY BOND (TIB)
[TIB-01] Employer Identity ........ ✓ PRESENT (GlobalTech India)
[TIB-02] Employee Identity ........ ✓ PRESENT (Meera Nair)
[TIB-03] Training Cost ............ ✓ PRESENT (₹1,50,000)
[TIB-04] Min. Service Period ...... ✓ PRESENT (18 months)
[TIB-05] Breach Penalty ........... ✓ PRESENT (₹1,50,000)
[TIB-06] Jurisdiction ............. ✓ PRESENT (Hyderabad)
[TIB-07] Witness Signatures ....... ⚠ ADVISORY
[STATUS] ✅ APPROVED — All mandatory clauses present.`,
    xaiMarathi: "हे प्रशिक्षण नुकसान भरपाई बंधपत्र आहे. ₹१,५०,००० प्रशिक्षण खर्च असून किमान १८ महिने सेवा आवश्यक आहे. लवकर निघाल्यास पूर्ण रक्कम परत द्यावी लागेल.",
    xaiHindi: "यह प्रशिक्षण क्षतिपूर्ति बंध-पत्र है। ₹१,५०,००० के प्रशिक्षण पर कम से कम १८ महीने काम करना जरूरी है। जल्दी छोड़ने पर पूरी राशि वापस देनी होगी।",
  },
  custom: {
    label: "Custom / Blank Bond",
    accentClass: "bg-pink-600 hover:bg-pink-700",
    textClass: "text-pink-600",
    borderClass: "border-pink-200",
    visionHint: "Aadhaar / PAN of relevant parties",
    fields: [], // Replaced by textarea
    mockDraft: `CUSTOM BOND / AGREEMENT

Based on your prompt, the Drafter Agent has generated
the following bespoke legal instrument:

PARTIES:
  Party A: [As described in prompt]
  Party B: [As described in prompt]

RECITALS:
  WHEREAS Party A and Party B agree to the following
  terms as described in the submitted brief:

OPERATIVE CLAUSES:
  1. [Custom clause 1 as per prompt]
  2. [Custom clause 2 as per prompt]
  3. Governing Law: Laws of India.
  4. Jurisdiction: As specified in prompt.

IN WITNESS WHEREOF, the parties sign below.

Party A Signature: ___________
Party B Signature: ___________`,
    mockCritic: `[CUSTOM BOND VALIDATOR] Analyzing prompt under Indian Contract Act 1872...

[CB-01] Lawful Object ............. ✓ VALID — Purpose is lawful (ICA §23)
[CB-02] Lawful Consideration ....... ✓ VALID — Consideration present (ICA §25)
[CB-03] Competent Parties .......... ✓ VALID — Parties appear ≥18 yrs (ICA §11)
[CB-04] Free Consent ............... ✓ VALID — No coercion indicated (ICA §14)
[CB-05] Not Wagering Agreement ..... ✓ VALID — No wagering element (ICA §30)
[CB-06] Restraint of Trade ......... ✓ VALID — Within reasonable limits (ICA §27)
[CB-07] Legal Proceedings Access ... ✓ VALID — Courts not barred (ICA §28)
[CB-08] Possible Object ............ ✓ VALID — Physically & legally possible (ICA §56)

[STATUS] ✅ APPROVED — Custom bond prompt is legally valid under ICA 1872.
         Proceeding to draft bespoke instrument.`,
    xaiMarathi: "हा सानुकूल बंधपत्र भारतीय करार कायदा १८७२ नुसार कायदेशीर आहे. दोन्ही पक्षांनी त्यांचे दायित्व स्वेच्छेने स्वीकारले आहे.",
    xaiHindi: "यह कस्टम बंध-पत्र भारतीय संविदा अधिनियम १८७२ के तहत वैध है। दोनों पक्षों ने अपनी जिम्मेदारियां स्वेच्छा से स्वीकार की हैं।",
  },
};

// ─── Inner Component (uses useSearchParams) ───────────────────────────────────

function GeneratorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as DocType) || "rent";

  const [user, setUser] = useState<{ name: string } | null>(null);
  const [docType, setDocType] = useState<DocType>(initialType);
  const [ingestionMode, setIngestionMode] = useState<"vision" | "manual">("vision");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState<"idle" | "drafting" | "critic" | "complete">("idle");
  const [draftText, setDraftText] = useState("");
  const [criticLog, setCriticLog] = useState("");
  const [showXAI, setShowXAI] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("lexi_user");
    if (stored) { try { setUser(JSON.parse(stored)); } catch { /* ignore */ } }
  }, []);

  const config = DOC_CONFIGS[docType];

  const handleDocChange = (t: DocType) => {
    setDocType(t);
    setGenStep("idle");
    setDraftText("");
    setCriticLog("");
    setShowXAI(false);
    setCustomPrompt("");
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenStep("drafting");
    setDraftText("");
    setCriticLog("");
    setShowXAI(false);

    const { mockDraft, mockCritic } = config;
    let di = 0;
    const dInt = setInterval(() => {
      di += 6;
      setDraftText(mockDraft.slice(0, di));
      if (di >= mockDraft.length) {
        clearInterval(dInt);
        setGenStep("critic");
        let ci = 0;
        const cInt = setInterval(() => {
          ci += 5;
          setCriticLog(mockCritic.slice(0, ci));
          if (ci >= mockCritic.length) {
            clearInterval(cInt);
            setGenStep("complete");
            setIsGenerating(false);
          }
        }, 22);
      }
    }, 16);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 shrink-0">
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-sm">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-white hidden sm:block">LexiDraft AI</span>
          </button>
          <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase hidden md:block">Generator · Iteration II</p>
          <div className="flex items-center gap-1 sm:gap-2">
            {user && (
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="text-xs">
                <LayoutDashboard className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => router.push("/notary")} className="text-xs">
              <Stamp className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Notary</span>
            </Button>
            {user && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-slate-500 hidden sm:block max-w-[80px] truncate">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8">

        {/* ══════════════════════════════
            LEFT — Configurator Panel
        ══════════════════════════════ */}
        <section className="space-y-4">
          {/* Document Type Selector */}
          <div>
            <Label htmlFor="docType" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
              Document Type
            </Label>
            <div className="relative">
              <select
                id="docType"
                value={docType}
                onChange={(e) => handleDocChange(e.target.value as DocType)}
                className={`w-full appearance-none rounded-xl border-2 bg-white dark:bg-slate-900 px-4 py-3 pr-9 text-sm font-semibold shadow-sm cursor-pointer focus:outline-none transition-colors ${config.borderClass}`}
              >
                <option value="rent">Rent Agreement</option>
                <option value="affidavit">Name Change Affidavit</option>
                <option value="employment">Employment Bond</option>
                <option value="nda">Non-Disclosure Agreement (NDA)</option>
                <option value="training">Training Indemnity Bond</option>
                <option value="custom">✦ Custom / Blank Bond</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Data Ingestion Card */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 py-3 px-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-sm font-bold">Data Ingestion</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{config.label}</CardDescription>
                </div>
                {docType !== "custom" && (
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border shadow-sm text-xs font-semibold">
                    <span className={ingestionMode === "vision" ? config.textClass : "text-slate-400"}>Vision-AI</span>
                    <Switch
                      checked={ingestionMode === "manual"}
                      onCheckedChange={(c) => setIngestionMode(c ? "manual" : "vision")}
                    />
                    <span className={ingestionMode === "manual" ? config.textClass : "text-slate-400"}>Manual</span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
              {/* Custom Bond — Free-form textarea */}
              {docType === "custom" ? (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label htmlFor="customPrompt" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Describe your Bond Requirements
                  </Label>
                  <Textarea
                    id="customPrompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={`Describe exactly what you need — parties involved, obligations, clauses, penalties, and any special terms.\n\nExample: "I need a bond between Party A (lender) and Party B (borrower) for ₹5 lakhs at 12% interest, with a repayment period of 2 years and Mumbai jurisdiction."`}
                    className="resize-none h-44 text-sm leading-relaxed"
                  />
                  <div className="flex items-start gap-2 mt-2 p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-100 dark:border-pink-900/30">
                    <span className="text-pink-500 text-base leading-none shrink-0 mt-0.5">⚖</span>
                    <p className="text-xs text-pink-700 dark:text-pink-300 leading-relaxed">
                      The Legal Auditor will validate your prompt against the <strong>Indian Contract Act, 1872</strong> before drafting. Void/illegal terms will be flagged.
                    </p>
                  </div>
                </div>
              ) : ingestionMode === "vision" ? (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 sm:p-10 flex flex-col items-center text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className={`w-6 h-6 ${config.textClass}`} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Upload Identity Documents</h3>
                  <p className="text-xs text-slate-500 mb-4 max-w-xs">{config.visionHint}</p>
                  <Button variant="secondary" size="sm" className="text-xs">Browse Files</Button>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {config.fields.filter(f => !f.multiline).map((f) => (
                      <div key={f.id} className="space-y-1.5">
                        <Label htmlFor={f.id} className="text-xs font-medium">{f.label}</Label>
                        <Input id={f.id} type={f.type || "text"} placeholder={f.placeholder} className="text-sm h-9" />
                      </div>
                    ))}
                  </div>
                  {config.fields.filter(f => f.multiline).map((f) => (
                    <div key={f.id} className="space-y-1.5">
                      <Label htmlFor={f.id} className="text-xs font-medium">{f.label}</Label>
                      <Textarea id={f.id} placeholder={f.placeholder} className="resize-none h-20 text-sm" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="bg-slate-50/50 dark:bg-slate-900/40 border-t p-3 sm:p-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (docType === "custom" && !customPrompt.trim())}
                className={`w-full text-white shadow-lg dark:shadow-none disabled:opacity-50 ${config.accentClass}`}
              >
                {isGenerating ? (
                  <><Cpu className="w-4 h-4 mr-2 animate-spin" />Processing via Multi-Agent...</>
                ) : (
                  <><Bot className="w-4 h-4 mr-2" />Generate &amp; Audit Draft</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </section>

        {/* ══════════════════════════════
            RIGHT — AI Workspace Panel
        ══════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Cpu className={`w-4 h-4 ${config.textClass}`} />
                Multi-Agent Workspace
                {isGenerating && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />LIVE
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Drafter Agent → Legal Auditor Agent</p>
            </div>
          </div>

          {/* Drafter */}
          <Card className="shadow-md border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className={`absolute-0 w-1 h-full ${config.accentClass.split(" ")[0]} hidden`} />
            <CardHeader className="py-2.5 px-4 bg-slate-50 dark:bg-slate-800/80 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className={`w-4 h-4 ${config.textClass}`} />
                <span className="font-semibold text-sm">Drafter Agent</span>
              </div>
              {genStep === "drafting" && <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />WRITING</span>}
              {(genStep === "critic" || genStep === "complete") && <span className="text-[10px] text-slate-400 font-medium">DONE</span>}
            </CardHeader>
            <CardContent className="p-4 bg-white dark:bg-slate-950 font-mono text-[11px] sm:text-xs leading-relaxed h-52 overflow-y-auto whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {draftText || <span className="text-slate-300 dark:text-slate-600 italic">Awaiting input...</span>}
              {genStep === "drafting" && <span className="inline-block w-[3px] h-3.5 ml-0.5 bg-indigo-500 animate-pulse align-middle" />}
            </CardContent>
          </Card>

          {/* Legal Auditor */}
          <Card className="shadow-md overflow-hidden bg-slate-900 border-slate-800">
            <CardHeader className="py-2.5 px-4 bg-slate-950 border-b border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-green-400" />
                <span className="font-semibold text-sm text-slate-200">Legal Auditor Agent</span>
              </div>
              {genStep === "critic" && <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />AUDITING</span>}
              {genStep === "complete" && <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold"><CheckCircle2 className="w-3 h-3" />APPROVED</span>}
            </CardHeader>
            <CardContent className="p-4 font-mono text-[10px] sm:text-[11px] leading-relaxed h-40 overflow-y-auto whitespace-pre-wrap text-green-400">
              {criticLog || <span className="text-slate-600 italic">Awaiting draft...</span>}
              {genStep === "critic" && <span className="inline-block w-[3px] h-3 ml-0.5 bg-green-400 animate-pulse align-middle" />}
            </CardContent>
          </Card>

          {/* XAI */}
          {genStep === "complete" && (
            <Card className={`border shadow-sm bg-white dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-4 duration-500 ${config.borderClass}`}>
              <CardHeader className="py-3 px-4 border-b">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Globe2 className={`w-4 h-4 ${config.textClass}`} />
                    <CardTitle className="text-sm font-bold">Explainable AI (XAI)</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    Regional Summary
                    <Switch checked={showXAI} onCheckedChange={setShowXAI} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-3">
                {showXAI ? (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">🇮🇳 मराठी</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{config.xaiMarathi}</p>
                    </div>
                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">🇮🇳 हिंदी</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{config.xaiHindi}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Toggle to view plain-language obligations in Marathi & Hindi.</p>
                )}
              </CardContent>
            </Card>
          )}

          {genStep === "complete" && (
            <Button
              onClick={() => router.push("/notary")}
              variant="outline"
              className="w-full text-xs border-2 animate-in fade-in duration-700"
            >
              <Stamp className="w-3.5 h-3.5 mr-2" />Send to Notary Queue →
            </Button>
          )}
        </section>
      </main>
    </div>
  );
}

// ─── Export with Suspense (required for useSearchParams) ──────────────────────

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading generator...</div>}>
      <GeneratorInner />
    </Suspense>
  );
}
