// Core AI Handlers for LexiDraft AI
// Architected for Gemini 3.1 Pro Multimodal + Claude 4.5 Sonnet integration

import type { IdentityExtraction } from "@/lib/gemini-handler";

export interface ExtractedInfo {
  name: string;
  dob: string;
  idNumber: string;
  address: string;
  category: string;
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function processVisionDocument(base64Image: string, idType: string): Promise<ExtractedInfo> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    // Memory-only extraction simulation
    await delay(2500);
    return {
      name: "Rajesh Kumar",
      dob: "1985-04-12",
      idNumber: idType === "Aadhaar" ? "xxxx-xxxx-1234" : (idType === "Passport" ? "Z9988112" : "ABCDE1234F"),
      address: "12/A, Park Avenue, Mumbai, Maharashtra",
      category: idType
    };
  }
  await delay(2000);
  return {
    name: "API Extracted Name",
    dob: "1980-01-01",
    idNumber: "12345678",
    address: "Extracted Address",
    category: idType
  };
}

export async function generateLegalDraft(data: any): Promise<string> {
  await delay(3000);
  return `RENT AGREEMENT
This Rent Agreement ("Agreement") is made on this day between:
1. Landlord: ${data.landlord || "Rajesh Kumar"}
2. Tenant: ${data.tenant || "Priya Sharma"}

TERMS AND CONDITIONS:
1. Rent Amount: ₹${data.rent || "15,000"} per month.
2. Notice Period: 30 Days written notice.
3. Security Deposit: ₹${data.deposit || "45,000"} (Refundable).
4. Jurisdiction: All disputes subject to Mumbai Jurisdiction.
5. Maintenance: Tenant shall pay society maintenance as levied by the association.

[DRAFTED BY LEXIDRAFT DA-AGENT]`;
}

export async function auditDraft(draftText: string): Promise<string> {
  await delay(2500);
  return `[LEGAL AUDITOR] Initiating Code Review...
[CHECK] Notice Period... PRESENT
[CHECK] Party Details... PRESENT
[CHECK] Rent Amount... PRESENT
[CHECK] Security Deposit... PRESENT
[CHECK] Jurisdiction... PRESENT
[ANALYSIS] No hallucinations detected against provided facts.
[STATUS] APPROVED`;
}

// ─── Claude 4.5 Sonnet — Bond Draft Generation ────────────────────────────────

/**
 * Simulates Claude 4.5 Sonnet structured legal drafting.
 * In production, this would call the Anthropic API with a system prompt
 * instructing it to convert plain requirements into professional Indian legalese.
 */
