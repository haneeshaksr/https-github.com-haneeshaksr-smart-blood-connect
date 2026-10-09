import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BloodRequest, Notification, DonorProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ScreeningModal } from '../components/donor/ScreeningModal';
import { 
  Heart, User, MapPin, Calendar, Bell, Clock, CheckCircle2, 
  AlertCircle, ShieldCheck, ToggleLeft, ToggleRight, Search, 
  Check, Phone, Award, ExternalLink, Filter, MessageSquare
} from 'lucide-react';

interface DonorDashboardPageProps {
  navigate: (route: string) => void;
}

export const DonorDashboardPage: React.FC<DonorDashboardPageProps> = ({ navigate }) => {
  const { user, donorProfile, updateDonorProfileState, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'requests' | 'history' | 'notifications' | 'profile'>('requests');
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [historyData, setHistoryData] = useState<{ donations: any[]; responses: any[] }>({ donations: [], responses: [] });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCity, setFilterCity] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  // Screening Modal
  const [showScreeningModal, setShowScreeningModal] = useState(false);

  // Response Modal
  const [selectedReqForResponse, setSelectedReqForResponse] = useState<BloodRequest | null>(null);
  const [responseStatus, setResponseStatus] = useState<'Interested' | 'Unavailable' | 'Request more information'>('Interested');
  const [contactConsent, setContactConsent] = useState(true);
  const [responseNotes, setResponseNotes] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Profile Edit form states
  const [editProfileData, setEditProfileData] = useState({
    city: donorProfile?.city || '',
    state: donorProfile?.state || '',
    location: donorProfile?.location || '',
    address: donorProfile?.address || '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, notifRes, histRes] = await Promise.all([
        api.getMatchingRequests({
          city: filterCity || undefined,
          priority: filterPriority !== 'all' ? filterPriority : undefined
        }),
        api.getDonorNotifications(),
        api.getDonorHistory()
      ]);

      if (reqRes.success) setRequests(reqRes.data);
      if (notifRes.success) setNotifications(notifRes.data);
      if (histRes.success) setHistoryData(histRes.data);
    } catch (err) {
      console.error('Failed to load donor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCity, filterPriority]);

  const handleToggleAvailability = async () => {
    if (!donorProfile) return;
    const nextStatus = donorProfile.availabilityStatus === 'available' ? 'unavailable' : 'available';
    try {
      const res = await api.toggleDonorAvailability(nextStatus);
      if (res.success) {
        updateDonorProfileState({
          ...donorProfile,
          availabilityStatus: nextStatus as any
        });
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForResponse) return;
    setSubmittingResponse(true);

    try {
      const res = await api.respondToRequest({
        requestId: selectedReqForResponse.id,
        status: responseStatus,
        contactConsent,
        notes: responseNotes
      });

      if (res.success) {
        setSelectedReqForResponse(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to respond:', err);
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markDonorNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateDonorProfile(editProfileData);
      if (res.success && donorProfile) {
        updateDonorProfileState({
          ...donorProfile,
          ...editProfileData
        });
        alert('Profile location updated successfully.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!donorProfile) {
    return (
      <div className="min-h-screen bg-slate-50 p-12 text-center text-slate-600">
        Loading donor account profile...
      </div>
    );
  }

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 font-extrabold text-xl flex items-center justify-center border border-red-100 shadow-xs">
                {donorProfile.bloodGroup}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Welcome back, {user?.name}
                  </h1>
                  <span className="text-xs text-slate-500">
                    · Blood Group: <strong className="text-slate-900 font-bold">{donorProfile.bloodGroup}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{donorProfile.city}, {donorProfile.state}</span>
                  </span>
                  <span>·</span>
                  <StatusBadge status={donorProfile.screeningStatus} type="screening" />
                  <span>·</span>
                  <span>
                    Last Donated: {donorProfile.lastDonationDate ? new Date(donorProfile.lastDonationDate).toLocaleDateString() : 'None recorded'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Availability Switch & Screening CTA */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl px-3 text-xs">
                <span className="text-slate-600 font-medium">Availability:</span>
                <button
                  onClick={handleToggleAvailability}
                  className={`font-semibold cursor-pointer px-2 py-0.5 rounded transition-colors ${
                    donorProfile.availabilityStatus === 'available'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {donorProfile.availabilityStatus === 'available' ? 'Available for Contact' : 'Not Available'}
                </button>
              </div>

              {donorProfile.screeningStatus !== 'screened' && (
                <button
                  onClick={() => setShowScreeningModal(true)}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Complete Screening</span>
                </button>
              )}
            </div>

          </div>

          {/* Profile Completion Bar */}
          {!donorProfile.isProfileComplete && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Your profile is incomplete. Please complete the preliminary health screening questionnaire.</span>
              </div>
              <button
                onClick={() => setShowScreeningModal(true)}
                className="text-amber-700 font-bold hover:underline cursor-pointer"
              >
                Start Screening Now →
              </button>
            </div>
          )}
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 pb-px text-xs font-semibold">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-white border border-b-0 border-slate-200 text-red-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Matching Blood Requests</span>
            <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-md">
              {requests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'bg-white border border-b-0 border-slate-200 text-red-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
            {unreadNotifsCount > 0 && (
              <span className="font-mono text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded-md">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-white border border-b-0 border-slate-200 text-red-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Donation History & Certificates</span>
            <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-md">
              {historyData.donations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-white border border-b-0 border-slate-200 text-red-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Screening Details</span>
          </button>
        </div>

        {/* Tab 1: Matching Blood Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-600">Filter By:</span>
                </div>

                <input
                  type="text"
                  placeholder="City (e.g. San Francisco)"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                />

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="all">All Urgency Levels</option>
                  <option value="Critical Emergency">Critical Emergency</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              <div className="text-slate-500">
                Contact privacy protected. Phone & email shared only upon responding.
              </div>
            </div>

            {loading ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
                Searching matching clinical requisitions...
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="font-semibold text-slate-900">No Active Urgent Shortages in Your Area</div>
                <p className="max-w-md mx-auto text-slate-500">
                  There are currently no open requisitions matching your blood group. You will be alerted via notification when an outreach broadcast is created.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map(req => {
                  const hasResponded = Boolean(req.myResponse);

                  return (
                    <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-slate-900">{req.refNumber}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              req.priority === 'Critical Emergency' ? 'bg-red-100 text-red-700' : req.priority === 'Urgent' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {req.priority}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-800">{req.hospitalName}</div>
                          <div className="text-[11px] text-slate-500">{req.city}, {req.state}</div>
                        </div>

                        <div className="text-right">
                          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 font-extrabold text-sm flex items-center justify-center border border-red-100 ml-auto">
                            {req.bloodGroup}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-1">{req.unitsNeeded} Units</div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Component:</span>
                          <span className="font-medium">{req.component}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Needed By:</span>
                          <span className="font-mono text-[11px] text-slate-900">
                            {new Date(req.requiredBy).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Workflow Status:</span>
                          <StatusBadge status={req.status} type="request" />
                        </div>
                        {req.compatibilityNotes && (
                          <div className="pt-1 text-[11px] text-slate-500 italic">
                            {req.compatibilityNotes}
                          </div>
                        )}
                      </div>

                      {/* Donor Response State */}
                      <div className="pt-1 flex items-center justify-between">
                        {hasResponded ? (
                          <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                            <Check className="w-4 h-4" />
                            <span>Responded: {req.myResponse?.status} ({req.myResponse?.contactConsent ? 'Consent Granted' : 'No Consent'})</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedReqForResponse(req)}
                            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                          >
                            Respond to Request
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
            <div className="p-5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">In-App Broadcast Notifications</h2>
              <span className="text-xs text-slate-400 font-mono">{notifications.length} alerts</span>
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No notifications logged yet.
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-5 flex items-start justify-between gap-4 ${!n.read ? 'bg-red-50/30' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{n.title}</span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      <div className="text-[10px] text-slate-400 mt-2 font-mono">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => handleMarkNotificationRead(n.id)}
                      className="text-xs text-slate-500 hover:text-slate-900 font-medium shrink-0 cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: History & Certificates */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4">
                Verified Blood Donation Records & Certificates
              </h2>

              {historyData.donations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No completed donations verified in the medical database yet. Once you complete a clinical donation at a verified hospital, your certified record will appear here.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {historyData.donations.map(don => (
                    <div key={don.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{don.hospitalName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">Cert: {don.certificateId}</div>
                        </div>
                        <Award className="w-6 h-6 text-amber-500" />
                      </div>

                      <div className="text-xs text-slate-700 space-y-1">
                        <div>Units Donated: <strong>{don.unitsDonated} Unit ({don.component})</strong></div>
                        <div>Date: <span className="font-mono">{new Date(don.donationDate).toLocaleDateString()}</span></div>
                        <div>Verified by: <span>{don.verifiedByStaffName}</span></div>
                      </div>

                      <div className="pt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Transfusion Laboratory Certified</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Request Responses */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4">
                My Responses to Emergency Requests
              </h2>

              {historyData.responses.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  You haven't responded to any blood requests yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {historyData.responses.map(resp => (
                    <div key={resp.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">Request ID: {resp.requestId}</div>
                        <div className="text-[11px] text-slate-500">
                          Response: <strong className="text-slate-800">{resp.status}</strong> · Consent: {resp.contactConsent ? 'Granted' : 'Protected'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-slate-500 font-mono">
                          {new Date(resp.createdAt).toLocaleDateString()}
                        </div>
                        {resp.appointmentArranged && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                            Appointment Arranged
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Profile Details */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-2xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Donor Profile & Location Settings</h2>
              <p className="text-xs text-slate-600 mt-1">
                Update your geographic coordinates for emergency outreach proximity calculations.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editProfileData.city}
                    onChange={(e) => setEditProfileData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editProfileData.state}
                    onChange={(e) => setEditProfileData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Area / Neighborhood</label>
                <input
                  type="text"
                  value={editProfileData.location}
                  onChange={(e) => setEditProfileData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Respond to Request Modal */}
        {selectedReqForResponse && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Respond to Request {selectedReqForResponse.refNumber}
              </h3>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div>Hospital: <strong className="text-slate-900">{selectedReqForResponse.hospitalName}</strong></div>
                <div>Blood Group: <strong className="text-red-600">{selectedReqForResponse.bloodGroup}</strong> ({selectedReqForResponse.component})</div>
                <div>Urgency: <span className="font-semibold">{selectedReqForResponse.priority}</span></div>
              </div>

              <form onSubmit={handleResponseSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Your Availability Status *</label>
                  <select
                    value={responseStatus}
                    onChange={(e) => setResponseStatus(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="Interested">Interested (I can donate)</option>
                    <option value="Unavailable">Unavailable right now</option>
                    <option value="Request more information">Request more information</option>
                  </select>
                </div>

                <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={contactConsent}
                      onChange={(e) => setContactConsent(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-red-600"
                    />
                    <span>
                      I consent to share my verified phone number and email with {selectedReqForResponse.hospitalName} coordination staff for this donation only.
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Optional Note for Hospital</label>
                  <input
                    type="text"
                    placeholder="e.g. Can arrive tomorrow after 10 AM"
                    value={responseNotes}
                    onChange={(e) => setResponseNotes(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReqForResponse(null)}
                    className="py-2 px-3 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingResponse}
                    className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    {submittingResponse ? 'Submitting...' : 'Send Response'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Screening Questionnaire Modal */}
        <ScreeningModal
          profile={donorProfile}
          isOpen={showScreeningModal}
          onClose={() => setShowScreeningModal(false)}
          onCompleted={(updatedProfile) => {
            updateDonorProfileState(updatedProfile);
            setShowScreeningModal(false);
          }}
        />

      </div>
    </div>
  );
};
