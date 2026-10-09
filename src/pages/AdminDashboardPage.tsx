import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HospitalProfile, BloodRequest, AuditLog } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  Shield, CheckCircle2, XCircle, Users, Building2, Clock, 
  FileText, Activity, AlertTriangle, FileCode, Check, Ban
} from 'lucide-react';

interface AdminDashboardPageProps {
  navigate: (route: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'users' | 'requests' | 'audit' | 'postman'>('hospitals');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [hospitals, setHospitals] = useState<HospitalProfile[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [requestsList, setRequestsList] = useState<BloodRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Verify Modal
  const [selectedHospitalForVerify, setSelectedHospitalForVerify] = useState<HospitalProfile | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, hospRes, userRes, reqRes, audRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminHospitals(),
        api.getAdminUsers(),
        api.getAdminRequests(),
        api.getAdminAuditLogs()
      ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (hospRes.success) setHospitals(hospRes.data);
      if (userRes.success) setUsersList(userRes.data);
      if (reqRes.success) setRequestsList(reqRes.data);
      if (audRes.success) setAuditLogs(audRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyHospital = async (status: 'verified' | 'rejected') => {
    if (!selectedHospitalForVerify) return;
    setVerifying(true);
    try {
      const res = await api.verifyHospital(selectedHospitalForVerify.id, {
        status,
        notes: verificationNotes || (status === 'verified' ? 'Medical operating license verified by State Medical Board.' : 'Application rejected due to unverified medical licensure.')
      });

      if (res.success) {
        setSelectedHospitalForVerify(null);
        setVerificationNotes('');
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update verification status');
    } finally {
      setVerifying(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change user status to "${nextStatus}"?`)) return;

    try {
      const res = await api.toggleUserStatus(userId, nextStatus as any);
      if (res.success) {
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const pendingHospitals = hospitals.filter(h => h.verificationStatus === 'pending');

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Admin Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  State Medical Board Administrative Console
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Hospital licensure verification, user moderation, audit trail, and regulatory oversight.
              </p>
            </div>

            <a
              href="/api/docs/postman"
              download
              className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Postman Collection</span>
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-500">Pending Hospital Audits:</span>
              <div className="text-2xl font-black text-amber-600 font-mono tabular-nums">
                {pendingHospitals.length}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Verified Hospitals:</span>
              <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {hospitals.filter(h => h.verificationStatus === 'verified').length}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Total Registered Accounts:</span>
              <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {usersList.length}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Total Security Audit Logs:</span>
              <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {auditLogs.length}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 pb-px text-xs font-semibold">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'hospitals'
                ? 'bg-white border border-b-0 border-slate-200 text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospital Verification Queue</span>
            {pendingHospitals.length > 0 && (
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono text-[10px]">
                {pendingHospitals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-white border border-b-0 border-slate-200 text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Moderation ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-white border border-b-0 border-slate-200 text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Platform Requests Monitor ({requestsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-white border border-b-0 border-slate-200 text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Security Audit Logs</span>
          </button>
        </div>

        {/* Tab 1: Hospital Verification Queue */}
        {activeTab === 'hospitals' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hospital Medical Center Roster</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify submitted institutional operating licenses and clinical blood bank authorizations.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {hospitals.map(hosp => (
                <div key={hosp.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">{hosp.hospitalName}</span>
                      <StatusBadge status={hosp.verificationStatus} type="verification" />
                    </div>

                    <div className="text-xs text-slate-600">
                      License: <strong className="font-mono text-slate-900">{hosp.licenseNumber}</strong> · Contact: {hosp.contactPerson} ({hosp.phone})
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Location: {hosp.address}, {hosp.city}, {hosp.state} {hosp.postalCode} · Blood Bank Storage: {hosp.hasBloodBank ? 'Yes' : 'No'}
                    </div>

                    {hosp.verificationNotes && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 max-w-xl">
                        <strong>Verification Audit Note: </strong>{hosp.verificationNotes}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {hosp.verificationStatus === 'pending' ? (
                      <button
                        onClick={() => {
                          setSelectedHospitalForVerify(hosp);
                          setVerificationNotes('');
                        }}
                        className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Audit & Decide
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedHospitalForVerify(hosp);
                          setVerificationNotes(hosp.verificationNotes || '');
                        }}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Re-evaluate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: User Moderation */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">User Accounts Moderation</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active registered donor, hospital, and administrator identities.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4 uppercase text-[10px] font-bold tracking-wider">
                        <span className={`px-2 py-0.5 rounded ${
                          u.role === 'admin' ? 'bg-amber-100 text-amber-800' : u.role === 'hospital' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{u.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold ${u.status === 'active' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {u.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className={`py-1 px-2.5 text-xs font-medium rounded cursor-pointer ${
                              u.status === 'active'
                                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Platform Requests Monitor */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Network-Wide Blood Requisitions Monitor</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Surveillance for duplicate requests, fulfillment adherence, and clinical bottlenecks.
              </p>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {requestsList.map(req => (
                <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-slate-900">{req.refNumber}</span>
                      <StatusBadge status={req.status} type="request" />
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">Origin: {req.requesterType.toUpperCase()}</span>
                    </div>

                    <div className="text-slate-800 font-medium">
                      Patient: <strong>{req.patientName}</strong> · Hospital: <strong>{req.hospitalName}</strong>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Required: {req.unitsNeeded} units of {req.bloodGroup} ({req.component}) · Priority: <strong>{req.priority}</strong> · Logged: {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-slate-900 font-semibold">{req.responsesCount || 0} Donor Responses</div>
                    <div className="text-[11px] text-slate-400">Workflow: {req.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Security Audit Logs */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Immutable Security & Regulatory Audit Logs</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every sensitive clinical operation, verification decision, and donor broadcast is recorded with actor timestamp.
              </p>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.map(log => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                      <span className="text-slate-500">by {log.actorName} ({log.actorRole})</span>
                    </div>
                    <div className="text-slate-700">{log.details}</div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Audit Modal */}
        {selectedHospitalForVerify && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Hospital Licensure Audit: {selectedHospitalForVerify.hospitalName}
              </h3>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-700">
                <div>License Number: <strong className="font-mono text-slate-900">{selectedHospitalForVerify.licenseNumber}</strong></div>
                <div>Contact Official: {selectedHospitalForVerify.contactPerson} ({selectedHospitalForVerify.email})</div>
                <div>Address: {selectedHospitalForVerify.address}, {selectedHospitalForVerify.city}</div>
                <div>Blood Bank Storage: {selectedHospitalForVerify.hasBloodBank ? 'Yes (Certified)' : 'No (Requisition Only)'}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Verification Evaluation Notes *
                </label>
                <textarea
                  rows={3}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="e.g. Verified license against California State Medical Board registry. Facility complies with AABB blood storage standards."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedHospitalForVerify(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={verifying}
                    onClick={() => handleVerifyHospital('rejected')}
                    className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Reject Application
                  </button>

                  <button
                    type="button"
                    disabled={verifying}
                    onClick={() => handleVerifyHospital('verified')}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    Approve & Verify Credentials
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
