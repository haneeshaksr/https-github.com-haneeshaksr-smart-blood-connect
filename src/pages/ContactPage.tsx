import React, { useState } from 'react';
import { Phone, Mail, MapPin, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact Clinical Coordination
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Have questions regarding donor privacy, hospital onboarding, or technical integration? Our medical support desk is available 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <Phone className="w-5 h-5 text-red-600" />
            <div className="text-xs font-bold text-slate-900">Emergency Hotlines</div>
            <div className="text-xs text-slate-600 font-mono">1-800-555-BLOOD</div>
            <div className="text-[11px] text-slate-400">Available 24/7 for urgent surgical requisitions</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            <div className="text-xs font-bold text-slate-900">Official Electronic Mail</div>
            <div className="text-xs text-slate-600 font-mono">coordination@smartblood.org</div>
            <div className="text-[11px] text-slate-400">Hospital credential audits and general assistance</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <div className="text-xs font-bold text-slate-900">Coordination Headquarters</div>
            <div className="text-xs text-slate-600">742 Healthcare Parkway</div>
            <div className="text-[11px] text-slate-400">San Francisco, CA 94107</div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-2xl mx-auto">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Inquiry Received</h3>
              <p className="text-xs text-slate-600">
                Your message has been assigned a tracking reference and routed to our medical operations team.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 mb-2">Send a Direct Communication</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Hospital Credential Verification">Hospital Credential Verification</option>
                  <option value="Donor Privacy or Consent Question">Donor Privacy or Consent Question</option>
                  <option value="Technical or Postman API Support">Technical or API Integration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