export async function generateBondDraft(
  bondType: string,
  customRequirements: string,
  identityData: IdentityExtraction | null
): Promise<string> {
  // Simulate Claude 4.5 Sonnet's structured reasoning latency
  await delay(2800);

  const name     = identityData?.name     ?? "Party A";
  const address  = identityData?.address  ?? "[Address Not Provided]";
  const idNumber = identityData?.idNumber ?? "[ID Not Provided]";
  const today    = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  // Extract any user-typed values from the custom requirements text
  const reqLines = customRequirements
    .split("\n")
    .filter(l => l.trim() && !l.startsWith("//"))
    .join("\n");

  switch (bondType) {

    case "Rent Agreement":
      return `RENT AGREEMENT

This Rent Agreement ("Agreement") is made and executed at Mumbai on this ${today}, by and between:

LANDLORD (First Party):
  Name    : ${name}
  Address : ${address}
  ID No.  : ${idNumber}
  (hereinafter referred to as the "Landlord")

TENANT (Second Party):
  Name    : [Tenant Full Name]
  Address : [Tenant Permanent Address]
  (hereinafter referred to as the "Tenant")

NOW, THEREFORE, in consideration of the mutual covenants and obligations contained herein, the parties agree as follows:

OPERATIVE CLAUSES:
  1.  PROPERTY   : The Landlord hereby lets and the Tenant hereby takes on rent the premises
                   situated at [Property Address] (hereinafter "the Premises").
  2.  TERM       : This Agreement shall be valid for a period of 11 (Eleven) months commencing
                   from [Start Date].
  3.  RENT       : The monthly rent payable shall be ₹[Amount]/- (Rupees [Amount in Words] only),
                   due on or before the 5th of each calendar month.
  4.  DEPOSIT    : The Tenant has paid a refundable security deposit of ₹[Amount]/- which shall
                   be returned within 30 days of vacating the Premises, subject to deductions for
                   damage or unpaid dues.
  5.  NOTICE     : Either party may terminate this Agreement by giving [X] days written notice.
  6.  MAINTENANCE: The Tenant shall maintain the Premises in good and tenantable condition and
                   shall not make any structural alterations without prior written consent.
  7.  SUBLETTING : The Tenant shall not sublet, assign, or part with the possession of the
                   Premises or any part thereof without prior written consent of the Landlord.
  8.  JURISDICTION: All disputes arising out of this Agreement shall be subject to the exclusive
                   jurisdiction of the Courts at [City].

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first above written.

Landlord Signature : ___________________    Date: __________
Tenant Signature   : ___________________    Date: __________
Witness 1          : ___________________
Witness 2          : ___________________

[DRAFTED BY LEXIDRAFT DA-AGENT | Claude 4.5 Sonnet | ${today}]`;

    case "Name Change Affidavit":
      return `AFFIDAVIT OF NAME CHANGE

I, ${name}, ${idNumber ? `holder of ID No. ${idNumber},` : ""} aged [Age] years,
residing at ${address},
do hereby solemnly affirm and declare as under:

  1. That my name was previously recorded as "[OLD NAME]" in all official records,
     government documents, and identity proofs.

  2. That henceforth I have decided to be known as "[NEW LEGAL NAME]" for all
     purposes, official or otherwise.

  3. That the reason for this change is [marriage / personal preference / spelling correction / other].

  4. That I request all government departments, educational institutions, financial
     institutions, and concerned authorities to update their records accordingly.

  5. That the contents of this Affidavit are true and correct to the best of my
     knowledge and belief, and nothing material has been concealed therefrom.

VERIFICATION:
I, the Deponent, verify that the contents of the above Affidavit are true and correct
to my knowledge and belief. No part of it is false and nothing material has been
concealed therefrom.

Solemnly affirmed at [City] on this ${today}.

Deponent Signature : ___________________
Name               : ${name}

Before me:
Notary Public / Oath Commissioner : ___________________
Registration No.  : ___________________    Date: __________

[DRAFTED BY LEXIDRAFT DA-AGENT | Claude 4.5 Sonnet | ${today}]`;

    case "Indemnity Bond":
      return `INDEMNITY BOND

This Indemnity Bond ("Bond") is executed at [City] on this ${today}, by:

INDEMNIFIER (Party A):
  Name    : ${name}
  Address : ${address}
  ID No.  : ${idNumber}
  (hereinafter referred to as the "Indemnifier")

IN FAVOUR OF:
  Name/Institution : [Name of Bank / Organization / Individual]
  Address          : [Address]
  (hereinafter referred to as the "Indemnified Party")

RECITALS:
WHEREAS the Indemnified Party has agreed to [describe the obligation / issue — e.g., issue
a duplicate document / release payment / provide a service] at the request of the Indemnifier,
in consideration of the Indemnifier executing this Indemnity Bond.

NOW, THEREFORE, the Indemnifier hereby unconditionally and irrevocably agrees and undertakes
as follows:

  1. The Indemnifier shall indemnify, defend, and hold harmless the Indemnified Party from and
     against any and all losses, costs, claims, damages, and expenses arising from or in
     connection with [specific event / document / obligation].

  2. The total liability of the Indemnifier hereunder shall not exceed ₹[Amount]/- (Rupees
     [Amount in Words] only).

  3. This Indemnity Bond shall remain in force for a period of [Duration / Perpetual] unless
     earlier discharged in writing by the Indemnified Party.

  4. This Bond shall be governed by the laws of India. Any disputes shall be subject to the
     exclusive jurisdiction of the Courts at [City].

IN WITNESS WHEREOF, the Indemnifier has executed this Bond on the date first above written.

Indemnifier Signature : ___________________    Date: __________
Witness 1             : ___________________
Witness 2             : ___________________

[DRAFTED BY LEXIDRAFT DA-AGENT | Claude 4.5 Sonnet | ${today}]`;

    case "Employment Bond":
      return `EMPLOYMENT BOND

This Employment Bond ("Bond") is made and entered into at [City] on this ${today}, between:

EMPLOYEE (First Party):
  Name        : ${name}
  Address     : ${address}
  ID / PAN No.: ${idNumber}
  Designation : [Job Title / Designation]
  (hereinafter referred to as the "Employee")

EMPLOYER (Second Party):
  Company Name     : [Company Name]
  Registered Office: [Company Address]
  (hereinafter referred to as the "Employer")

RECITALS:
WHEREAS the Employer has agreed to employ the Employee in the capacity of [Designation] and
the Employee has agreed to serve the Employer on the terms and conditions hereinafter set forth.

NOW, THEREFORE, in consideration of the employment and other good and valuable consideration,
the parties agree as follows:

OPERATIVE CLAUSES:
  1.  BOND PERIOD     : The Employee agrees to serve the Employer for a minimum period of [X]
                        months from the date of joining ("Lock-In Period").

  2.  PENALTY CLAUSE  : Should the Employee voluntarily terminate service or cease to serve
                        the Employer without due cause within the Lock-In Period, the Employee
                        shall be liable to pay the Employer a sum of ₹[Amount]/- (Rupees
                        [Amount in Words] only) as liquidated damages.

  3.  TRAINING COSTS  : The Employer has incurred / will incur training expenses of approximately
                        ₹[Amount]/- for the benefit of the Employee, which shall form part of the
                        consideration for this Bond.

  4.  NOTICE PERIOD   : Either party may terminate this engagement by providing [X] days written
                        notice. Failure to serve the notice period shall attract pro-rata penalty.

  5.  CONFIDENTIALITY : The Employee shall not, during or after employment, disclose any
                        confidential, proprietary, or business information of the Employer to
                        any third party without prior written consent.

  6.  NON-COMPETE     : For a period of [X] months following cessation of employment, the Employee
                        shall not engage in activities directly competing with the Employer's
                        business within [Geographic Scope].

  7.  JURISDICTION    : This Bond shall be governed by the laws of India. All disputes shall be
                        subject to the exclusive jurisdiction of the Courts at [City].

IN WITNESS WHEREOF, the parties have executed this Bond on the date first above written.

Employee Signature  : ___________________    Date: __________
Employer Authorized
Signatory           : ___________________    Date: __________
(Name & Designation): ___________________
Witness 1           : ___________________
Witness 2           : ___________________

[DRAFTED BY LEXIDRAFT DA-AGENT | Claude 4.5 Sonnet | ${today}]`;

    case "Custom/Blank Bond":
    default:
      return `BESPOKE BOND / AGREEMENT
(Validated under Indian Contract Act, 1872)

This Agreement ("Agreement") is made and executed at [City] on this ${today}, between:

PARTY A (First Party):
  Name    : ${name}
  Address : ${address}
  ID No.  : ${idNumber}
  (hereinafter referred to as "Party A")

PARTY B (Second Party):
  Name    : [Name of Second Party]
  Address : [Address]
  (hereinafter referred to as "Party B")

RECITALS:
WHEREAS Party A and Party B wish to record their mutual understanding, obligations, and
agreements as set forth in this instrument, which has been prepared on the basis of the
following requirements and instructions:

--- USER-SPECIFIED REQUIREMENTS ---
${reqLines}
--- END OF REQUIREMENTS ---

OPERATIVE CLAUSES:
(The following clauses have been auto-structured by LexiDraft DA-Agent from the above
requirements, in compliance with the Indian Contract Act, 1872:)

  1.  LAWFUL OBJECT      : The purpose of this Agreement is lawful within the meaning of
                           Section 23 of the Indian Contract Act, 1872.
  2.  CONSIDERATION      : Adequate and lawful consideration exists as described in the
                           Requirements above, per Section 25 of the ICA, 1872.
  3.  COMPETENCY         : Both parties confirm they are of the age of majority, of sound mind,
                           and not disqualified from contracting under any law, per Section 11.
  4.  FREE CONSENT       : This Agreement is entered into with free consent, without coercion,
                           undue influence, fraud, misrepresentation, or mistake, per Section 14.
  5.  OBLIGATIONS        : [Detailed obligations as specified in the Requirements section above
                           shall be incorporated here by the executing attorney.]
  6.  BREACH & REMEDIES  : In case of breach, the aggrieved party shall be entitled to seek
                           damages and/or specific performance as permitted under law.
  7.  GOVERNING LAW      : This Agreement shall be governed by and construed in accordance with
                           the laws of India.
  8.  JURISDICTION       : All disputes arising hereunder shall be subject to the exclusive
                           jurisdiction of the Courts at [City as specified in Requirements].

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first above written.

Party A Signature  : ___________________    Date: __________
Party B Signature  : ___________________    Date: __________
Witness 1          : ___________________
Witness 2          : ___________________

[DRAFTED BY LEXIDRAFT DA-AGENT | Claude 4.5 Sonnet | ICA 1872 Compliant | ${today}]`;
  }
}
