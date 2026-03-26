'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  LayoutGrid,
  History,
  AlertCircle,
  X,
  ExternalLink,
  Download as DownloadIcon,
  Share2,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

interface Document {
  id: string;
  type: string;
  parties: string;
  status: 'PENDING NOTARY' | 'VERIFIED DRAFT';
  date: string;
  summary?: string;
}

const mockDocuments: Document[] = [
  {
    id: 'LEXI-2026-001A',
    type: 'Rent Agreement',
    parties: 'Rajesh Kumar & Priya Sharma',
    status: 'VERIFIED DRAFT',
    date: '2026-03-26',
    summary: 'The agreement covers the residential lease of Flat 402, Shivshakti Apartments, Nashik, for a period of 11 months.'
  },
  {
    id: 'LEXI-2026-042B',
    type: 'Affidavit',
    parties: 'John Doe',
    status: 'PENDING NOTARY',
    date: '2026-03-25',
    summary: 'Self-declaration for address proof correction submitted to the Municipal Corporation.'
  },
  {
    id: 'LEXI-2026-089C',
    type: 'Indemnity Bond',
    parties: 'Amit Shah & HDFC Bank',
    status: 'VERIFIED DRAFT',
    date: '2026-03-24',
    summary: 'Indemnity bond for the release of duplicate fixed deposit receipts worth ₹5,00,000.'
  },
];

const DocumentCard = ({ doc, onClick }: { doc: Document; onClick: () => void }) => {
  const isVerified = doc.status === 'VERIFIED DRAFT';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 uppercase tracking-wider">
            {doc.id}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-1">{doc.type}</h3>
        <p className="text-sm text-slate-500 line-clamp-1">{doc.parties}</p>
        
        <div className="mt-6 flex items-center justify-between">
          <div className={`flex items-center space-x-1.5 text-xs font-bold leading-none ${isVerified ? 'text-green-600' : 'text-amber-600'}`}>
            {isVerified ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            <span className="uppercase tracking-wide">{doc.status}</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {doc.date}
          </span>
        </div>
      </div>
      
      <button 
        onClick={onClick}
        className="w-full py-4 bg-slate-900 hover:bg-black text-white text-sm font-bold flex items-center justify-center space-x-2 transition-colors"
      >
        <span>View Document & Status</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const DocumentModal = ({ doc, onClose }: { doc: Document; onClose: () => void }) => {
  const router = useRouter();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  const handleOpenViewer = () => {
    router.push(`/document/${doc.id}`);
  };

  const handleDownload = () => {
    const content = `
LEXI-DRAFT DOCUMENT SUMMARY
===========================
Document ID: ${doc.id}
Type: ${doc.type}
Date Created: ${doc.date}
Parties Involved: ${doc.parties}
Status: ${doc.status}

AI INTELLIGENCE SUMMARY:
${doc.summary || 'No summary available.'}

---------------------------
Generated via Lexi-Draft Citizen Portal
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Lexi-Draft: ${doc.type}`,
      text: `Check out this ${doc.type} for ${doc.parties}. ID: ${doc.id}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const isVerified = doc.status === 'VERIFIED DRAFT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-600 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{doc.type}</h2>
              <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">{doc.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto flex-1">
          {/* Status Badge */}
          <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-8 ${
            isVerified ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
          }`}>
            {isVerified ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            <span>Status: {doc.status}</span>
          </div>

          <div className="space-y-8">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-3">Parties Involved</h4>
              <p className="text-lg font-bold text-slate-800">{doc.parties}</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-3">Date Created</h4>
                <p className="text-slate-800 font-bold">{doc.date}</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-3">Execution Method</h4>
                <p className="text-slate-800 font-bold">Aadhaar eSign / e-Stamp</p>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-3">AI Intelligence Summary</h4>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 italic text-slate-600 leading-relaxed">
                "{doc.summary}"
              </div>
            </div>

            {isVerified && (
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-start space-x-3">
                <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900 mb-1">Blockchain Verified</h4>
                  <p className="text-xs text-blue-700 leading-normal">
                    This document is cryptographically signed and stored on the immutable ledger. Any tampering will be detected instantly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleOpenViewer}
            className="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center space-x-2 group"
          >
            <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Open in Viewer</span>
          </button>
          <div className="flex gap-3">
            <button 
              onClick={handleDownload}
              className="p-3.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm" 
              title="Download Metadata (.txt)"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={handleShare}
              className="p-3.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm" 
              title="Share Document"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CitizenDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  
  const pendingCount = mockDocuments.filter(d => d.status === 'PENDING NOTARY').length;
  const verifiedCount = mockDocuments.filter(d => d.status === 'VERIFIED DRAFT').length;

  const filteredDocs = mockDocuments.filter(doc => 
    doc.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">My Legal Documents</h1>
              <p className="text-slate-500 mt-2 text-lg font-medium">Track the notary status of your generated bonds.</p>
            </div>
          </div>

          <div className="flex items-stretch space-x-4">
            {/* Pending Stat */}
            <div className="bg-white border-l-4 border-amber-400 rounded-xl shadow-sm px-6 py-4 flex flex-col justify-center min-w-[160px]">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Pending Notary</span>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-black text-slate-900 leading-none">{pendingCount}</span>
                <Clock className="w-5 h-5 text-amber-500 mb-0.5" />
              </div>
            </div>

            {/* Verified Stat */}
            <div className="bg-white border-l-4 border-green-500 rounded-xl shadow-sm px-6 py-4 flex flex-col justify-center min-w-[160px]">
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Verified / Ready</span>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-black text-slate-900 leading-none">{verifiedCount}</span>
                <CheckCircle2 className="w-5 h-5 text-green-500 mb-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Utility Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Document Type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:border-slate-300 outline-none transition-all text-sm font-medium"
            />
          </div>
          <button className="px-6 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold text-sm flex items-center justify-center hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            All Documents
          </button>
        </div>

        {/* Document Grid */}
        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <DocumentCard 
                key={doc.id} 
                doc={doc} 
                onClick={() => setSelectedDoc(doc)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-20 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-slate-50 rounded-full mb-4">
              <AlertCircle className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No documents found</h3>
            <p className="text-slate-500 max-w-xs mt-1 text-sm font-medium">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}

        {/* Support Section */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-slate-400 gap-4">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Last Updated: Just Now</span>
          </div>
          <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-wider">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <a href="#" className="hover:text-slate-600 transition-colors">Support Center</a>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>

      {/* Detail Modal */}
      {selectedDoc && (
        <DocumentModal 
          doc={selectedDoc} 
          onClose={() => setSelectedDoc(null)} 
        />
      )}
    </div>
  );
}
