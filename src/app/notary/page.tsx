"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, Printer, ShieldCheck, FileBadge, 
  Check, ScrollText, ChevronDown, ShieldAlert,
  Search, Clock, Filter, ArrowLeftRight, QrCode,
  Fingerprint, Stamp, FolderOpen, KeyRound, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getNotaryDrafts, NotaryDraft } from "@/lib/store";

// ─── Data ─────────────────────────────────────────────────────────────────────

type DocType = "rent" | "affidavit" | "employment" | "nda" | "training" | "custom" | string;

const TYPE_CFG: Record<DocType, { color: string; bg: string }> = {
  rent:       { color: "#3182CE", bg: "bg-blue-50 dark:bg-blue-900/10" },
  nda:        { color: "#9F7AEA", bg: "bg-purple-50 dark:bg-purple-900/10" },
  employment: { color: "#ED8936", bg: "bg-orange-50 dark:bg-orange-900/10" },
  affidavit:  { color: "#667EEA", bg: "bg-indigo-50 dark:bg-indigo-900/10" },
  training:   { color: "#F6AD55", bg: "bg-amber-50 dark:bg-amber-900/10" },
  custom:     { color: "#ED64A6", bg: "bg-pink-50 dark:bg-pink-900/10" },
};

// Fallback config for dynamically pushed types
const getCfg = (type: string) => TYPE_CFG[type] || { color: "#3182CE", bg: "bg-slate-50 dark:bg-slate-800" };

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotaryDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<NotaryDraft | null>(null);
  const [filter, setFilter] = useState<DocType | "all">("all");
  const [draftsList, setDraftsList] = useState<NotaryDraft[]>([]);

  // M1: Digital India Handshake state (per-dialog, resets on open)
  const [isSigned, setIsSigned]           = useState(false);
  const [eStamp, setEStamp]               = useState<string | null>(null);
  const [hasPrinted, setHasPrinted]       = useState(false);
  const [digiPushed, setDigiPushed]       = useState(false);
  const [showOtpSheet, setShowOtpSheet]   = useState(false);
  const [otp, setOtp]                     = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const resetDigitalHandshake = useCallback(() => {
    setIsSigned(false);
    setEStamp(null);
    setHasPrinted(false);
    setDigiPushed(false);
    setShowOtpSheet(false);
    setOtp("");
    setIsVerifyingOtp(false);
  }, []);

  const handleOtpVerify = async () => {
    setIsVerifyingOtp(true);
    await new Promise(r => setTimeout(r, 1400));
    setIsVerifyingOtp(false);
    setIsSigned(true);
    setShowOtpSheet(false);
    setOtp("");
  };

  const handleFetchEStamp = () => {
    const grn = `GRN-2026-NeSL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    setEStamp(grn);
  };

  const handleDigiLocker = () => {
    if (!hasPrinted) return;
    const ref = `DL-2026-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setDigiPushed(true);
    alert(`[MOCK DigiLocker] Document pushed!\nReference: ${ref}\n\nStored securely in your DigiLocker vault.`);
  };

  const handlePrint = () => {
    window.print();
    setHasPrinted(true);
  };

  const filtered = useMemo(
    () => (filter === "all" ? draftsList : draftsList.filter((d) => d.type.toLowerCase() === filter.toLowerCase())),
    [filter, draftsList]
  );

  useEffect(() => { 
    setMounted(true); 
    const stored = getNotaryDrafts();
    if (stored.length > 0) {
      setDraftsList(stored);
    } else {
      // Fallback if empty to ensure UI shows demo state
      setDraftsList([{
        id: "LEXI-2026-001A", type: "rent", label: "Rent Agreement",
        parties: "Rajesh Kumar & Priya Sharma", date: "2026-03-20",
        content: `RENT AGREEMENT\n\nLandlord: Mr. Rajesh Kumar, Park Avenue, Mumbai.\nTenant:   Ms. Priya Sharma, Pune.\n\nTERMS:\n  1. Rent          : ₹15,000/month\n  2. Notice Period : 30 days\n  3. Deposit       : ₹45,000\n  4. Jurisdiction  : Mumbai Courts\n\nLandlord Signature : ___________\nTenant Signature   : ___________`
      }]);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1A202C] text-slate-900 dark:text-slate-100 font-sans">
      <style>{`
        @media print {
          body > *:not(#print-target) { display: none !important; }
          #print-target { display: block !important; }
        }
        #print-target { display: none; }
      `}</style>

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#1A202C] border-b border-slate-200 dark:border-slate-800 z-50 px-4 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">Legal <span className="text-emerald-600">Portal</span></span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="touch-target border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs px-4 rounded-xl font-bold" onClick={() => router.push("/")}>
            <ShieldAlert className="w-4 h-4 mr-2" />
            Citizen View
          </Button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        
        {/* Page Title & Stats Bento Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
           <div className="md:col-span-8">
             <h1 className="text-3xl font-extrabold tracking-tight mb-2">Notary Handshake</h1>
             <p className="text-slate-500 dark:text-slate-400">Review, verify and finalize legal instruments for physical execution.</p>
           </div>
           {/* Stats Cards in Bento Grid */}
           <div className="md:col-span-4 grid grid-cols-2 gap-3">
             <Card className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-none bg-emerald-600 text-white p-4 flex flex-col justify-between overflow-hidden relative">
                <div className="relative z-10">
                   <p className="text-[10px] font-bold uppercase text-white/70">Verified</p>
                   <h3 className="text-2xl font-bold">{draftsList.length}</h3>
                </div>
                <CheckCircle2 className="absolute -bottom-2 -right-2 w-16 h-16 text-white/10" />
             </Card>
             <Card className="bento-card p-4 flex flex-col justify-between">
                <div>
                   <p className="text-[10px] font-bold uppercase text-slate-400">Pending</p>
                   <h3 className="text-2xl font-bold text-slate-500">0</h3>
                </div>
                <Clock className="w-5 h-5 text-slate-300" />
             </Card>
           </div>
        </div>

        {/* Filters Bento Row */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Parties..." 
              className="w-full bg-white dark:bg-slate-800 border-none shadow-sm rounded-2xl h-11 pl-10 text-sm focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as DocType | "all")}
              className="bg-white dark:bg-slate-800 border-none shadow-sm rounded-2xl h-11 px-6 text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer min-w-[160px]"
            >
              <option value="all">All Documents</option>
              <option value="rent">Rent Agreements</option>
              <option value="nda">NDAs</option>
              <option value="employment">Employment Bonds</option>
              <option value="affidavit">Affidavits</option>
              <option value="training">Training Bonds</option>
              <option value="custom">Custom Projects</option>
            </select>
          </div>
        </div>

        {/* Draft List - Bento Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((draft) => (
            <Card key={draft.id} className="bento-card border-none shadow-md overflow-hidden group">
               <div className="h-2 w-full" style={{ backgroundColor: getCfg(draft.type).color }} />
               <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                   <div className={cn("p-2 rounded-xl", getCfg(draft.type).bg)}>
                     <FileBadge className="w-5 h-5" style={{ color: getCfg(draft.type).color }} />
                   </div>
                   <span className="text-[10px] font-black tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500 uppercase border border-slate-200 dark:border-slate-700">
                     {draft.id}
                   </span>
                 </div>
                 
                 <h3 className="font-bold text-base mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">{draft.label}</h3>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 line-clamp-1">{draft.parties}</p>
                 
                 <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                   <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
                     <CheckCircle2 className="w-3 h-3" /> Verified Draft
                   </span>
                   <span className="text-[10px] font-bold text-slate-400">{draft.date}</span>
                 </div>

                 <Dialog onOpenChange={(open) => { if (open) resetDigitalHandshake(); }}>
                   <DialogTrigger
                    render={
                      <Button 
                        onClick={() => setSelected(draft)}
                        className="w-full mt-4 bg-slate-900 dark:bg-slate-800 hover:bg-emerald-700 dark:hover:bg-emerald-700 text-white touch-target rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95"
                      >
                        <ScrollText className="w-4 h-4 mr-2" /> Preview & Verify
                      </Button>
                    }
                   />
                   <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-0 border-none shadow-2xl overflow-hidden glass rounded-3xl">
                     <DialogHeader className="p-6 bg-white dark:bg-slate-900 border-b flex flex-row items-start justify-between">
                       <div>
                         <DialogTitle className="text-xl font-black">Phygital Print View</DialogTitle>
                         <p className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase mt-1">Audit Trace: {selected?.id}</p>
                       </div>
                       <Button 
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white touch-target rounded-xl px-6 font-bold"
                        onClick={() => window.print()}
                       >
                         <Printer className="w-5 h-5 mr-3" />
                         1-Click Print
                       </Button>
                     </DialogHeader>

                     <div className="p-4 sm:p-12 bg-[#f0f0f5] dark:bg-slate-900 overflow-y-auto">
                        <div 
                          id="print-target"
                          className="w-full max-w-[210mm] mx-auto bg-[#fffff8] shadow-2xl border border-slate-200 dark:border-slate-800 relative min-h-[800px] flex flex-col p-px selection:bg-yellow-200 selection:text-black"
                        >
                           {/* Official Stamp Paper Header */}
                           <div className="bg-emerald-900 text-white p-8 relative overflow-hidden">
                              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10" />
                              <div className="flex justify-between items-center relative z-10">
                                <div>
                                   <p className="text-[10px] tracking-[0.5em] font-black uppercase text-yellow-500 mb-1 leading-none">Government of India</p>
                                   <h2 className="font-serif font-black text-2xl tracking-wide">NON-JUDICIAL STAMP PAPER</h2>
                                   <p className="text-white/60 text-xs mt-1">e-Stamp · Certified by LexiDraft Multi-Agent Engine</p>
                                </div>
                                <div className="w-24 h-24 rounded-full border-4 border-yellow-500/30 bg-yellow-500/10 flex items-center justify-center backdrop-blur-sm">
                                   <div className="text-center">
                                      <span className="text-yellow-500 font-black text-2xl block leading-none">₹500</span>
                                      <span className="text-white/60 text-[8px] font-bold tracking-[0.2em] uppercase">STAMP</span>
                                   </div>
                                </div>
                              </div>
                           </div>

                           <div className="p-12 md:p-20 flex-1 relative">
                              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none rotate-12">
                                 <div className="text-[120px] font-black text-slate-900 border-[20px] border-slate-900 rounded-full px-20 py-10">VERIFIED</div>
                              </div>
                              <pre className="font-serif text-sm sm:text-base text-gray-800 leading-[2] whitespace-pre-wrap relative z-10 transition-all font-medium drop-shadow-sm">
                                {selected?.content}
                              </pre>
                           </div>

                           <div className="p-12 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-8">
                             <div className="grid grid-cols-2 gap-20">
                                <div>
                                  <div className="h-px w-full bg-slate-300 pointer-events-none mb-2" />
                                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Notary Signature & Seal</p>
                                </div>
                                <div>
                                  <div className="h-px w-full bg-slate-300 pointer-events-none mb-2" />
                                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Date & Location</p>
                                </div>
                             </div>
                             <div className="flex items-end justify-between mt-4">
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Vault Trace: {selected?.id} · Verified Compliance · India Non-Judicial</p>
                               <div className="flex flex-col items-center justify-center p-2 border-2 border-slate-200 dark:border-slate-800 rounded-lg">
                                 <QrCode className="w-16 h-16 text-slate-800 dark:text-slate-200" />
                                 <span className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Scan to Verify</span>
                               </div>
                             </div>
                           </div>
                        </div>
                     </div>
                   </DialogContent>
                 </Dialog>
               </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
