'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  ShieldCheck, 
  Stamp,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function DocumentViewerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Mock data matching the dashboard
  const getDocumentType = (id: string) => {
    if (id.includes('001A')) return 'RENT AGREEMENT';
    if (id.includes('042B')) return 'AFFIDAVIT';
    if (id.includes('089C')) return 'INDEMNITY BOND';
    return 'LEGAL BOND';
  };

  const docType = getDocumentType(id);

  return (
    <div className="min-h-screen bg-slate-800 font-sans pb-20">
      
      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-xl">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-bold text-xs border border-slate-700">
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all font-bold text-xs shadow-lg shadow-blue-500/20">
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto mt-12 px-4">
        
        {/* The Bond Paper */}
        <div className="relative bg-white mx-auto shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] min-h-[1400px] w-full p-2 overflow-hidden">
          
          {/* Ornate Inner Border (CSS Only) */}
          <div className="absolute inset-4 border-[3px] border-emerald-900 pointer-events-none">
            <div className="absolute inset-1 border-[1px] border-emerald-800 opacity-40"></div>
          </div>

          {/* Document Content */}
          <div className="relative h-full flex flex-col pt-8">
            
            {/* e-Stamp Header (Top 25%) */}
            <div className="relative w-full px-12 pb-12">
              <div className="absolute inset-x-8 top-0 h-80 bg-emerald-50/50 -z-10 rounded-b-3xl"></div>
              
              <div className="text-center pt-8 space-y-2">
                <h2 className="font-serif text-3xl font-bold text-emerald-900 tracking-[0.4em] uppercase">
                  India Non Judicial
                </h2>
                <h3 className="font-serif text-lg text-emerald-800 font-medium">
                  Government of Maharashtra
                </h3>
                <div className="flex items-center justify-center py-4">
                  <div className="h-0.5 w-20 bg-emerald-200"></div>
                  <h1 className="mx-6 text-5xl font-serif font-black text-emerald-900 tracking-tighter">e-Stamp</h1>
                  <div className="h-0.5 w-20 bg-emerald-200"></div>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="mt-8 flex justify-between items-start text-[10px] font-mono text-emerald-900/70 border-y border-emerald-100 py-4">
                <div className="space-y-1">
                  <p>CERTIFICATE NO: <span className="font-bold text-emerald-900">IN-MH837492047LY</span></p>
                  <p>CERTIFICATE ISSUED DATE: <span className="font-bold text-emerald-900">{new Date().toLocaleDateString()}</span></p>
                  <p>ACCOUNT REFERENCE: <span className="font-bold text-emerald-900">NONACC (SV)/ mh0923/ NASHIK/ MH-NA</span></p>
                </div>
                <div className="text-right space-y-1">
                  <p>UNIQUE DOC. REFERENCE: <span className="font-bold text-emerald-900">SUBIN-MHMH0239482L</span></p>
                  <p>PURCHASED BY: <span className="font-bold text-emerald-900">LEXI-DRAFT USER</span></p>
                  <p>STAMP DUTY AMOUNT: <span className="font-bold text-emerald-900">₹ 100</span></p>
                </div>
              </div>

              {/* CSS Seal Placeholder */}
              <div className="absolute top-48 right-16 w-32 h-32 flex items-center justify-center opacity-10">
                <div className="w-full h-full border-4 border-dashed border-emerald-900 rounded-full flex items-center justify-center">
                  <Stamp className="w-12 h-12 text-emerald-900" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[8px] font-black text-emerald-900 text-center uppercase tracking-tighter transform -rotate-12">Verified by<br/>Lexi-Draft</span>
                </div>
              </div>
            </div>

            {/* Document Body (Bottom 75%) */}
            <div className="flex-1 px-16 py-12 font-serif text-slate-900 text-lg leading-[1.8]">
              <h2 className="text-2xl font-black text-center mb-12 underline decoration-double underline-offset-8 decoration-slate-300">
                {docType}
              </h2>

              <div className="space-y-8">
                <p>
                  THIS {docType === 'RENT AGREEMENT' ? 'AGREEMENT' : 'DOCUMENT'} is executed on this <span className="font-bold">{new Date().toLocaleDateString()}</span> for the document reference <span className="font-bold text-blue-800">{id}</span>.
                </p>

                <p>
                  WHEREAS, the parties involved have mutually agreed to the terms and conditions outlined in this legally binding draft generated via the Lexi-Draft Artificial Intelligence protocol.
                </p>

                <p>
                  1. <span className="font-bold">Validity:</span> This document is valid for the period specified in the digital metadata and is stored securely on the Lexi-Draft blockchain ledger.
                </p>

                <p>
                  2. <span className="font-bold">Authentication:</span> Both parties acknowledge that the identity verification was performed via Sovereign ID protocols (Aadhaar/DigiLocker) ensuring non-repudiation of this instrument.
                </p>

                <p>
                  3. <span className="font-bold">Record Keeping:</span> A permanent record of this {docType.toLowerCase()} is maintained under the unique identifier <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-sm">{id}</span>.
                </p>

                <div className="pt-20 space-y-4">
                  <p className="italic text-slate-500 text-base">
                    The contents of this document have been verified to be true to the best of the knowledge of the undersigned parties.
                  </p>
                </div>

                {/* Signature Blocks */}
                <div className="pt-24 grid grid-cols-2 gap-20">
                  <div className="space-y-4">
                    <div className="h-px bg-slate-300 w-full mb-2"></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">First Party Signature</p>
                    <div className="flex items-center justify-center pt-2">
                       <div className="px-3 py-1 bg-green-50 border border-green-200 rounded text-[10px] text-green-700 font-black flex items-center">
                         <ShieldCheck className="w-3 h-3 mr-1" />
                         E-SIGNED VIA AADHAAR
                       </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-px bg-slate-300 w-full mb-2"></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Second Party Signature</p>
                    <div className="flex items-center justify-center pt-2">
                       <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-400 font-bold flex items-center">
                         <Clock className="w-3 h-3 mr-1" />
                         PENDING SIGNATURE
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Watermark */}
            <div className="py-8 flex items-center justify-center space-x-2 text-slate-200 select-none">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-black tracking-[0.5em] uppercase">Document Authenticated by Lexi-Draft AI</span>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}
