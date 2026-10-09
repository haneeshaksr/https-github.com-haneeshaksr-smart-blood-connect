import React from 'react';
import { ShieldCheck, Heart, Mail, Phone, MapPin, AlertCircle, FileCode } from 'lucide-react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Medical disclaimer callout adhering to zero-thick-left-border rule */}
        <div className="mb-12 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Mandatory Clinical Transfusion Notice: </span>
              All blood compatibility indicators and donor matches are algorithmic pre-screening representations. Clinical transfusion requires mandatory laboratory crossmatching, infectious disease serology, and physical cross-match authorization by certified blood bank and medical personnel.
            </div>
          </div>
          <a
            href="/api/docs/postman"
            download
            className="flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg shrink-0 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Postman Specs</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-900">
          {/* Col 1: Wordmark & mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="text-red-500 text-xl">🩸</span>
              <span>Smart Blood Connect</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Coordinated healthcare platform connecting verified hospital blood banks, voluntary eligible donors, and patients in need of emergency blood units.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>State Medical Board Verified Network</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => navigate('/find-blood')} className="hover:text-white transition-colors cursor-pointer">
                  Search Blood Inventory
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/register/donor')} className="hover:text-white transition-colors cursor-pointer">
                  Register as Donor
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/register/hospital')} className="hover:text-white transition-colors cursor-pointer">
                  Register Hospital
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  About the System
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
              Governance & Policies
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors cursor-pointer">
                  Donor Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors cursor-pointer">
                  Hospital Verification Terms
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  Biomedical Data Ethics
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
                  Report Clinical Irregularity
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Healthcare Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
              24/7 Clinical Coordination
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-red-500" />
                <span>Emergency: 1-800-555-BLOOD</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>coordination@smartblood.org</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>742 Healthcare Pkwy, San Francisco, CA 94107</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quiet copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Smart Blood Connect System. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>AABB Standards Compliant</span>
            <span>·</span>
            <span>HIPAA-Aligned Privacy</span>
            <span>·</span>
            <span>Verified Medical Centers Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
