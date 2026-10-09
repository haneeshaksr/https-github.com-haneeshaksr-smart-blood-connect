import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, AlertCircle, CheckCircle2, ArrowRight, ShieldAlert, FileText, Upload } from 'lucide-react';

interface HospitalRegisterPageProps {
  navigate: (route: string) => void;
}

export const HospitalRegisterPage: React.FC<HospitalRegisterPageProps> = ({ navigate }) => {
  const { registerHospital } = useAuth();

  const [formData, setFormData] = useState({
    hospitalName: '',
    licenseNumber: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    state: 'California',
    district: 'San Francisco County',
    city: 'San Francisco',
    postalCode: '94103',
    password: '',
    confirmPassword: '',
    hasBloodBank: true,
    consentGiven: false,
    documentName: 'State_Medical_Facility_License_2026.pdf',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.hospitalName.trim() || !formData.licenseNumber.trim() || !formData.contactPerson.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setError('Please provide all mandatory hospital credentials.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!formData.consentGiven) {
      setError('You must accept the terms of medical verification and data privacy.');
      return;
    }

    setLoading(true);

    try {
      await registerHospital(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/hospital/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Hospital registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white font-bold text-xl mb-3 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hospital & Blood Bank Registration
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Enroll your licensed medical facility into the blood coordination network.
          </p>
        </div>

        {/* Verification Warning Box */}
        <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Mandatory Credential Verification Workflow: </span>
            Newly registered hospitals are automatically placed in <strong>"Pending Verification"</strong> status. Platform administrators verify your submitted clinical operating license before inventory management, blood request publishing, and donor outreach tools are unlocked.
          </div>
        </div>

        {success ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Registration Received: Pending Verification
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your hospital account has been created. A State Medical Board administrator will audit your licensing credentials. Redirecting to your facility portal...
            </p>
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Hospital Details */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-100">
                  1. Clinical Facility Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Hospital / Medical Center Name *
                    </label>
                    <input
                      type="text"
                      name="hospitalName"
                      required
                      placeholder="e.g. St. Jude Community Hospital"
                      value={formData.hospitalName}
                      onChange={handleChange}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Registration / License Number *
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      required
                      placeholder="e.g. LIC-MED-2025-1044"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Blood Bank on Premise? *
                    </label>
                    <select
                      name="hasBloodBank"
                      value={formData.hasBloodBank ? 'yes' : 'no'}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasBloodBank: e.target.value === 'yes' }))}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="yes">Yes (Certified Blood Bank Storage)</option>
                      <option value="no">No (Clinical Requisition Only)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Contact Person & Authentication */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-100">
                  2. Contact Person & Login Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Authorized Contact Person & Role *
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      required
                      placeholder="e.g. Michael Chang (Operations Lead)"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Official Institutional Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="director@stjude-clinic.org"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Emergency Desk Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+1 (555) 345-6789"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Account Password (Min 8 chars) *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Physical Address */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-100">
                  3. Facility Location
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Physical Hospital Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="120 Mission Bay Boulevard"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      District / County
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Document Verification */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-100">
                  4. Verification Document Attachment
                </h3>

                <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-slate-600" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {formData.documentName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Official State Medical Board Operating Permit
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    Document Attached
                  </span>
                </div>
              </div>

              {/* Terms */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consentGiven"
                    checked={formData.consentGiven}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I certify that I am an authorized clinical representative of this institution. I accept the Smart Blood Connect Hospital Verification Terms and agree to adhere to all state blood bank serology, crossmatching, and donor confidentiality standards.
                  </span>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {loading ? 'Submitting Application...' : 'Submit Hospital Registration'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
