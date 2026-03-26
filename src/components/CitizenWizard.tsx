'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Upload, 
  Smartphone, 
  Lock, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Video,
  CheckCircle2,
  Building,
  FileSearch,
  Scale,
  ArrowLeft,
  Edit3
} from 'lucide-react';

type Step = 1 | 2 | 3;
type IdMethod = 'aadhaar' | 'digilocker' | null;
type BondType = 'Rent Agreement' | 'Affidavit' | 'Indemnity Bond' | 'Employment Bond' | 'Custom/Blank Bond';

interface FormData {
  landlordName: string;
  tenantName: string;
  propertyAddress: string;
  monthlyRent: string;
  securityDeposit: string;
  lockinPeriod: string;
  deponentName: string;
  affidavitPurpose: string;
  indemnifierName: string;
  indemnifiedName: string;
  employerName: string;
  employeeName: string;
  customContent: string;
}

export default function CitizenWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [idMethod, setIdMethod] = useState<IdMethod>(null);
  const [bondType, setBondType] = useState<BondType>('Rent Agreement');
  const [customRequirements, setCustomRequirements] = useState('');
  const [formData, setFormData] = useState<FormData>({
    landlordName: '',
    tenantName: '',
    propertyAddress: '',
    monthlyRent: '',
    securityDeposit: '',
    lockinPeriod: '',
    deponentName: '',
    affidavitPurpose: '',
    indemnifierName: '',
    indemnifiedName: '',
    employerName: '',
    employeeName: '',
    customContent: '',
  });
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualUser, setManualUser] = useState({
    fullName: '',
    dob: '',
    address: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleNextStep1 = () => {
    if (idMethod || (showManualEntry && manualUser.fullName)) {
      // Pre-fill some form data based on manual user details if applicable
      if (manualUser.fullName) {
        setFormData(prev => ({
          ...prev,
          landlordName: prev.landlordName || (bondType === 'Rent Agreement' ? manualUser.fullName : ''),
          deponentName: prev.deponentName || (bondType === 'Affidavit' ? manualUser.fullName : ''),
          indemnifierName: prev.indemnifierName || (bondType === 'Indemnity Bond' ? manualUser.fullName : ''),
          employeeName: prev.employeeName || (bondType === 'Employment Bond' ? manualUser.fullName : ''),
        }));
      }
      setCurrentStep(2);
    }
  };

  const handleGenerateDraft = () => {
    setIsGenerating(true);
    // Simulate AI thinking and building the document
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep(3);
    }, 2000);
  };

  const handleSendToNotary = () => {
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const renderFormFields = () => {
    switch (bondType) {
      case 'Rent Agreement':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Landlord Full Name</label>
              <input 
                type="text" 
                name="landlordName"
                value={formData.landlordName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                placeholder="e.g. Ramesh Kumar"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tenant Full Name</label>
              <input 
                type="text" 
                name="tenantName"
                value={formData.tenantName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                placeholder="e.g. Priya Sharma"
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-slate-700">Property Address</label>
              <textarea 
                name="propertyAddress"
                value={formData.propertyAddress}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white resize-none"
                placeholder="Enter complete address..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Monthly Rent (₹)</label>
              <input 
                type="number" 
                name="monthlyRent"
                value={formData.monthlyRent}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                placeholder="25000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Security Deposit (₹)</label>
              <input 
                type="number" 
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                placeholder="75000"
              />
            </div>
          </>
        );
      case 'Affidavit':
        return (
          <>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-slate-700">Deponent Name</label>
              <input 
                type="text" 
                name="deponentName"
                value={formData.deponentName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-slate-700">Purpose of Affidavit</label>
              <textarea 
                name="affidavitPurpose"
                value={formData.affidavitPurpose}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white resize-none"
                placeholder="e.g. For address proof correction..."
              />
            </div>
          </>
        );
      case 'Custom/Blank Bond':
        return (
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium text-slate-700">Core Agreement Details</label>
            <textarea 
              name="customContent"
              value={formData.customContent}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white resize-none"
              placeholder="Paste or type your agreement details here..."
            />
          </div>
        );
      default:
        return (
          <div className="lg:col-span-2 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
            <p className="text-slate-500 text-sm italic">Standard fields for {bondType} are being loaded...</p>
          </div>
        );
    }
  };

  const PaperPreview = () => {
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    
    return (
      <div className="sticky top-8 bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-slate-200 min-h-[500px] flex flex-col font-serif text-slate-800 leading-relaxed overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-100 to-transparent"></div>
        
        <div className="text-center mb-6 border-b border-slate-300 pb-4">
          <h3 className="text-lg font-bold uppercase tracking-widest">{bondType}</h3>
          <p className="text-[10px] text-slate-400 font-sans uppercase">Live Preview Mode</p>
        </div>

        <div className="flex-1 text-[11px] md:text-xs">
          {bondType === 'Rent Agreement' ? (
            <div className="space-y-3">
              <p>This Rent Agreement is entered into on <strong>{today}</strong>.</p>
              <p>
                <strong>Landlord:</strong> {formData.landlordName || "____________________"} <br/>
                <strong>Tenant:</strong> {formData.tenantName || "____________________"}
              </p>
              <p><strong>Property:</strong> {formData.propertyAddress || "________________________________________"}</p>
              <p>
                The monthly rent for the premises is set at <strong>₹{formData.monthlyRent || "XXXXX"}</strong>, with 
                a security deposit of <strong>₹{formData.securityDeposit || "XXXXX"}</strong>.
              </p>
              {customRequirements && (
                <div className="mt-4 p-2 bg-blue-50/50 rounded-lg border border-blue-100 text-[10px] italic">
                  <strong>Special Clause:</strong> {customRequirements}
                </div>
              )}
            </div>
          ) : bondType === 'Affidavit' ? (
            <div className="space-y-4">
              <p className="text-center font-bold">AFFIDAVIT</p>
              <p>I, <strong>{formData.deponentName || "____________________"}</strong>, do hereby solemnly affirm and state as follows:</p>
              <p>{formData.affidavitPurpose || "________________________________________________________________________________"}</p>
              <p>Verified that the contents of this affidavit are true to my knowledge.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-bold">AGREEMENT: {bondType.toUpperCase()}</p>
              <p>Reference Date: {today}</p>
              <p>{formData.customContent || "Agreement details will appear here as you type..."}</p>
              {customRequirements && (
                <div className="mt-4 p-2 bg-blue-50/50 rounded-lg border border-blue-100 italic">
                  <strong>Additional Terms:</strong> {customRequirements}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-end opacity-40">
          <div className="w-24 h-px bg-slate-400"></div>
          <Building className="w-4 h-4 text-slate-300" />
          <div className="w-24 h-px bg-slate-400"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 flex flex-col items-center">
      
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg p-4 flex items-center space-x-3 text-green-800 max-w-md">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <p className="font-medium text-sm">
            Success! Your document is securely queued for a notary.
          </p>
        </div>
      )}

      {/* Header & Progress Bar */}
      <div className="w-full max-w-6xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 px-4 md:px-0 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <Building className="w-8 h-8 text-blue-600" />
            <span>Lexi-Draft <span className="text-blue-600">Citizen</span></span>
          </h1>
          
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-8 relative max-w-4xl mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all duration-300"
            style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
          ></div>

          {[
            { step: 1, label: '1. Verify ID' },
            { step: 2, label: '2. Agreement Details' },
            { step: 3, label: '3. Review & Send' }
          ].map(({ step, label }) => (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {currentStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
              </div>
              <span className={`mt-2 text-xs md:text-sm font-medium ${
                currentStep >= step ? 'text-blue-900' : 'text-slate-500'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl relative">
        
        {/* Step 1: Verify Identity */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Let's verify your identity</h2>
              <p className="text-slate-500 mt-2">Choose how you want to securely provide your details.</p>
            </div>

            {showManualEntry ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6 flex items-center">
                  <button 
                    onClick={() => setShowManualEntry(false)}
                    className="p-2 -ml-2 mr-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-bold text-slate-900">Manual Entry</h3>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Legal Full Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      value={manualUser.fullName}
                      onChange={(e) => setManualUser(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-slate-50 focus:bg-white"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                    <input 
                      type="date"
                      value={manualUser.dob}
                      onChange={(e) => setManualUser(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-slate-50 focus:bg-white text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Current Address</label>
                    <textarea 
                      value={manualUser.address}
                      onChange={(e) => setManualUser(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-slate-50 focus:bg-white resize-none"
                      placeholder="Enter your complete residential address..."
                    />
                  </div>
                </div>

                <button
                  onClick={handleNextStep1}
                  disabled={!manualUser.fullName.trim()}
                  className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                    manualUser.fullName.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 -translate-y-0.5' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Next: Bond Details</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-4 mb-4">
                  <button
                    onClick={() => setIdMethod('aadhaar')}
                    className={`w-full flex items-center p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      idMethod === 'aadhaar' 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-3 rounded-lg mr-4 ${idMethod === 'aadhaar' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${idMethod === 'aadhaar' ? 'text-blue-900' : 'text-slate-700'}`}>Upload Aadhaar Image</h3>
                      <p className="text-sm text-slate-500 mt-1">Scan or capture your identity card</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setIdMethod('digilocker')}
                    className={`w-full flex items-center p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      idMethod === 'digilocker' 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-3 rounded-lg mr-4 ${idMethod === 'digilocker' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${idMethod === 'digilocker' ? 'text-blue-900' : 'text-slate-700'}`}>Connect DigiLocker</h3>
                      <p className="text-sm text-slate-500 mt-1">Fast and secure digital verification</p>
                    </div>
                  </button>
                </div>

                <div className="mb-8 flex items-center justify-center">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">or</span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <button
                  onClick={() => {
                    setIdMethod(null);
                    setShowManualEntry(true);
                  }}
                  className="w-full mb-8 flex items-center justify-center p-4 rounded-xl border-2 border-slate-100 border-dashed text-left transition-all duration-200 bg-white hover:border-slate-300 hover:bg-slate-50 group"
                >
                  <div className="p-2 rounded-lg mr-3 bg-slate-100 text-slate-500 group-hover:bg-slate-200 transition-colors">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Skip & Add Manually</h3>
                    <p className="text-xs text-slate-500 mt-1">Fill out the legal form details yourself</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>

                <div className="bg-slate-50 rounded-xl p-4 flex items-start space-x-3 mb-8">
                  <Lock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Your privacy is our priority. Your ID is used once to fill out the form and is never permanently saved.
                  </p>
                </div>

                <button
                  onClick={handleNextStep1}
                  disabled={!idMethod}
                  className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                    idMethod 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 -translate-y-0.5' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Next: Continue with Digital ID</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Agreement Details Redesign */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            
            {isGenerating ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center h-[500px]">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">AI is carefully formatting your document...</h2>
                <p className="text-slate-500">Creating a perfect legal draft based on your inputs.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Left Column: Form & Configuration */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Configure Your Bond</h2>
                    <p className="text-slate-500">Fill in the details below to generate your legal draft.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Bond Type Dropdown */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center">
                        <Scale className="w-4 h-4 mr-2 text-blue-600" />
                        Select Bond Type
                      </label>
                      <select 
                        value={bondType}
                        onChange={(e) => setBondType(e.target.value as BondType)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-700"
                      >
                        <option>Rent Agreement</option>
                        <option>Affidavit</option>
                        <option>Indemnity Bond</option>
                        <option>Employment Bond</option>
                        <option>Custom/Blank Bond</option>
                      </select>
                    </div>

                    <div className="h-px bg-slate-100 my-2"></div>

                    {/* Dynamic Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderFormFields()}
                    </div>

                    {/* Custom Requirements */}
                    <div className="space-y-2 pt-4 border-t border-slate-50">
                      <label className="text-sm font-semibold text-slate-700 flex items-center">
                        <FileSearch className="w-4 h-4 mr-2 text-blue-600" />
                        Custom Requirements
                      </label>
                      <textarea 
                        value={customRequirements}
                        onChange={(e) => setCustomRequirements(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white resize-none"
                        placeholder="Add specific clauses or modifications you'd like the AI to include..."
                      />
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-between gap-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-4 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors flex items-center space-x-2"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={handleGenerateDraft}
                      className="flex-1 lg:flex-none px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300"
                    >
                      <span>Next: Generate Draft</span>
                      <FileText className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Right Column: Live Preview */}
                <div className="hidden lg:block relative">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider text-sm">Document Preview</h3>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full uppercase">Real-time</span>
                  </div>
                  <PaperPreview />
                </div>

              </div>
            )}
          </div>
        )}

        {/* Step 3: Review & Send */}
        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Left Side: Document Preview (Final) */}
            <div className="lg:col-span-3 bg-white p-8 md:p-12 rounded-xl shadow-lg border border-slate-200 relative min-h-[600px] font-serif text-slate-800 leading-relaxed overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-100 to-transparent"></div>
              
              <div className="text-center mb-10 border-b-2 border-slate-800 pb-6">
                <h3 className="text-2xl font-bold uppercase tracking-wider mb-2">{bondType}</h3>
                <p className="text-sm text-slate-500 font-sans">Drafted seamlessly by Lexi-Draft</p>
              </div>

              <div className="space-y-6 text-sm md:text-base text-justify">
                {bondType === 'Rent Agreement' ? (
                  <>
                    <p>
                      This Rent Agreement is made and entered into on this <strong>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>, by and between:
                    </p>
                    <p className="pl-6 border-l-4 border-slate-200">
                      <strong>{formData.landlordName || "[Landlord Name]"}</strong>, hereinafter referred to as the <strong>"Landlord"</strong> <br/>
                      AND <br/>
                      <strong>{formData.tenantName || "[Tenant Name]"}</strong>, hereinafter referred to as the <strong>"Tenant"</strong>.
                    </p>
                    <p>
                      WHEREAS the Landlord is the lawful owner of the property located at <strong>{formData.propertyAddress || "[Property Address]"}</strong> (hereinafter referred to as the "Demised Premises").
                    </p>
                    <h4 className="font-bold text-lg mt-8 mb-4 border-b border-slate-200 pb-2">Key Terms</h4>
                    <ul className="list-decimal pl-6 space-y-4">
                      <li>Monthly Rent: <strong>₹ {formData.monthlyRent || "[Amount]"}</strong></li>
                      <li>Security Deposit: <strong>₹ {formData.securityDeposit || "[Amount]"}</strong></li>
                    </ul>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p>Final legal generation for <strong>{bondType}</strong> based on your verified configuration.</p>
                    <p>The AI has incorporated the following core details:</p>
                    <div className="bg-slate-50 p-4 rounded-xl text-sm italic border border-slate-100">
                      {bondType === 'Affidavit' ? formData.affidavitPurpose : formData.customContent || "Generic Bond Content"}
                    </div>
                  </div>
                )}
                
                {customRequirements && (
                  <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                    <p className="font-bold text-yellow-800 mb-1 leading-none">Custom Clause Applied:</p>
                    <p className="italic text-yellow-700">{customRequirements}</p>
                  </div>
                )}
              </div>

              <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between font-sans text-sm pb-8">
                <div className="text-center w-40">
                  <div className="border-b border-slate-400 h-10 mb-2"></div>
                  Signature of First Party
                </div>
                <div className="text-center w-40">
                  <div className="border-b border-slate-400 h-10 mb-2"></div>
                  Signature of Second Party
                </div>
              </div>
            </div>

            {/* Right Side: Actions */}
            <div className="lg:col-span-2 space-y-6 flex flex-col pt-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between h-full space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Ready for Notary</h3>
                  <p className="text-slate-500 mb-6">Review your draft on the left. If everything looks correct, you are ready to send this off securely.</p>
                  
                  {/* Accessibility Feature */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                      <Video className="w-4 h-4 mr-2" />
                      Accessibility Options
                    </h4>
                    <p className="text-xs text-blue-700 mb-4">View an explanation of this contract in Indian Sign Language (ISL).</p>
                    <button className="w-full bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center focus:ring-2 focus:ring-blue-200 outline-none shadow-sm">
                      <Video className="w-4 h-4 mr-2" />
                      Play ISL Video
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleSendToNotary}
                    className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-xl font-bold text-lg shadow-xl shadow-slate-300 transition-all hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center focus:ring-4 focus:ring-slate-200 outline-none"
                  >
                    <span>Send to Local Notary</span>
                    <ChevronRight className="w-6 h-6 ml-2" />
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full py-4 text-slate-500 hover:text-slate-800 font-medium transition-colors"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
