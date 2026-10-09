import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Building2, Shield, Heart, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';

interface LoginPageProps {
  navigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, switchDemoRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'donor' | 'hospital' | 'admin'>('donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, selectedRole);
      if (selectedRole === 'donor') navigate('/donor/dashboard');
      else if (selectedRole === 'hospital') navigate('/hospital/dashboard');
      else if (selectedRole === 'admin') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleType: string) => {
    setError('');
    setLoading(true);
    try {
      await switchDemoRole(roleType);
      if (roleType.includes('donor')) navigate('/donor/dashboard');
      else if (roleType.includes('hospital')) navigate('/hospital/dashboard');
      else if (roleType === 'admin') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600 text-white font-bold text-xl mb-4 shadow-sm">
            🩸
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to Smart Blood Connect
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Secure clinical coordination for donors, hospitals, and coordinators.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Select Your Account Portal
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('donor');
                  setEmail('sarah.donor@example.com');
                  setPassword('Password@123');
                }}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedRole === 'donor'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-red-600" />
                <span>Donor</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('hospital');
                  setEmail('bloodbank@metrohealth.org');
                  setPassword('Password@123');
                }}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedRole === 'hospital'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-slate-700" />
                <span>Hospital</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setEmail('admin@smartblood.org');
                  setPassword('Password@123');
                }}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'donor'
                      ? 'sarah.donor@example.com'
                      : selectedRole === 'hospital'
                      ? 'bloodbank@metrohealth.org'
                      : 'admin@smartblood.org'
                  }
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {loading ? 'Authenticating...' : `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Instant 1-Click Evaluation Accounts:
            </div>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('verified_hospital')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-900">Metro Health General Hospital</div>
                  <div className="text-[11px] text-slate-500">Verified Hospital · Active Blood Bank</div>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">Log in →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('screened_donor')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-900">Sarah Lindqvist (O-)</div>
                  <div className="text-[11px] text-slate-500">Screened Voluntary Donor</div>
                </div>
                <span className="text-[11px] text-red-600 font-medium">Log in →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-900">State Medical Board Admin</div>
                  <div className="text-[11px] text-slate-500">Verify Hospitals · Platform Moderation</div>
                </div>
                <span className="text-[11px] text-amber-700 font-medium">Log in →</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-red-600 font-semibold hover:underline cursor-pointer"
            >
              Register here
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
