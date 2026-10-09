export type UserRole = 'donor' | 'hospital' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status?: 'active' | 'suspended';
}

export interface DonorProfile {
  id: string;
  userId: string;
  bloodGroup: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  state: string;
  district: string;
  city: string;
  location: string;
  address: string;
  profilePhoto?: string;
  availabilityStatus: 'available' | 'unavailable';
  screeningStatus: 'screened' | 'pending_screening' | 'ineligible';
  screeningDetails?: {
    weightKg: number;
    hemoglobinGdl?: number;
    hasRecentTattooOrPiercing: boolean;
    hasMajorIllness: boolean;
    isTakingAntibiotics: boolean;
    isPregnantOrNursing?: boolean;
    screenedAt: string;
    clinicalDisclaimerAcknowledged: boolean;
  };
  lastDonationDate?: string;
  consentGiven: boolean;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalProfile {
  id: string;
  userId: string;
  hospitalName: string;
  licenseNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  district: string;
  city: string;
  postalCode: string;
  hasBloodBank: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  documents: {
    docType: string;
    docName: string;
    uploadedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface BloodInventoryItem {
  id: string;
  hospitalId: string;
  hospitalName: string;
  city: string;
  state: string;
  bloodGroup: string;
  component: string;
  unitsAvailable: number;
  collectionDate: string;
  expiryDate: string;
  storageLocation: string;
  stockStatus: 'available' | 'reserved' | 'expired' | 'low_stock';
  lastUpdated: string;
}

export interface RequestTimelineEvent {
  status: string;
  actor: string;
  actorRole: string;
  timestamp: string;
  comment: string;
}

export interface BloodRequest {
  id: string;
  refNumber: string;
  requesterType: 'hospital' | 'public';
  requesterId?: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  patientName: string;
  patientAge: number;
  hospitalId: string;
  hospitalName: string;
  bloodGroup: string;
  component: string;
  unitsNeeded: number;
  priority: 'Normal' | 'Urgent' | 'Critical Emergency';
  requiredBy: string;
  location: string;
  city: string;
  state: string;
  status:
    | 'Created'
    | 'Awaiting Hospital Review'
    | 'Accepted by Hospital'
    | 'Donor Outreach in Progress'
    | 'Appointment or Collection Coordination'
    | 'Fulfilled'
    | 'Rejected'
    | 'Cancelled'
    | 'Expired';
  notes?: string;
  statusTimeline: RequestTimelineEvent[];
  broadcastSentAt?: string;
  broadcastCount?: number;
  createdAt: string;
  updatedAt: string;
  isCompatible?: boolean;
  compatibilityNotes?: string;
  myResponse?: DonorResponse | null;
  totalResponses?: number;
  interestedCount?: number;
  responsesCount?: number;
}

export interface DonorResponse {
  id: string;
  requestId: string;
  donorId: string;
  donorUserId: string;
  donorName: string;
  donorBloodGroup: string;
  donorPhone: string;
  donorEmail: string;
  donorCity: string;
  status: 'Interested' | 'Unavailable' | 'Request more information';
  contactConsent: boolean;
  contactedByHospital: boolean;
  appointmentArranged: boolean;
  appointmentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  recipientUserId: string;
  recipientRole: string;
  title: string;
  message: string;
  type: 'broadcast' | 'request_update' | 'hospital_verified' | 'inventory_alert' | 'general';
  relatedRequestId?: string;
  read: boolean;
  createdAt: string;
}

export interface DonationRecord {
  id: string;
  donorId: string;
  donorName: string;
  hospitalId: string;
  hospitalName: string;
  bloodGroup: string;
  component: string;
  unitsDonated: number;
  donationDate: string;
  verifiedByStaffName: string;
  certificateId: string;
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface SystemStats {
  totalRequests: number;
  fulfilledRequests: number;
  availableInventoryUnits: number;
  verifiedHospitalsCount: number;
  activeDonorsCount: number;
  totalDonationCount: number;
}
