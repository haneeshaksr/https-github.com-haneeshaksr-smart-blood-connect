import React from 'react';
import { ShieldCheck, Lock, EyeOff, UserCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm text-xs sm:text-sm text-slate-700 leading-relaxed">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Clinical Privacy Policy & Donor Data Protection
          </h1>
          <p className="text-xs text-slate-500">
            Effective Date: March 2026 · Compliant with HIPAA, GDPR Health Provisions, and AABB Standards
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Core Privacy Commitment to Donors</h2>
          <p>
            Smart Blood Connect maintains a strict <strong>Zero Public Disclosure</strong> policy for voluntary blood donors. Your phone number, email address, exact home address, and medical questionnaire responses are never published publicly, indexed by search engines, or made accessible to non-medical parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. Selective Consent Mechanism</h2>
          <p>
            When a verified hospital creates a targeted donor broadcast for your matching blood group, you receive an alert. You maintain absolute discretion to respond. If you choose "Interested", you must explicitly check the contact consent box before your contact number is revealed to that hospital's coordinator desk.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. Verification of Medical Personnel</h2>
          <p>
            Donor contact details can only ever be accessed by certified hospital accounts that have passed State Medical Board license verification. Administrator audit logs record every instance of donor contact viewing to prevent misuse.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">4. Right to Opt-Out & Availability Control</h2>
          <p>
            Donors may toggle their availability to "Not Available for Contact" at any time with a single click in their dashboard. When marked unavailable, the system automatically excludes the profile from all emergency broadcasts.
          </p>
        </section>

      </div>
    </div>
  );
};
