import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BloodInventoryItem, BloodRequest, DonorResponse, Notification, HospitalProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  Building2, Droplets, AlertTriangle, CheckCircle2, Clock, 
  Send, Users, PlusCircle, Trash2, Edit3, ShieldAlert, 
  ShieldCheck, Phone, Mail, Award, X, RefreshCw
} from 'lucide-react';

interface HospitalDashboardPageProps {
  navigate: (route: string) => void;
}

export const HospitalDashboardPage: React.FC<HospitalDashboardPageProps> = ({ navigate }) => {
  const { user, hospitalProfile, updateHospitalProfileState } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'requests' | 'donors' | 'profile'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [newInvForm, setNewInvForm] = useState({
    bloodGroup: 'O+',
    component: 'Red Blood Cells (PRBC)',
    unitsAvailable: 5,
    collectionDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 35 * 24 * 3600 * 1000).toISOString().split('T')[0],
    storageLocation: 'Cold Vault 1, Shelf B-2'
  });

  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [newReqForm, setNewReqForm] = useState({
    patientName: '',
    patientAge: 40,
    bloodGroup: 'O-',
    component: 'Red Blood Cells (PRBC)',
    unitsNeeded: 2,
    priority: 'Urgent',
    requiredBy: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
    location: '',
    notes: ''
  });

  // Selected Request Responses View
  const [selectedReqForResponses, setSelectedReqForResponses] = useState<BloodRequest | null>(null);
  const [reqResponses, setReqResponses] = useState<DonorResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Broadcast feedback
  const [broadcastResult, setBroadcastResult] = useState<{ message: string; count?: number } | null>(null);
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);

  // Record Donation Modal
  const [showRecordDonationModal, setShowRecordDonationModal] = useState(false);
  const [donationForm, setDonationForm] = useState({
    donorId: '',
    donorName: '',
    requestId: '',
    unitsDonated: 1,
    bloodGroup: 'O-',
    component: 'Whole Blood',
    notes: 'Completed clinical donation with standard pre-test screening.'
  });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, invRes, reqRes] = await Promise.all([
        api.getHospitalDashboard(),
        api.getHospitalInventory(),
        api.getHospitalRequests()
      ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (invRes.success) setInventory(invRes.data);
      if (reqRes.success) setRequests(reqRes.data);
    } catch (err) {
      console.error('Hospital dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addHospitalInventory(newInvForm);
      if (res.success) {
        setShowAddInventoryModal(false);
        fetchDashboard();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add inventory');
    }
  };

  const handleDeleteInventory = async (id: string) => {
    if (!confirm('Are you sure you want to remove or dispose this blood inventory record?')) return;
    try {
      await api.deleteHospitalInventory(id);
      fetchDashboard();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createHospitalRequest(newReqForm);
      if (res.success) {
        setShowCreateRequestModal(false);
        fetchDashboard();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create request');
    }
  };

  const handleBroadcast = async (requestId: string) => {
    setBroadcastingId(requestId);
    setBroadcastResult(null);
    try {
      const res = await api.broadcastRequest(requestId);
      if (res.success) {
        setBroadcastResult({
          message: res.message,
          count: res.data.notifiedDonorsCount
        });
        fetchDashboard();
      }
    } catch (err: any) {
      setBroadcastResult({ message: err.message });
    } finally {
      setBroadcastingId(null);
    }
  };

  const handleViewResponses = async (req: BloodRequest) => {
    setSelectedReqForResponses(req);
    setLoadingResponses(true);
    try {
      const res = await api.getRequestResponses(req.id);
      if (res.success) setReqResponses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleUpdateDonorResponse = async (respId: string, updates: any) => {
    try {
      const res = await api.updateDonorResponse(respId, updates);
      if (res.success && selectedReqForResponses) {
        handleViewResponses(selectedReqForResponses);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (requestId: string, nextStatus: string) => {
    try {
      const res = await api.updateRequestStatus(requestId, { status: nextStatus });
      if (res.success) {
        fetchDashboard();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRecordDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.recordDonation(donationForm);
      if (res.success) {
        alert(res.message);
        setShowRecordDonationModal(false);
        fetchDashboard();
        if (selectedReqForResponses) {
          handleViewResponses(selectedReqForResponses);
        }
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const currentHospital = dashboardData?.hospital || hospitalProfile;
  const isVerified = currentHospital?.verificationStatus === 'verified';
  const metrics = dashboardData?.metrics || {
    totalRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    fulfilledRequests: 0,
    totalAvailableUnits: 0,
    expiredUnitsCount: 0,
    lowStockAlertsCount: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Verification Status Banner if Pending */}
        {!isVerified && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">
                  Account Pending Administrator Verification
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Your hospital operating credentials are under review by State Medical Board personnel. Blood inventory logging and donor outreach broadcasts are locked until verified.
                </p>
              </div>
            </div>
            <button
              onClick={() => alert('Verification audit in progress. Contact State Medical Board supervisor for expedited review.')}
              className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
            >
              Check Audit Status
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {currentHospital?.hospitalName || 'Hospital Coordination Portal'}
                </h1>
                <StatusBadge status={currentHospital?.verificationStatus || 'pending'} type="verification" />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span>License: <strong className="font-mono text-slate-700">{currentHospital?.licenseNumber}</strong></span>
                <span>·</span>
                <span>Contact: {currentHospital?.contactPerson}</span>
                <span>·</span>
                <span>{currentHospital?.city}, {currentHospital?.state}</span>
              </div>
            </div>

            {isVerified && (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowAddInventoryModal(true)}
                  className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Log Blood Stock</span>
                </button>

                <button
                  onClick={() => setShowCreateRequestModal(true)}
                  className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Blood Request</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 pb-px text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-white border border-b-0 border-slate-200 text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Overview & Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-white border border-b-0 border-slate-200 text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Blood Inventory ({inventory.length})</span>
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
            <span>Blood Requests & Outreach ({requests.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Real DB Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500">Available Valid Units</div>
                <div className="text-3xl font-extrabold text-slate-950 font-mono tabular-nums mt-1">
                  {metrics.totalAvailableUnits}
                </div>
                <div className="text-[11px] text-emerald-700 mt-2 font-medium">Non-expired stock</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500">Active Requests</div>
                <div className="text-3xl font-extrabold text-slate-950 font-mono tabular-nums mt-1">
                  {metrics.inProgressRequests + metrics.pendingRequests}
                </div>
                <div className="text-[11px] text-slate-500 mt-2">Pending / in outreach</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500">Fulfilled Transfusions</div>
                <div className="text-3xl font-extrabold text-slate-950 font-mono tabular-nums mt-1">
                  {metrics.fulfilledRequests}
                </div>
                <div className="text-[11px] text-emerald-700 mt-2 font-medium">Verified donations completed</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500">Expired / Low Stock Alerts</div>
                <div className="text-3xl font-extrabold text-rose-600 font-mono tabular-nums mt-1">
                  {metrics.expiredUnitsCount + metrics.lowStockAlertsCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-2">{metrics.expiredUnitsCount} expired units automatically flagged</div>
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Institutional Notifications</h3>
              {dashboardData?.recentNotifications?.length === 0 ? (
                <div className="text-xs text-slate-500">No new alerts.</div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {dashboardData?.recentNotifications?.map((n: any) => (
                    <div key={n.id} className="py-3 flex items-start gap-3">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-900">{n.title}</div>
                        <p className="text-slate-600 mt-0.5">{n.message}</p>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Inventory Management */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hospital Blood Bank Inventory</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitored units. Expired units are automatically excluded from available counts.
                </p>
              </div>

              {isVerified && (
                <button
                  onClick={() => setShowAddInventoryModal(true)}
                  className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  + Add Stock Batch
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Component</th>
                    <th className="py-3 px-4 text-right">Available Units</th>
                    <th className="py-3 px-4">Collected</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Storage Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                        {item.bloodGroup}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {item.component}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                        {item.unitsAvailable}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(item.collectionDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-mono text-[11px]">
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {item.storageLocation}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.stockStatus} type="inventory" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isVerified && (
                          <button
                            onClick={() => handleDeleteInventory(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Dispose Batch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Tab 3: Blood Requests & Outreach */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            
            {broadcastResult && (
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <Send className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Broadcast Transmission Result: </span>
                    {broadcastResult.message}
                  </div>
                </div>
                <button
                  onClick={() => setBroadcastResult(null)}
                  className="text-indigo-400 hover:text-indigo-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Registered Blood Requests</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Progress clinical workflows and broadcast alerts to matching contactable donors.
                  </p>
                </div>

                {isVerified && (
                  <button
                    onClick={() => setShowCreateRequestModal(true)}
                    className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    + New Requisition
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100">
                {requests.map(req => (
                  <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{req.refNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          req.priority === 'Critical Emergency' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {req.priority}
                        </span>
                        <StatusBadge status={req.status} type="request" />
                      </div>

                      <div className="text-xs text-slate-700 font-medium">
                        Patient: <strong>{req.patientName}</strong> ({req.patientAge} yrs) · Requisitioned for <strong>{req.unitsNeeded} units of {req.bloodGroup}</strong> ({req.component})
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>Required By: <strong className="font-mono text-slate-700">{new Date(req.requiredBy).toLocaleString()}</strong></span>
                        <span>·</span>
                        <span>Donor Responses: <strong className="text-emerald-700 font-bold">{req.totalResponses || 0}</strong> ({req.interestedCount || 0} interested)</span>
                      </div>
                    </div>

                    {/* Hospital Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleViewResponses(req)}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Responses ({req.totalResponses || 0})</span>
                      </button>

                      {isVerified && req.status !== 'Fulfilled' && req.status !== 'Cancelled' && (
                        <>
                          <button
                            onClick={() => handleBroadcast(req.id)}
                            disabled={broadcastingId === req.id}
                            className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{broadcastingId === req.id ? 'Broadcasting...' : 'Broadcast to Donors'}</span>
                          </button>

                          <select
                            value={req.status}
                            onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 font-semibold text-slate-700"
                          >
                            <option value="Awaiting Hospital Review">Awaiting Review</option>
                            <option value="Accepted by Hospital">Accepted</option>
                            <option value="Donor Outreach in Progress">Donor Outreach</option>
                            <option value="Appointment or Collection Coordination">Coordination</option>
                            <option value="Fulfilled">Mark Fulfilled</option>
                            <option value="Cancelled">Cancel</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Add Inventory Modal */}
        {showAddInventoryModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Log Blood Stock Batch</h3>
                <button onClick={() => setShowAddInventoryModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddInventory} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group *</label>
                    <select
                      value={newInvForm.bloodGroup}
                      onChange={(e) => setNewInvForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    >
                      {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Units Available *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newInvForm.unitsAvailable}
                      onChange={(e) => setNewInvForm(prev => ({ ...prev, unitsAvailable: Number(e.target.value) }))}
                      className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Component Type</label>
                  <select
                    value={newInvForm.component}
                    onChange={(e) => setNewInvForm(prev => ({ ...prev, component: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="Red Blood Cells (PRBC)">Red Blood Cells (PRBC)</option>
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Platelets">Platelets</option>
                    <option value="Fresh Frozen Plasma (FFP)">Fresh Frozen Plasma (FFP)</option>
                    <option value="Cryoprecipitate">Cryoprecipitate</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Collection Date</label>
                    <input
                      type="date"
                      value={newInvForm.collectionDate}
                      onChange={(e) => setNewInvForm(prev => ({ ...prev, collectionDate: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={newInvForm.expiryDate}
                      onChange={(e) => setNewInvForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Storage Vault Location</label>
                  <input
                    type="text"
                    value={newInvForm.storageLocation}
                    onChange={(e) => setNewInvForm(prev => ({ ...prev, storageLocation: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Save Stock Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Request Modal */}
        {showCreateRequestModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Create Clinical Blood Requisition</h3>
                <button onClick={() => setShowCreateRequestModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Patient Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Morales"
                      value={newReqForm.patientName}
                      onChange={(e) => setNewReqForm(prev => ({ ...prev, patientName: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Patient Age</label>
                    <input
                      type="number"
                      value={newReqForm.patientAge}
                      onChange={(e) => setNewReqForm(prev => ({ ...prev, patientAge: Number(e.target.value) }))}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group *</label>
                    <select
                      value={newReqForm.bloodGroup}
                      onChange={(e) => setNewReqForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    >
                      {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Units *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newReqForm.unitsNeeded}
                      onChange={(e) => setNewReqForm(prev => ({ ...prev, unitsNeeded: Number(e.target.value) }))}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                    <select
                      value={newReqForm.priority}
                      onChange={(e) => setNewReqForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Critical Emergency">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Component</label>
                  <select
                    value={newReqForm.component}
                    onChange={(e) => setNewReqForm(prev => ({ ...prev, component: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="Red Blood Cells (PRBC)">Red Blood Cells (PRBC)</option>
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Platelets">Platelets</option>
                    <option value="Fresh Frozen Plasma (FFP)">Fresh Frozen Plasma (FFP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Required By (Date & Time) *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newReqForm.requiredBy}
                    onChange={(e) => setNewReqForm(prev => ({ ...prev, requiredBy: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Surgical / Clinical Notes</label>
                  <textarea
                    rows={2}
                    value={newReqForm.notes}
                    onChange={(e) => setNewReqForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="e.g. Orthopedic reconstruction planned"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Publish Clinical Requisition
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manage Responses Modal */}
        {selectedReqForResponses && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Donor Responses for {selectedReqForResponses.refNumber}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Target: {selectedReqForResponses.unitsNeeded} units of {selectedReqForResponses.bloodGroup} ({selectedReqForResponses.component})
                  </div>
                </div>
                <button onClick={() => setSelectedReqForResponses(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingResponses ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading donor responses...</div>
              ) : reqResponses.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                  <Users className="w-6 h-6 text-slate-300 mx-auto" />
                  <div>No donor responses received yet for this request.</div>
                  <p className="text-[11px] text-slate-400">
                    Trigger a broadcast to notify compatible donors in this area.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reqResponses.map(resp => (
                    <div key={resp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>{resp.donorName}</span>
                            <span className="font-mono text-red-600 font-extrabold">{resp.donorBloodGroup}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{resp.donorCity}</div>
                        </div>

                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          resp.status === 'Interested' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {resp.status}
                        </span>
                      </div>

                      {/* Contact details with Consent Enforcement */}
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Confidential Donor Contact (Consent Enforced):
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className={resp.contactConsent ? 'font-mono text-slate-900 font-semibold' : 'text-slate-400 italic'}>
                            {resp.donorPhone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className={resp.contactConsent ? 'text-slate-900' : 'text-slate-400 italic'}>
                            {resp.donorEmail}
                          </span>
                        </div>
                        {resp.notes && (
                          <div className="pt-1 text-[11px] text-slate-600">
                            <strong>Donor note: </strong>"{resp.notes}"
                          </div>
                        )}
                      </div>

                      {/* Hospital Follow-up Actions */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={resp.contactedByHospital}
                            onChange={(e) => handleUpdateDonorResponse(resp.id, { contactedByHospital: e.target.checked })}
                            className="rounded border-slate-300 text-slate-900"
                          />
                          <span>Mark Contacted</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const date = prompt('Enter scheduled appointment date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
                              if (date) {
                                handleUpdateDonorResponse(resp.id, {
                                  appointmentArranged: true,
                                  appointmentDate: date
                                });
                              }
                            }}
                            className="py-1 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium cursor-pointer"
                          >
                            {resp.appointmentArranged ? `Appointment Set (${resp.appointmentDate})` : 'Schedule Appointment'}
                          </button>

                          <button
                            onClick={() => {
                              setDonationForm({
                                donorId: resp.donorId,
                                donorName: resp.donorName,
                                requestId: selectedReqForResponses.id,
                                unitsDonated: 1,
                                bloodGroup: resp.donorBloodGroup,
                                component: selectedReqForResponses.component,
                                notes: 'Clinical donation collected and certified in hospital blood bank.'
                              });
                              setShowRecordDonationModal(true);
                            }}
                            className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium cursor-pointer"
                          >
                            Record Donation
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Record Verified Donation Modal */}
        {showRecordDonationModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Record Verified Blood Donation</h3>
                <button onClick={() => setShowRecordDonationModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>An accredited donation certificate will be issued to the donor.</span>
              </div>

              <form onSubmit={handleRecordDonationSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Donor Name</label>
                  <input
                    type="text"
                    disabled
                    value={donationForm.donorName}
                    className="w-full text-xs bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group</label>
                    <input
                      type="text"
                      disabled
                      value={donationForm.bloodGroup}
                      className="w-full text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Units Collected</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={donationForm.unitsDonated}
                      onChange={(e) => setDonationForm(prev => ({ ...prev, unitsDonated: Number(e.target.value) }))}
                      className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Component</label>
                  <input
                    type="text"
                    value={donationForm.component}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, component: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Laboratory Verification Notes</label>
                  <textarea
                    rows={2}
                    value={donationForm.notes}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Confirm & Issue Digital Certificate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
