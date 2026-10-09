import React from 'react';
import { Heart, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

interface RegisterPageProps {
  navigate: (route: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600 text-white font-bold text-xl mb-4 shadow-sm">
            🩸
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Join Smart Blood Connect
          </h1>
          <p className="mt-3 text-sm text-slate-600 max-w-xl mx-auto">
            Choose your role to get started. Donors and hospital institutions follow specialized, secure onboarding workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Option 1: Donor Registration */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-6 border border-red-100">
                <Heart className="w-6 h-6 fill-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Register as Voluntary Donor
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Be on standby to help during critical trauma cases and surgical emergencies. Control your availability, complete preliminary health screening, and protect your private contact details.
              </p>
              
              <div className="space-y-2 text-xs text-slate-500 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Targeted emergency notifications for your blood group</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Contact details shared only upon explicit consent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Verified digital donation history certificate</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/register/donor')}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Continue as Donor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Option 2: Hospital Registration */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-6 border border-slate-200">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Register Hospital / Blood Bank
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                For licensed medical facilities, surgical hospitals, and certified blood centers. Submit credentials for administrative licensing verification to access network inventory and donor outreach.
              </p>
              
              <div className="space-y-2 text-xs text-slate-500 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Real-time blood component inventory management</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Targeted emergency donor broadcast capabilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Audited status and transfusion collection tracking</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/register/hospital')}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Continue as Hospital</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        <div className="mt-12 text-center text-xs text-slate-500">
          Already registered?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-red-600 font-semibold hover:underline cursor-pointer"
          >
            Log in to your account
          </button>
        </div>

      </div>
    </div>
  );
};
