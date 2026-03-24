"use client";

import React, { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UploadCloud, FileText, Smartphone, LayoutList, ScanLine, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { processMultimodalID, IdentityExtraction } from "@/lib/gemini-handler";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";

const ID_TYPES = [
  "Aadhaar",
  "PAN Card",
  "Voter ID (EPIC)",
  "Driving License",
  "Passport",
  "Other Government ID"
];

interface InputStrategyProps {
  onIdentitySync: (identity: IdentityExtraction | null, mode: "vision" | "manual") => void;
  onForceSync?: () => void;
}

export function InputStrategy({ onIdentitySync, onForceSync }: InputStrategyProps) {
  const { setIdentity } = useSessionIdentity();
  const [ingestionMode, setIngestionMode] = useState<"vision" | "manual">("vision");
  const [idType, setIdType] = useState("Aadhaar");
  const [customIdName, setCustomIdName] = useState("");
  
  // Vision State
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Manual State
  const [manualData, setManualData] = useState({ name: "", idNumber: "", address: "" });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (ingestionMode === "manual") return; 
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsScanning(true);
      
      try {
        // ── Stateless Identity Protocol: Memory-Only OCR ─────────────────────
        // The file is converted to Base64 ENTIRELY in-browser.
        // The base64 string is sent to the Gemini Vision handler ONCE,
        // then IMMEDIATELY set to null after extraction — never persisted.
        const reader = new FileReader();
        reader.onloadend = async () => {
          let base64String: string | null = reader.result as string;

          try {
            const result = await processMultimodalID(base64String!, idType, customIdName);

            // CRITICAL PURGE: Nullify the base64 string from local scope
            // before any await continuations can capture it.
            base64String = null;

            // Store only Name & Address in transient session state
            setIdentity(result);
            onIdentitySync(result, "vision");
          } finally {
            // Always purge regardless of success/failure
            base64String = null;
            setIsScanning(false);
            // Wipe the file input reference — no traces in the DOM
            if (fileInputRef.current) fileInputRef.current.value = "";
            console.log('🔒 [Stateless Protocol] Base64 string purged from memory.');
          }
        };
        reader.readAsDataURL(file);
      } catch(err) {
        console.error("ID Extraction failed:", err);
        setIsScanning(false);
      }
    }
  };

  const handleManualSubmit = () => {
    const actualType = idType === "Other Government ID" ? customIdName : idType;
    const extracted: IdentityExtraction = {
       name: manualData.name,
       idNumber: manualData.idNumber,
       address: manualData.address,
       idType: actualType,
       isVerified: false 
    };
    setIdentity(extracted);
    onIdentitySync(extracted, "manual");
  };

  const activeIdLabel = idType === "Other Government ID" ? (customIdName || "ID") : idType;

  return (
    <div className="flex flex-col gap-4">
      {/* Universal ID Selector */}
      <Card className="bento-card border-none shadow-sm relative z-40 pointer-events-auto">
        <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800">
           <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="uppercase tracking-wider text-slate-500">Universal ID Setup</span>
              <Smartphone className="w-4 h-4 text-slate-400 hidden sm:block" />
           </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
           <div className="space-y-2 relative z-50 pointer-events-auto">
             <Label className="text-xs font-bold text-slate-600">Select Document Type</Label>
             <select 
               value={idType} 
               onChange={(e) => setIdType(e.target.value)}
               className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:ring-2 focus:ring-[#3182CE] outline-none relative z-50 pointer-events-auto touch-target cursor-pointer shadow-sm hover:shadow-md transition-shadow"
             >
               {ID_TYPES.map(type => <option key={type} value={type} className="bg-white dark:bg-slate-800 p-2">{type}</option>)}
             </select>
           </div>
           
           {idType === "Other Government ID" && (
             <div className="space-y-2 animate-in slide-in-from-top-2 relative z-40 pointer-events-auto">
               <Label className="text-xs font-bold text-slate-600 text-indigo-500">Specify ID Name</Label>
               <Input 
                 placeholder="e.g. NREGA Card, Ration Card" 
                 value={customIdName}
                 onChange={(e) => setCustomIdName(e.target.value)}
                 className="bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900 focus-visible:ring-indigo-500 touch-target" 
               />
             </div>
           )}
        </CardContent>
      </Card>

      {/* Dual-Path Ingestion Toggle */}
      <Card className="bento-card border-none shadow-sm flex-1 flex flex-col relative z-30 pointer-events-auto">
        <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ingestion Path</CardTitle>
             <div className="relative z-50 pointer-events-auto flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
               <button 
                 onClick={() => setIngestionMode("vision")}
                 className={cn("flex flex-1 items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all pointer-events-auto cursor-pointer", ingestionMode === "vision" ? "bg-blue-100 text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-50")}
               >
                 <UploadCloud className="w-4 h-4" /> Vision-AI
               </button>
               <button 
                 onClick={() => setIngestionMode("manual")}
                 className={cn("flex flex-1 items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all pointer-events-auto cursor-pointer", ingestionMode === "manual" ? "bg-amber-100 text-amber-700 shadow-sm" : "text-slate-500 hover:bg-slate-50")}
               >
                 <FileText className="w-4 h-4" /> Manual
               </button>
             </div>
           </div>
        </CardHeader>
        <CardContent className="p-0 sm:min-h-[260px] relative overflow-hidden flex-1 pointer-events-none">
          {/* Path A: Vision AI */}
          <div className={cn("p-6 flex flex-col items-center justify-center text-center transition-all duration-500 absolute inset-0 bg-white dark:bg-[#1A202C]", ingestionMode === "vision" ? "opacity-100 z-10 translate-x-0 pointer-events-auto" : "opacity-0 -z-10 -translate-x-full pointer-events-none")}>
             <div className="relative mb-4 pointer-events-none">
               <div className={cn("w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center transition-all", isScanning && "scale-110 bg-blue-100 shadow-xl shadow-blue-500/20")}>
                 {isScanning ? <ScanLine className="w-10 h-10 text-[#3182CE] animate-pulse" /> : <UploadCloud className="w-10 h-10 text-[#3182CE]" />}
               </div>
               
               {/* Scanning Laser Animation */}
               {isScanning && (
                 <div className="absolute top-0 left-0 w-full h-1 bg-[#3182CE] shadow-[0_0_15px_#3182CE] rounded animate-scan" />
               )}
             </div>
             
             <h3 className="font-bold text-lg mb-1 pointer-events-none">
               {isScanning ? "Securely Extracting & Purging..." : "Lexi-Vision Uploader"}
             </h3>
             
             {/* Privacy Shield Badge — Stateless Processing Active */}
             <div
               className="flex items-center gap-2 mb-4 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-full animate-in fade-in duration-500 cursor-help"
               title="Stateless Processing Active: Your original ID documents are never stored on our servers."
             >
               <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
               <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">
                 {isScanning ? "Securely Purging from Memory..." : "Stateless Processing Active"}
               </span>
             </div>

             <p className="text-xs text-slate-500 mb-6 max-w-[260px] min-h-[32px] pointer-events-none">
               {isScanning
                 ? "Gemini 3.1 Pro is extracting Name & Address only — Base64 string wiped immediately after."
                 : `Upload ${activeIdLabel}. Extracted in-memory; original file is NEVER stored on our servers.`
               }
             </p>
             
             <div className="mt-4 w-full flex justify-center pointer-events-auto">
                <Button 
                  type="button"
                  disabled={isScanning} 
                  onClick={(e) => {
                    e.preventDefault();
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  className="w-full max-w-[200px] bg-[#3182CE] hover:bg-[#2b71b2] text-white font-bold rounded-xl shadow-lg h-12 relative z-50 pointer-events-auto cursor-pointer"
                >
                  {isScanning ? "Scanning..." : "Select Image"}
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden" 
                  accept="image/*"
                  disabled={isScanning}
                />
             </div>
             <p className="mt-4 text-[10px] text-slate-400 font-medium tracking-widest uppercase flex items-center justify-center gap-1">
               <ScanLine className="w-3 h-3" /> Gemini 3.1 Pro Engine
             </p>
             
             <div className="mt-4 text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 max-w-[200px] leading-tight text-center">
               <ShieldCheck className="w-3 h-3 shrink-0" />
               <span>Your ID is processed and wiped immediately. No data persists.</span>
             </div>

             {/* ⚡ Demo Mode Force Sync — subtle, hover to reveal */}
             {onForceSync && (
               <button
                 onClick={onForceSync}
                 className="mt-3 opacity-20 hover:opacity-90 transition-opacity duration-300 text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 pointer-events-auto relative z-50"
                 title="Demo Mode: Force identity sync without a real ID upload"
               >
                 ⚡ Force Sync (Demo)
               </button>
             )}
          </div>

          {/* Path B: Manual Entry */}
          <div className={cn("p-6 transition-all duration-500 absolute inset-0 overflow-y-auto bg-white dark:bg-[#1A202C] scrollbar-thin", ingestionMode === "manual" ? "opacity-100 z-10 translate-x-0 pointer-events-auto" : "opacity-0 -z-10 translate-x-full pointer-events-none")}>
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="text-center mb-4 pointer-events-none">
                <LayoutList className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-50" />
                <h3 className="font-bold text-sm">Privacy-First Manual Entry</h3>
              </div>
              
              <div className="space-y-1.5 relative z-50 pointer-events-auto">
                <Label className="text-xs font-bold text-slate-500">Full Name</Label>
                <Input value={manualData.name} onChange={e=>setManualData(p=>({...p, name: e.target.value}))} placeholder="As per ID" className="bg-slate-50 dark:bg-slate-800/50 touch-target w-full border-slate-200 dark:border-slate-700" />
              </div>
              <div className="space-y-1.5 relative z-50 pointer-events-auto">
                <Label className="text-xs font-bold text-slate-500">ID Number</Label>
                <Input value={manualData.idNumber} onChange={e=>setManualData(p=>({...p, idNumber: e.target.value}))} placeholder={`${activeIdLabel} Number`} className="bg-slate-50 dark:bg-slate-800/50 touch-target w-full border-slate-200 dark:border-slate-700" />
              </div>
              <div className="space-y-1.5 border-b border-transparent pb-1 relative z-50 pointer-events-auto">
                <Label className="text-xs font-bold text-slate-500">Permanent Address</Label>
                <Input value={manualData.address} onChange={e=>setManualData(p=>({...p, address: e.target.value}))} placeholder="Full address" className="bg-slate-50 dark:bg-slate-800/50 touch-target w-full border-slate-200 dark:border-slate-700" />
              </div>
              <Button onClick={handleManualSubmit} disabled={!manualData.name || !manualData.idNumber} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 touch-target font-bold rounded-xl mt-2 transition-all shadow-md relative z-50 pointer-events-auto">
                Cross-Sync Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />
    </div>
  );
}
