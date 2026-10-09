import React from 'react';
import { ShieldCheck, Heart, Building2, CheckCircle2, Award, Users } from 'lucide-react';

interface AboutPageProps {
  navigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-md">
            Biomedical Coordination Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About Smart Blood Connect
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Smart Blood Connect was engineered to eliminate systemic friction, dangerous delays, and data fragmentation between hospital blood banks and voluntary blood donors.
          </p>
        </div>

        {/* Mission & Standards */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            Our Clinical Mission & Engineering Ethics
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every minute matters during massive hemorrhages, surgical emergencies, and maternal trauma. Traditional blood availability tracking frequently relies on manual telephone inquiries across hospitals or chaotic social media requests that expose patients' and donors' confidential contact details.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Smart Blood Connect establishes a centralized, encrypted, role-audited bridge where licensed medical centers manage monitored cold-chain inventory and initiate targeted, rate-limited donor outreach without compromising personal donor privacy.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
              <h3 className="text-xs font-bold text-slate-900">Licensed Facilities Only</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Every hospital account requires verified operating credentials audited by administrators.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <Heart className="w-5 h-5 text-red-600 mb-2" />
              <h3 className="text-xs font-bold text-slate-900">Donor Consent by Default</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Phone numbers and emails are never published openly; shared only upon explicit donation response.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <Award className="w-5 h-5 text-indigo-600 mb-2" />
              <h3 className="text-xs font-bold text-slate-900">Medically Validated</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Adheres strictly to ABO/Rh biological compatibility matrices and mandatory serology crossmatching.
              </p>
            </div>
          </div>
        </div>

        {/* Regulatory Governance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Regulatory Governance & Quality Assurance
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            All blood collection records, inventory expiration algorithms, and transfusion acknowledgements conform to the standards established by the American Association of Blood Banks (AABB), WHO guidelines on blood safety, and regional health board mandates.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/find-blood')}
              className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Explore Live Blood Inventory
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
