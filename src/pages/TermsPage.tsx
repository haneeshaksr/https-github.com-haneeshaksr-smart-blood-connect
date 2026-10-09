import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm text-xs sm:text-sm text-slate-700 leading-relaxed">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Terms of Service & Clinical Liability Agreement
          </h1>
          <p className="text-xs text-slate-500">
            Smart Blood Connect System · Operating Governance Framework
          </p>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
          <strong>Mandatory Medical Crossmatching Disclaimer: </strong>
          Smart Blood Connect functions as a coordination, inventory discovery, and communication network. The platform does not certify clinical serological compatibility, antibody absence, or transfusion readiness. Direct crossmatching and clinical validation must be performed by the treating hospital blood bank.
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Hospital Registration & Licensure</h2>
          <p>
            Institutions registering as hospitals or blood banks warrant that they hold valid, current operating permits issued by appropriate state or national healthcare authorities. Entering a license number does not constitute proof of verification; privileges remain locked in "Pending Verification" status until independent review.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. Prohibited Exploitation & Commercialization</h2>
          <p>
            The commercial buying, selling, or unauthorized brokering of human blood or blood components is strictly prohibited. The platform is dedicated exclusively to voluntary non-remunerated donation and accredited hospital inventory management.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. Verification of Donors</h2>
          <p>
            Completion of online questionnaires does not substitute for on-site physical vitals screening, hemoglobin testing, or infectious disease serology. Hospitals are solely responsible for laboratory crossmatching before issuing blood products.
          </p>
        </section>

      </div>
    </div>
  );
};
