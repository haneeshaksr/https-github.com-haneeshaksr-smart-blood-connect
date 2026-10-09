import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SystemStats } from '../types';
import { 
  Heart, Building2, UserPlus, Search, ArrowRight, ShieldCheck, 
  Activity, CheckCircle2, Clock, Users, Hospital, Droplets, 
  FileCheck, AlertCircle, PhoneCall
} from 'lucide-react';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Quick Find Blood bar states
  const [searchBloodGroup, setSearchBloodGroup] = useState('O-');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    api.getStats()
      .then(res => {
        if (res.success) setStats(res.data);
      })
      .catch(err => console.error('Failed to load real stats:', err))
      .finally(() => setLoadingStats(false));
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/find-blood?bloodGroup=${encodeURIComponent(searchBloodGroup)}&city=${encodeURIComponent(searchCity)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 pt-8 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>Verified Hospital & Donor Coordination</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
                Donate Blood. <br className="hidden sm:inline" />
                <span className="text-red-600">Save Lives.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Smart Blood Connect coordinates emergency blood requests, real-time hospital laboratory inventory, and voluntary donor broadcasts across certified medical centers. Fast, transparent, and medically validated.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/register/donor')}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Register as Donor</span>
                </button>

                <button
                  onClick={() => navigate('/register/hospital')}
                  className="px-6 py-3.5 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-slate-700" />
                  <span>Register Hospital</span>
                </button>

                <button
                  onClick={() => navigate('/find-blood')}
                  className="px-5 py-3.5 text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Search Inventory</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Medical Assurance Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Administrative License Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Strict Donor Consent & Privacy</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl bg-slate-900 group">
                <img
                  src="/src/assets/images/hero_blood_connect_1791528770147.jpg"
                  alt="Modern hospital blood donation and coordination wing"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback container if local asset failed
                    e.currentTarget.style.display = 'none';
                  }}
                />
                
                {/* Visual Overlay Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="text-xs font-medium text-red-300 uppercase tracking-wider mb-1">
                    Emergency Blood Operations
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Clinical Crossmatching & Real-Time Stock
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Connecting surgical suites and trauma units with willing voluntary donors in minutes.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Find Blood Bar */}
          <div className="mt-14 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-red-600" />
              <span>Search Verified Blood Inventory Instantly</span>
            </div>

            <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">Required Blood Group</label>
                <select
                  value={searchBloodGroup}
                  onChange={(e) => setSearchBloodGroup(e.target.value)}
                  className="w-full text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-medium text-slate-600 mb-1">Location or City</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Check Availability</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* Real Database-Backed System Statistics */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Live System Database Statistics
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated strictly from verified hospital inventory and recorded clinical requisitions.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono tabular-nums">
              Refreshed: Real-time Database
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 mb-1">Available Blood Units</div>
              <div className="text-3xl font-extrabold text-slate-950 font-mono tabular-nums">
                {loadingStats ? '...' : (stats?.availableInventoryUnits ?? 0)}
              </div>
              <div className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified non-expired stock</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 mb-1">Total Blood Requests</div>
              <div className="text-3xl font-extrabold text-slate-950 font-mono tabular-nums">
                {loadingStats ? '...' : (stats?.totalRequests ?? 0)}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Hospital & public requisitions
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 mb-1">Verified Medical Centers</div>
              <div className="text-3xl font-extrabold text-slate-950 font-mono tabular-nums">
                {loadingStats ? '...' : (stats?.verifiedHospitalsCount ?? 0)}
              </div>
              <div className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Board accredited</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 mb-1">Registered Active Donors</div>
              <div className="text-3xl font-extrabold text-slate-950 font-mono tabular-nums">
                {loadingStats ? '...' : (stats?.activeDonorsCount ?? 0)}
              </div>
              <div className="text-xs text-rose-600 mt-2 flex items-center gap-1 font-medium">
                <Heart className="w-3.5 h-3.5 fill-rose-600" />
                <span>Ready for outreach</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              How Smart Blood Connect Works
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              A clinical protocol engineered for safety, donor privacy, and rapid response during life-threatening shortages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center text-sm mb-6 border border-red-100">
                01
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                1. Requisition & Inventory Check
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                When a hospital or patient requires blood, the system matches available verified stock across accredited blood banks using medically validated ABO/Rh compatibility rules.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center text-sm mb-6 border border-red-100">
                02
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                2. Targeted Donor Broadcast
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                If local stock is insufficient, verified hospital staff trigger targeted alerts to eligible, contactable donors near the hospital without publicly exposing donor private contact info.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center text-sm mb-6 border border-red-100">
                03
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                3. Clinical Collection & Verification
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Consenting donors are scheduled by the hospital blood bank. Qualified lab technicians perform physical screening, serology testing, and crossmatching prior to certified transfusion.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Benefits for Donors and Hospitals (Visual Bento layout) */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Benefits for Donors and Hospitals
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Designed collaboratively with hematologists, blood bank coordinators, and volunteer donor communities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Donor Benefits Card */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="/src/assets/images/donor_volunteer_1791528792402.jpg"
                  alt="Volunteer donor receiving healthcare consultation"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-lg font-bold">For Blood Donors</h3>
                    <p className="text-xs text-slate-200">Make an immediate, life-saving impact in your local community</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-4 flex-1">
                <ul className="space-y-3.5 text-xs text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Total Contact Privacy:</strong> Phone numbers and emails are never published openly; only verified hospitals receive access upon your direct consent.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Relevant Emergency Alerts:</strong> Receive notifications matched strictly to your specific blood group and location, preventing spam.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Verified Donation History:</strong> Maintain a verifiable record of completed donations and digital donation certificates.</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <button
                    onClick={() => navigate('/register/donor')}
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Register as Voluntary Donor
                  </button>
                </div>
              </div>
            </div>

            {/* Hospital Benefits Card */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="/src/assets/images/hospital_blood_bank_1791528781163.jpg"
                  alt="Hospital blood bank refrigerator units and medical staff"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-lg font-bold">For Hospitals & Blood Banks</h3>
                    <p className="text-xs text-slate-200">Maintain cold-chain inventory visibility and rapid emergency outreach</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-4 flex-1">
                <ul className="space-y-3.5 text-xs text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Automated Expiry & Low-Stock Alerts:</strong> Real-time tracking of units, components, and shelf-life compliance.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>One-Click Targeted Donor Outreach:</strong> Instantly broadcast urgent needs to matching registered donors in minutes.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Audited Status Workflows:</strong> Maintain an unbroken audit log from initial requisition through collection and fulfillment.</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <button
                    onClick={() => navigate('/register/hospital')}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Register Hospital or Blood Bank
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Medical Blood Compatibility Matrix Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Medical Blood Compatibility Guide (Red Blood Cells)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Understanding ABO & Rh compatibility for safe red blood cell transfusions.
                </p>
              </div>
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Mandatory serological crossmatch required prior to transfusion.</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th className="py-3 px-4 font-semibold">Recipient Group</th>
                    <th className="py-3 px-4 font-semibold">Compatible Donor Blood Groups</th>
                    <th className="py-3 px-4 font-semibold">Clinical Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">O-</td>
                    <td className="py-3 px-4 text-slate-700 font-mono">O-</td>
                    <td className="py-3 px-4 text-slate-500">Universal cellular RBC donor; can only receive O-.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">O+</td>
                    <td className="py-3 px-4 text-slate-700 font-mono">O-, O+</td>
                    <td className="py-3 px-4 text-slate-500">Most common recipient blood group.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">A-</td>
                    <td className="py-3 px-4 text-slate-700 font-mono">O-, A-</td>
                    <td className="py-3 px-4 text-slate-500">Can receive negative Rh groups only.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">A+</td>
                    <td className="py-3 px-4 text-slate-700 font-mono">O-, O+, A-, A+</td>
                    <td className="py-3 px-4 text-slate-500">Compatible with A and O blood types.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">B-</td>
                    <td className="py-3 px-4 text-slate-700 font-mono">O-, B-</td>
                    <td className="py-3 px-4 text-slate-500">Can receive negative Rh groups only.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">B+</td>
                    <td className="py-3 px-4 text-slate-700 font-mono">O-, O+, B-, B+</td>
                    <td className="py-3 px-4 text-slate-500">Compatible with B and O blood types.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">AB-</td>
                    <td className="py-3 px-4 text-slate-700 font-mono">O-, A-, B-, AB-</td>
                    <td className="py-3 px-4 text-slate-500">Compatible with all Rh-negative red cells.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">AB+</td>
                    <td className="py-3 px-4 text-slate-700 font-mono">All (Universal RBC Recipient)</td>
                    <td className="py-3 px-4 text-slate-500">Can receive red blood cells from any blood group.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to Join the Life-Saving Network?
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-red-100 leading-relaxed">
            Whether you are a voluntary donor willing to help during critical trauma cases or a licensed hospital blood bank managing daily inventory, Smart Blood Connect gives you the tools you need.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/register/donor')}
              className="px-6 py-3 text-xs font-semibold text-red-600 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Sign Up as Donor
            </button>
            <button
              onClick={() => navigate('/register/hospital')}
              className="px-6 py-3 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Register Medical Center
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
