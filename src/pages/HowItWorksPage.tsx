import React from 'react';
import { CheckCircle2, Heart, Building2, ShieldCheck, ArrowRight, Bell, CalendarCheck } from 'lucide-react';

interface HowItWorksPageProps {
  navigate: (route: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Smart Blood Connect Operates
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            A step-by-step overview of the clinical coordination lifecycle from emergency blood need to certified collection.
          </p>
        </div>

        {/* Section 1: For Donors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5 fill-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">For Voluntary Blood Donors</h2>
              <p className="text-xs text-slate-500">The journey of giving life safely and confidentially</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <span className="font-bold text-red-600 font-mono text-sm shrink-0">1.</span>
              <div>
                <strong className="text-slate-900">Registration & Preliminary Health Screening: </strong>
                You create a secure account, select your blood group, and fill out a digital health eligibility questionnaire (weight, recent tattoos, illness, travel history).
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <span className="font-bold text-red-600 font-mono text-sm shrink-0">2.</span>
              <div>
                <strong className="text-slate-900">Targeted Notification Alerts: </strong>
                When an accredited hospital in your region experiences an urgent shortage of your specific blood group, you receive an in-app and email alert with request parameters.
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <span className="font-bold text-red-600 font-mono text-sm shrink-0">3.</span>
              <div>
                <strong className="text-slate-900">Confidential Response & Clinical Donation: </strong>
                If you are available, you reply "Interested" and grant contact permission. The hospital contacts you, sets an appointment, performs laboratory crossmatching, and issues a verified digital certificate.
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/register/donor')}
              className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Sign Up as Voluntary Donor
            </button>
          </div>
        </div>

        {/* Section 2: For Hospitals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">For Hospitals & Blood Banks</h2>
              <p className="text-xs text-slate-500">Real-time inventory and audited donor broadcast</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <span className="font-bold text-slate-900 font-mono text-sm shrink-0">1.</span>
              <div>
                <strong className="text-slate-900">Administrative Verification: </strong>
                Hospital applications require verification of medical license numbers by State Medical Board administrators. Unverified accounts cannot broadcast to donors or update inventory.
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <span className="font-bold text-slate-900 font-mono text-sm shrink-0">2.</span>
              <div>
                <strong className="text-slate-900">Inventory Tracking & Expiry Algorithms: </strong>
                Record units of whole blood, PRBC, platelets, or plasma. The system automatically computes shelf-life expiry and flags low stock without counting expired units.
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <span className="font-bold text-slate-900 font-mono text-sm shrink-0">3.</span>
              <div>
                <strong className="text-slate-900">Targeted Broadcast Outreach: </strong>
                For critical shortages, send one-click alerts to eligible, contactable donors in your city. Track replies, schedule appointments, and verify fulfillment.
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/register/hospital')}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Enroll Hospital / Blood Center
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
