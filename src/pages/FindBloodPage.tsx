import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BloodInventoryItem, BloodRequest } from '../types';
import { 
  Search, Droplets, MapPin, Building2, AlertCircle, CheckCircle2, 
  Clock, ShieldCheck, ArrowRight, Filter, AlertTriangle, PlusCircle, X
} from 'lucide-react';

interface FindBloodPageProps {
  navigate: (route: string) => void;
  initialBloodGroup?: string;
  initialCity?: string;
}

export const FindBloodPage: React.FC<FindBloodPageProps> = ({ 
  navigate, 
  initialBloodGroup = 'O-', 
  initialCity = '' 
}) => {
  const [bloodGroup, setBloodGroup] = useState(initialBloodGroup);
  const [city, setCity] = useState(initialCity);
  const [component, setComponent] = useState('all');
  const [includeCompatible, setIncludeCompatible] = useState(true);

  const [exactMatches, setExactMatches] = useState<BloodInventoryItem[]>([]);
  const [compatibleMatches, setCompatibleMatches] = useState<BloodInventoryItem[]>([]);
  const [totalExactUnits, setTotalExactUnits] = useState(0);
  const [totalCompatibleUnits, setTotalCompatibleUnits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Emergency Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [verifiedHospitals, setVerifiedHospitals] = useState<any[]>([]);
  const [requestSubmitted, setRequestSubmitted] = useState<BloodRequest | null>(null);
  const [submittingReq, setSubmittingReq] = useState(false);
  const [reqForm, setReqForm] = useState({
    requesterName: '',
    requesterPhone: '',
    requesterEmail: '',
    patientName: '',
    patientAge: 35,
    hospitalId: '',
    bloodGroup: 'O-',
    component: 'Red Blood Cells (PRBC)',
    unitsNeeded: 2,
    priority: 'Urgent',
    notes: ''
  });

  const bloodGroups = ['all', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const componentsList = [
    { label: 'All Components', value: 'all' },
    { label: 'Red Blood Cells (PRBC)', value: 'Red Blood Cells (PRBC)' },
    { label: 'Whole Blood', value: 'Whole Blood' },
    { label: 'Platelets', value: 'Platelets' },
    { label: 'Fresh Frozen Plasma (FFP)', value: 'Fresh Frozen Plasma (FFP)' },
    { label: 'Cryoprecipitate', value: 'Cryoprecipitate' }
  ];

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.findBlood({
        bloodGroup: bloodGroup !== 'all' ? bloodGroup : undefined,
        city: city.trim() || undefined,
        component: component !== 'all' ? component : undefined,
        includeCompatible
      });

      if (res.success) {
        setExactMatches(res.data.exactMatches);
        setCompatibleMatches(res.data.compatibleMatches);
        setTotalExactUnits(res.data.totalExactUnits);
        setTotalCompatibleUnits(res.data.totalCompatibleUnits);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search blood inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    api.getVerifiedHospitals().then(res => {
      if (res.success && res.data.length > 0) {
        setVerifiedHospitals(res.data);
        setReqForm(prev => ({ ...prev, hospitalId: res.data[0].id, bloodGroup }));
      }
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReq(true);
    setError('');
    try {
      const res = await api.createPublicRequest(reqForm);
      if (res.success) {
        setRequestSubmitted(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to file requisition.');
    } finally {
      setSubmittingReq(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Search Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Verified Blood Inventory Search
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Real-time non-expired inventory logged by verified hospital laboratories across the network.
              </p>
            </div>
            
            <button
              onClick={() => {
                setRequestSubmitted(null);
                setShowRequestModal(true);
              }}
              className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Emergency Requisition</span>
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {bloodGroups.map(bg => (
                  <option key={bg} value={bg}>{bg === 'all' ? 'All Blood Groups' : bg}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Component Type
              </label>
              <select
                value={component}
                onChange={(e) => setComponent(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {componentsList.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. San Francisco"
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer h-[38px]"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Compatibility toggle */}
          {bloodGroup !== 'all' && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={includeCompatible}
                  onChange={(e) => setIncludeCompatible(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>Include medically compatible donor blood groups (based on ABO/Rh compatibility)</span>
              </label>

              <div className="text-xs text-slate-500">
                Found: <strong className="text-slate-900 font-mono tabular-nums">{totalExactUnits}</strong> exact units · <strong className="text-slate-900 font-mono tabular-nums">{totalCompatibleUnits}</strong> compatible units
              </div>
            </div>
          )}
        </div>

        {/* Clinical Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Laboratory Verification Notice: </span>
            Inventory listings show verified units stored under monitored cold-chain protocols. Transfusion eligibility requires clinical crossmatching and authorization by the receiving hospital hematology staff.
          </div>
        </div>

        {/* Results Sections */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
            Searching verified hospital databases...
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* 1. Exact Matches */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Exact Blood Group Matches</span>
                  {bloodGroup !== 'all' && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {bloodGroup}
                    </span>
                  )}
                </h2>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {exactMatches.length} batch records found
                </span>
              </div>

              {exactMatches.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    No verified stock currently available for exact match
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    There are no unreserved units matching this exact specification. You can check medically compatible alternatives below or submit a targeted donor outreach request.
                  </p>
                  <button
                    onClick={() => {
                      setRequestSubmitted(null);
                      setShowRequestModal(true);
                    }}
                    className="mt-2 py-2 px-4 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Request Donor Outreach
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exactMatches.map(item => (
                    <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 font-extrabold flex items-center justify-center text-sm border border-red-100">
                            {item.bloodGroup}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{item.component}</div>
                            <div className="text-[11px] text-slate-500">{item.hospitalName}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-black text-slate-900 font-mono tabular-nums">
                            {item.unitsAvailable}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase font-medium">Units</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Location:</span>
                          <span className="font-medium">{item.city}, {item.state}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Storage:</span>
                          <span className="font-mono text-[11px]">{item.storageLocation}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Expires:</span>
                          <span className="font-mono text-[11px] text-slate-900 font-medium">
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setReqForm(prev => ({
                              ...prev,
                              hospitalId: item.hospitalId,
                              bloodGroup: item.bloodGroup,
                              component: item.component
                            }));
                            setRequestSubmitted(null);
                            setShowRequestModal(true);
                          }}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Request from this Hospital
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Medically Compatible Matches */}
            {includeCompatible && bloodGroup !== 'all' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Medically Compatible Stock for {bloodGroup} Recipient
                    </h2>
                    <p className="text-xs text-slate-500">
                      Units from medically acceptable alternative blood groups based on cellular antigen rules.
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    {compatibleMatches.length} batches
                  </span>
                </div>

                {compatibleMatches.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-500">
                    No compatible alternate blood group units recorded.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {compatibleMatches.map(item => (
                      <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center text-sm border border-slate-200">
                              {item.bloodGroup}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{item.component}</div>
                              <div className="text-[11px] text-slate-500">{item.hospitalName}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-black text-slate-900 font-mono tabular-nums">
                              {item.unitsAvailable}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-medium">Units</div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Match Compatibility:</span>
                            <span className="text-emerald-700 font-semibold">Clinically Compatible</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Expires:</span>
                            <span className="font-mono text-[11px]">
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => {
                              setReqForm(prev => ({
                                ...prev,
                                hospitalId: item.hospitalId,
                                bloodGroup: item.bloodGroup,
                                component: item.component
                              }));
                              setRequestSubmitted(null);
                              setShowRequestModal(true);
                            }}
                            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Requisition Compatible Unit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* Emergency Requisition Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative my-8">
              
              <button
                onClick={() => setShowRequestModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {requestSubmitted ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Emergency Blood Requisition Logged
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500">Reference Number: </span>
                      <strong className="text-slate-900 font-mono">{requestSubmitted.refNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Hospital Assigned: </span>
                      <strong className="text-slate-900">{requestSubmitted.hospitalName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Workflow Status: </span>
                      <span className="text-amber-700 font-semibold">{requestSubmitted.status}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    Your request has been routed directly to the blood bank emergency coordinator at {requestSubmitted.hospitalName}. They will verify clinical indication and reserve units or broadcast to donors.
                  </p>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="w-full py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Submit Clinical Blood Requisition
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Directly notify hospital blood bank coordinators for emergency patient needs.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleRequestSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={reqForm.requesterName}
                          onChange={(e) => setReqForm(prev => ({ ...prev, requesterName: e.target.value }))}
                          placeholder="e.g. Eleanor Vance"
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone *</label>
                        <input
                          type="tel"
                          required
                          value={reqForm.requesterPhone}
                          onChange={(e) => setReqForm(prev => ({ ...prev, requesterPhone: e.target.value }))}
                          placeholder="+1 (555) 000-0000"
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Patient Full Name *</label>
                        <input
                          type="text"
                          required
                          value={reqForm.patientName}
                          onChange={(e) => setReqForm(prev => ({ ...prev, patientName: e.target.value }))}
                          placeholder="Patient Name"
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Patient Age</label>
                        <input
                          type="number"
                          value={reqForm.patientAge}
                          onChange={(e) => setReqForm(prev => ({ ...prev, patientAge: Number(e.target.value) }))}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Receiving Hospital Center *</label>
                      <select
                        value={reqForm.hospitalId}
                        onChange={(e) => setReqForm(prev => ({ ...prev, hospitalId: e.target.value }))}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {verifiedHospitals.map(h => (
                          <option key={h.id} value={h.id}>{h.hospitalName} ({h.city})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group *</label>
                        <select
                          value={reqForm.bloodGroup}
                          onChange={(e) => setReqForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                          className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Component</label>
                        <select
                          value={reqForm.component}
                          onChange={(e) => setReqForm(prev => ({ ...prev, component: e.target.value }))}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Red Blood Cells (PRBC)">RBC (PRBC)</option>
                          <option value="Whole Blood">Whole Blood</option>
                          <option value="Platelets">Platelets</option>
                          <option value="Fresh Frozen Plasma (FFP)">Plasma (FFP)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Units Needed</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={reqForm.unitsNeeded}
                          onChange={(e) => setReqForm(prev => ({ ...prev, unitsNeeded: Number(e.target.value) }))}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Priority Urgency</label>
                      <select
                        value={reqForm.priority}
                        onChange={(e) => setReqForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="Normal">Normal (Elective / Scheduled)</option>
                        <option value="Urgent">Urgent (Needed within 24h)</option>
                        <option value="Critical Emergency">Critical Emergency (Immediate Trauma)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Clinical Notes / Diagnosis</label>
                      <textarea
                        rows={2}
                        value={reqForm.notes}
                        onChange={(e) => setReqForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="e.g. Scheduled surgery or acute internal hemorrhage"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submittingReq}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        {submittingReq ? 'Filing Requisition...' : 'Submit Emergency Requisition'}
                      </button>
                    </div>
                  </form>
                </>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
