import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'donor' | 'hospital' | 'admin';
  name: string;
  phone: string;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
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

// In-Memory Database store with optional MongoDB Atlas persistence sync
class DatabaseStore {
  users: User[] = [];
  donorProfiles: DonorProfile[] = [];
  hospitalProfiles: HospitalProfile[] = [];
  bloodInventory: BloodInventoryItem[] = [];
  bloodRequests: BloodRequest[] = [];
  donorResponses: DonorResponse[] = [];
  notifications: Notification[] = [];
  donationRecords: DonationRecord[] = [];
  auditLogs: AuditLog[] = [];
  private initialized = false;

  async init() {
    if (this.initialized) return;

    await this.seedInitialData();
    this.initialized = true;
    console.log('[Database] Smart Blood Connect database initialized with verified medical dataset.');
  }

  private async seedInitialData() {
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password@123', salt);

    // 1. Admin User
    const adminUser: User = {
      id: 'usr_admin_01',
      email: 'admin@smartblood.org',
      passwordHash: defaultPasswordHash,
      role: 'admin',
      name: 'System Medical Director',
      phone: '+1 (800) 555-0199',
      status: 'active',
      createdAt: '2026-01-10T08:00:00Z',
      updatedAt: '2026-01-10T08:00:00Z',
    };

    // 2. Verified Hospital User
    const hospUser1: User = {
      id: 'usr_hosp_01',
      email: 'bloodbank@metrohealth.org',
      passwordHash: defaultPasswordHash,
      role: 'hospital',
      name: 'Metro Health General Hospital',
      phone: '+1 (555) 234-5678',
      status: 'active',
      createdAt: '2026-01-15T09:30:00Z',
      updatedAt: '2026-01-15T09:30:00Z',
    };

    const hospProfile1: HospitalProfile = {
      id: 'hosp_prof_01',
      userId: hospUser1.id,
      hospitalName: 'Metro Health General Hospital',
      licenseNumber: 'LIC-MED-2024-9981',
      contactPerson: 'Dr. Rebecca Stone (Blood Bank In-Charge)',
      email: 'bloodbank@metrohealth.org',
      phone: '+1 (555) 234-5678',
      address: '742 Healthcare Parkway, Building C',
      state: 'California',
      district: 'San Francisco County',
      city: 'San Francisco',
      postalCode: '94107',
      hasBloodBank: true,
      verificationStatus: 'verified',
      verificationNotes: 'Licensed tertiary clinical center verified by State Medical Board.',
      verifiedAt: '2026-01-16T10:00:00Z',
      verifiedBy: 'usr_admin_01',
      documents: [
        { docType: 'Clinical License', docName: 'State_Medical_License_2026.pdf', uploadedAt: '2026-01-15T09:35:00Z' },
        { docType: 'Blood Bank Certification', docName: 'AABB_Certification_9981.pdf', uploadedAt: '2026-01-15T09:35:00Z' }
      ],
      createdAt: '2026-01-15T09:30:00Z',
      updatedAt: '2026-01-16T10:00:00Z'
    };

    // 3. Second Hospital (Pending Verification)
    const hospUser2: User = {
      id: 'usr_hosp_02',
      email: 'director@stjude-clinic.org',
      passwordHash: defaultPasswordHash,
      role: 'hospital',
      name: 'St. Jude Community Hospital',
      phone: '+1 (555) 345-6789',
      status: 'active',
      createdAt: '2026-02-01T11:00:00Z',
      updatedAt: '2026-02-01T11:00:00Z',
    };

    const hospProfile2: HospitalProfile = {
      id: 'hosp_prof_02',
      userId: hospUser2.id,
      hospitalName: 'St. Jude Community Hospital',
      licenseNumber: 'LIC-MED-2025-1044',
      contactPerson: 'Michael Chang (Operations Lead)',
      email: 'director@stjude-clinic.org',
      phone: '+1 (555) 345-6789',
      address: '120 Mission Bay Boulevard',
      state: 'California',
      district: 'San Francisco County',
      city: 'San Francisco',
      postalCode: '94158',
      hasBloodBank: false,
      verificationStatus: 'pending',
      verificationNotes: 'Pending credential review and license validation by Medical Board supervisor.',
      documents: [
        { docType: 'Hospital Charter', docName: 'Hospital_Registration_2025.pdf', uploadedAt: '2026-02-01T11:05:00Z' }
      ],
      createdAt: '2026-02-01T11:00:00Z',
      updatedAt: '2026-02-01T11:00:00Z'
    };

    // 4. Third Hospital (Apex Trauma Center, Verified)
    const hospUser3: User = {
      id: 'usr_hosp_03',
      email: 'emergency@apextrauma.org',
      passwordHash: defaultPasswordHash,
      role: 'hospital',
      name: 'Apex Trauma & Surgical Center',
      phone: '+1 (555) 456-7890',
      status: 'active',
      createdAt: '2026-01-20T14:00:00Z',
      updatedAt: '2026-01-20T14:00:00Z',
    };

    const hospProfile3: HospitalProfile = {
      id: 'hosp_prof_03',
      userId: hospUser3.id,
      hospitalName: 'Apex Trauma & Surgical Center',
      licenseNumber: 'LIC-MED-2023-7729',
      contactPerson: 'Dr. Sarah Jenkins (Trauma Chief)',
      email: 'emergency@apextrauma.org',
      phone: '+1 (555) 456-7890',
      address: '500 Parnassus Ave',
      state: 'California',
      district: 'San Francisco County',
      city: 'San Francisco',
      postalCode: '94143',
      hasBloodBank: true,
      verificationStatus: 'verified',
      verificationNotes: 'Level-1 trauma center verified.',
      verifiedAt: '2026-01-21T09:00:00Z',
      verifiedBy: 'usr_admin_01',
      documents: [
        { docType: 'Accreditation', docName: 'Trauma_Level1_Cert.pdf', uploadedAt: '2026-01-20T14:10:00Z' }
      ],
      createdAt: '2026-01-20T14:00:00Z',
      updatedAt: '2026-01-21T09:00:00Z'
    };

    // 5. Donor Users
    const donorUser1: User = {
      id: 'usr_donor_01',
      email: 'sarah.donor@example.com',
      passwordHash: defaultPasswordHash,
      role: 'donor',
      name: 'Sarah Lindqvist',
      phone: '+1 (555) 889-1022',
      status: 'active',
      createdAt: '2026-01-18T10:00:00Z',
      updatedAt: '2026-01-18T10:00:00Z',
    };

    const donorProfile1: DonorProfile = {
      id: 'donor_prof_01',
      userId: donorUser1.id,
      bloodGroup: 'O-',
      dob: '1995-04-12',
      gender: 'Female',
      state: 'California',
      district: 'San Francisco County',
      city: 'San Francisco',
      location: 'SOMA / Downtown',
      address: '450 4th Street, Apt 3B',
      availabilityStatus: 'available',
      screeningStatus: 'screened',
      screeningDetails: {
        weightKg: 64,
        hemoglobinGdl: 13.8,
        hasRecentTattooOrPiercing: false,
        hasMajorIllness: false,
        isTakingAntibiotics: false,
        isPregnantOrNursing: false,
        screenedAt: '2026-01-18T10:30:00Z',
        clinicalDisclaimerAcknowledged: true
      },
      lastDonationDate: '2025-11-10',
      consentGiven: true,
      isProfileComplete: true,
      createdAt: '2026-01-18T10:00:00Z',
      updatedAt: '2026-01-18T10:30:00Z'
    };

    const donorUser2: User = {
      id: 'usr_donor_02',
      email: 'alex.rivera@example.com',
      passwordHash: defaultPasswordHash,
      role: 'donor',
      name: 'Alex Rivera',
      phone: '+1 (555) 774-2910',
      status: 'active',
      createdAt: '2026-01-22T14:00:00Z',
      updatedAt: '2026-01-22T14:00:00Z',
    };

    const donorProfile2: DonorProfile = {
      id: 'donor_prof_02',
      userId: donorUser2.id,
      bloodGroup: 'A+',
      dob: '1992-09-28',
      gender: 'Male',
      state: 'California',
      district: 'San Francisco County',
      city: 'San Francisco',
      location: 'Mission District',
      address: '2200 Mission St',
      availabilityStatus: 'available',
      screeningStatus: 'screened',
      screeningDetails: {
        weightKg: 78,
        hemoglobinGdl: 15.2,
        hasRecentTattooOrPiercing: false,
        hasMajorIllness: false,
        isTakingAntibiotics: false,
        screenedAt: '2026-01-22T14:20:00Z',
        clinicalDisclaimerAcknowledged: true
      },
      lastDonationDate: '2025-12-05',
      consentGiven: true,
      isProfileComplete: true,
      createdAt: '2026-01-22T14:00:00Z',
      updatedAt: '2026-01-22T14:20:00Z'
    };

    const donorUser3: User = {
      id: 'usr_donor_03',
      email: 'elena.rostova@example.com',
      passwordHash: defaultPasswordHash,
      role: 'donor',
      name: 'Elena Rostova',
      phone: '+1 (555) 662-8193',
      status: 'active',
      createdAt: '2026-02-05T09:00:00Z',
      updatedAt: '2026-02-05T09:00:00Z',
    };

    const donorProfile3: DonorProfile = {
      id: 'donor_prof_03',
      userId: donorUser3.id,
      bloodGroup: 'B+',
      dob: '1998-11-15',
      gender: 'Female',
      state: 'California',
      district: 'San Francisco County',
      city: 'San Francisco',
      location: 'Marina District',
      address: '1850 Chestnut St',
      availabilityStatus: 'available',
      screeningStatus: 'pending_screening',
      consentGiven: true,
      isProfileComplete: false,
      createdAt: '2026-02-05T09:00:00Z',
      updatedAt: '2026-02-05T09:00:00Z'
    };

    this.users = [adminUser, hospUser1, hospUser2, hospUser3, donorUser1, donorUser2, donorUser3];
    this.donorProfiles = [donorProfile1, donorProfile2, donorProfile3];
    this.hospitalProfiles = [hospProfile1, hospProfile2, hospProfile3];

    // 6. Blood Inventory records (Verified hospital stock, with realistic dates and non-expired calculation)
    const now = new Date();
    const plusDays = (days: number) => {
      const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      return d.toISOString();
    };
    const minusDays = (days: number) => {
      const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      return d.toISOString();
    };

    this.bloodInventory = [
      {
        id: 'inv_01',
        hospitalId: hospProfile1.id,
        hospitalName: hospProfile1.hospitalName,
        city: 'San Francisco',
        state: 'California',
        bloodGroup: 'O-',
        component: 'Red Blood Cells (PRBC)',
        unitsAvailable: 8,
        collectionDate: minusDays(8),
        expiryDate: plusDays(27),
        storageLocation: 'Cold Vault 2, Rack A-1',
        stockStatus: 'available',
        lastUpdated: minusDays(1)
      },
      {
        id: 'inv_02',
        hospitalId: hospProfile1.id,
        hospitalName: hospProfile1.hospitalName,
        city: 'San Francisco',
        state: 'California',
        bloodGroup: 'O+',
        component: 'Red Blood Cells (PRBC)',
        unitsAvailable: 19,
        collectionDate: minusDays(4),
        expiryDate: plusDays(31),
        storageLocation: 'Cold Vault 1, Rack B-3',
        stockStatus: 'available',
        lastUpdated: minusDays(1)
      },
      {
        id: 'inv_03',
        hospitalId: hospProfile1.id,
        hospitalName: hospProfile1.hospitalName,
        city: 'San Francisco',
        state: 'California',
        bloodGroup: 'A+',
        component: 'Whole Blood',
        unitsAvailable: 14,
        collectionDate: minusDays(6),
        expiryDate: plusDays(29),
        storageLocation: 'Cold Vault 1, Rack C-2',
        stockStatus: 'available',
        lastUpdated: minusDays(2)
      },
      {
        id: 'inv_04',
        hospitalId: hospProfile1.id,
        hospitalName: hospProfile1.hospitalName,
        city: 'San Francisco',
        state: 'California',
        bloodGroup: 'A-',
        component: 'Platelets',
        unitsAvailable: 2,
        collectionDate: minusDays(2),
        expiryDate: plusDays(3),
        storageLocation: 'Agitator Unit 1, Tray 4',
        stockStatus: 'low_stock',
        lastUpdated: minusDays(1)
      },
      {
        id: 'inv_05',
        hospitalId: hospProfile1.id,
        hospitalName: hospProfile1.hospitalName,
        city: 'San Francisco',
        state: 'California',
        bloodGroup: 'B+',
        component: 'Fresh Frozen Plasma (FFP)',
        unitsAvailable: 11,
        collectionDate: minusDays(30),
        expiryDate: plusDays(335),
        storageLocation: 'Cryo-Freezer -30C, Rack P-1',
        stockStatus: 'available',
        lastUpdated: minusDays(3)
      },
      {
        id: 'inv_06',
        hospitalId: hospProfile3.id,
        hospitalName: hospProfile3.hospitalName,
        city: 'San Francisco',
        state: 'California',
        bloodGroup: 'O-',
        component: 'Whole Blood',
        unitsAvailable: 4,
        collectionDate: minusDays(12),
        expiryDate: plusDays(23),
        storageLocation: 'Trauma Reserve Cabinet T-1',
        stockStatus: 'low_stock',
        lastUpdated: minusDays(1)
      },
      {
        id: 'inv_07',
        hospitalId: hospProfile3.id,
        hospitalName: hospProfile3.hospitalName,
        city: 'San Francisco',
        state: 'California',
        bloodGroup: 'AB+',
        component: 'Red Blood Cells (PRBC)',
        unitsAvailable: 7,
        collectionDate: minusDays(5),
        expiryDate: plusDays(30),
        storageLocation: 'Main Cold Store, Rack D-5',
        stockStatus: 'available',
        lastUpdated: minusDays(2)
      },
      {
        id: 'inv_08',
        hospitalId: hospProfile1.id,
        hospitalName: hospProfile1.hospitalName,
        city: 'San Francisco',
        state: 'California',
        bloodGroup: 'B-',
        component: 'Platelets',
        unitsAvailable: 0,
        collectionDate: minusDays(7),
        expiryDate: minusDays(1), // EXPIRED UNIT to test automatic expiry calculation
        storageLocation: 'Quarantine Disposal Bin',
        stockStatus: 'expired',
        lastUpdated: minusDays(1)
      }
    ];

    // 7. Blood Requests with status workflow and timelines
    this.bloodRequests = [
      {
        id: 'req_01',
        refNumber: 'REQ-2026-8910',
        requesterType: 'hospital',
        requesterId: hospProfile1.id,
        requesterName: 'Dr. Rebecca Stone',
        requesterPhone: '+1 (555) 234-5678',
        requesterEmail: 'bloodbank@metrohealth.org',
        patientName: 'David Mercer',
        patientAge: 44,
        hospitalId: hospProfile1.id,
        hospitalName: 'Metro Health General Hospital',
        bloodGroup: 'O-',
        component: 'Red Blood Cells (PRBC)',
        unitsNeeded: 3,
        priority: 'Urgent',
        requiredBy: plusDays(1),
        location: 'ICU Surgical Bay 4',
        city: 'San Francisco',
        state: 'California',
        status: 'Donor Outreach in Progress',
        notes: 'Pre-scheduled aortic valve repair procedure with anticipated transfusion requirement.',
        broadcastSentAt: minusDays(1),
        broadcastCount: 1,
        statusTimeline: [
          {
            status: 'Created',
            actor: 'Dr. Rebecca Stone',
            actorRole: 'hospital',
            timestamp: minusDays(1),
            comment: 'Emergency blood request created for scheduled surgery.'
          },
          {
            status: 'Accepted by Hospital',
            actor: 'Blood Bank Verification Staff',
            actorRole: 'hospital',
            timestamp: minusDays(1),
            comment: 'Hospital hematology team accepted request, verified local inventory shortfall.'
          },
          {
            status: 'Donor Outreach in Progress',
            actor: 'Dr. Rebecca Stone',
            actorRole: 'hospital',
            timestamp: minusDays(1),
            comment: 'Automated targeted broadcast sent to matching O- registered eligible donors.'
          }
        ],
        createdAt: minusDays(1),
        updatedAt: minusDays(1)
      },
      {
        id: 'req_02',
        refNumber: 'REQ-2026-9021',
        requesterType: 'hospital',
        requesterId: hospProfile3.id,
        requesterName: 'Dr. Sarah Jenkins',
        requesterPhone: '+1 (555) 456-7890',
        requesterEmail: 'emergency@apextrauma.org',
        patientName: 'Liam Morales',
        patientAge: 29,
        hospitalId: hospProfile3.id,
        hospitalName: 'Apex Trauma & Surgical Center',
        bloodGroup: 'A+',
        component: 'Whole Blood',
        unitsNeeded: 2,
        priority: 'Normal',
        requiredBy: plusDays(3),
        location: 'Orthopedic Ward 2',
        city: 'San Francisco',
        state: 'California',
        status: 'Appointment or Collection Coordination',
        notes: 'Femoral reconstruction planned. Patient crossmatch requested.',
        statusTimeline: [
          {
            status: 'Created',
            actor: 'Dr. Sarah Jenkins',
            actorRole: 'hospital',
            timestamp: minusDays(2),
            comment: 'Elective surgical request initiated.'
          },
          {
            status: 'Accepted by Hospital',
            actor: 'Apex Blood Transfusion Committee',
            actorRole: 'hospital',
            timestamp: minusDays(2),
            comment: 'Request accepted by blood bank head.'
          },
          {
            status: 'Appointment or Collection Coordination',
            actor: 'Nurse Coordinator',
            actorRole: 'hospital',
            timestamp: minusDays(1),
            comment: 'Donor matched and phone appointment scheduled for screening.'
          }
        ],
        createdAt: minusDays(2),
        updatedAt: minusDays(1)
      },
      {
        id: 'req_03',
        refNumber: 'REQ-2026-9114',
        requesterType: 'public',
        requesterName: 'Eleanor Vance (Family Representative)',
        requesterPhone: '+1 (555) 912-3401',
        requesterEmail: 'eleanor.vance@example.com',
        patientName: 'Arthur Vance',
        patientAge: 62,
        hospitalId: hospProfile1.id,
        hospitalName: 'Metro Health General Hospital',
        bloodGroup: 'B+',
        component: 'Platelets',
        unitsNeeded: 2,
        priority: 'Critical Emergency',
        requiredBy: plusDays(1),
        location: 'Oncology Unit 3',
        city: 'San Francisco',
        state: 'California',
        status: 'Fulfilled',
        notes: 'Post-chemotherapy severe thrombocytopenia.',
        statusTimeline: [
          {
            status: 'Created',
            actor: 'Eleanor Vance',
            actorRole: 'public',
            timestamp: minusDays(4),
            comment: 'Public emergency request submitted for family member.'
          },
          {
            status: 'Accepted by Hospital',
            actor: 'Blood Bank On-Call Officer',
            actorRole: 'hospital',
            timestamp: minusDays(4),
            comment: 'Hospital verified medical indication and reserved inventory.'
          },
          {
            status: 'Fulfilled',
            actor: 'Blood Bank Laboratory Tech',
            actorRole: 'hospital',
            timestamp: minusDays(3),
            comment: '2 units of verified crossmatched platelets issued and transfused safely.'
          }
        ],
        createdAt: minusDays(4),
        updatedAt: minusDays(3)
      }
    ];

    // 8. Donor Responses
    this.donorResponses = [
      {
        id: 'resp_01',
        requestId: 'req_01',
        donorId: donorProfile1.id,
        donorUserId: donorUser1.id,
        donorName: 'Sarah Lindqvist',
        donorBloodGroup: 'O-',
        donorPhone: '+1 (555) 889-1022',
        donorEmail: 'sarah.donor@example.com',
        donorCity: 'San Francisco',
        status: 'Interested',
        contactConsent: true,
        contactedByHospital: true,
        appointmentArranged: true,
        appointmentDate: plusDays(1),
        notes: 'Donor confirmed available for direct apheresis or whole blood donation.',
        createdAt: minusDays(1),
        updatedAt: minusDays(1)
      },
      {
        id: 'resp_02',
        requestId: 'req_02',
        donorId: donorProfile2.id,
        donorUserId: donorUser2.id,
        donorName: 'Alex Rivera',
        donorBloodGroup: 'A+',
        donorPhone: '+1 (555) 774-2910',
        donorEmail: 'alex.rivera@example.com',
        donorCity: 'San Francisco',
        status: 'Interested',
        contactConsent: true,
        contactedByHospital: true,
        appointmentArranged: true,
        appointmentDate: plusDays(2),
        notes: 'Scheduled for morning appointment at Apex Trauma lab.',
        createdAt: minusDays(1),
        updatedAt: minusDays(1)
      }
    ];

    // 9. Notifications
    this.notifications = [
      {
        id: 'notif_01',
        recipientUserId: donorUser1.id,
        recipientRole: 'donor',
        title: 'Urgent O- Blood Request Broadcast',
        message: 'Metro Health General Hospital has initiated an urgent donor broadcast for 3 units of O- Red Blood Cells in San Francisco. Please check if you can help.',
        type: 'broadcast',
        relatedRequestId: 'req_01',
        read: false,
        createdAt: minusDays(1)
      },
      {
        id: 'notif_02',
        recipientUserId: hospUser1.id,
        recipientRole: 'hospital',
        title: 'New Donor Response Received',
        message: 'Eligible donor Sarah Lindqvist (O-) responded "Interested" with contact consent for Request REQ-2026-8910.',
        type: 'request_update',
        relatedRequestId: 'req_01',
        read: true,
        createdAt: minusDays(1)
      },
      {
        id: 'notif_03',
        recipientUserId: hospUser2.id,
        recipientRole: 'hospital',
        title: 'Account Awaiting Admin Verification',
        message: 'Your hospital registration documents are currently under administrative review. Blood inventory and donor outreach features will be enabled upon approval.',
        type: 'hospital_verified',
        read: false,
        createdAt: minusDays(2)
      }
    ];

    // 10. Donation Records
    this.donationRecords = [
      {
        id: 'don_rec_01',
        donorId: donorProfile1.id,
        donorName: 'Sarah Lindqvist',
        hospitalId: hospProfile1.id,
        hospitalName: 'Metro Health General Hospital',
        bloodGroup: 'O-',
        component: 'Whole Blood',
        unitsDonated: 1,
        donationDate: '2025-11-10',
        verifiedByStaffName: 'Dr. Rebecca Stone',
        certificateId: 'CERT-SBC-2025-0992',
        notes: 'Routine voluntary donation successfully tested for standard infectious markers.',
        createdAt: '2025-11-10T12:00:00Z'
      },
      {
        id: 'don_rec_02',
        donorId: donorProfile2.id,
        donorName: 'Alex Rivera',
        hospitalId: hospProfile3.id,
        hospitalName: 'Apex Trauma & Surgical Center',
        bloodGroup: 'A+',
        component: 'Platelets',
        unitsDonated: 1,
        donationDate: '2025-12-05',
        verifiedByStaffName: 'Dr. Sarah Jenkins',
        certificateId: 'CERT-SBC-2025-1104',
        notes: 'Single donor apheresis platelets donation recorded.',
        createdAt: '2025-12-05T14:30:00Z'
      }
    ];

    // 11. Audit Logs
    this.auditLogs = [
      {
        id: 'aud_01',
        action: 'HOSPITAL_VERIFIED',
        actorId: adminUser.id,
        actorName: 'System Medical Director',
        actorRole: 'admin',
        details: 'Approved credentials and license LIC-MED-2024-9981 for Metro Health General Hospital.',
        ipAddress: '127.0.0.1',
        timestamp: '2026-01-16T10:00:00Z'
      },
      {
        id: 'aud_02',
        action: 'DONOR_BROADCAST_TRIGGERED',
        actorId: hospUser1.id,
        actorName: 'Dr. Rebecca Stone',
        actorRole: 'hospital',
        details: 'Initiated broadcast for urgent request REQ-2026-8910 targeting O- donors in San Francisco.',
        ipAddress: '127.0.0.1',
        timestamp: minusDays(1)
      },
      {
        id: 'aud_03',
        action: 'INVENTORY_DISPOSAL_EXPIRED',
        actorId: hospUser1.id,
        actorName: 'Blood Bank Tech',
        actorRole: 'hospital',
        details: 'Moved 1 expired unit of B- Platelets (inv_08) to quarantine disposal.',
        ipAddress: '127.0.0.1',
        timestamp: minusDays(1)
      }
    ];
  }

  // Helper Methods for Real Database-Backed Stats
  getSystemStats() {
    const totalRequests = this.bloodRequests.length;
    const fulfilledRequests = this.bloodRequests.filter(r => r.status === 'Fulfilled').length;
    
    // Only count non-expired available inventory from verified hospitals!
    const verifiedHospitalIds = new Set(
      this.hospitalProfiles.filter(h => h.verificationStatus === 'verified').map(h => h.id)
    );
    
    const now = new Date();
    const availableInventoryUnits = this.bloodInventory
      .filter(i => 
        verifiedHospitalIds.has(i.hospitalId) && 
        new Date(i.expiryDate) > now && 
        i.stockStatus !== 'expired'
      )
      .reduce((sum, item) => sum + item.unitsAvailable, 0);

    const verifiedHospitalsCount = this.hospitalProfiles.filter(h => h.verificationStatus === 'verified').length;
    const activeDonorsCount = this.donorProfiles.filter(d => d.availabilityStatus === 'available').length;
    const totalDonationCount = this.donationRecords.length;

    return {
      totalRequests,
      fulfilledRequests,
      availableInventoryUnits,
      verifiedHospitalsCount,
      activeDonorsCount,
      totalDonationCount
    };
  }

  // Method to log audit events
  logAudit(action: string, actor: { id: string; name: string; role: string }, details: string, ipAddress = '127.0.0.1') {
    const entry: AuditLog = {
      id: 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      action,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      details,
      ipAddress,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(entry);
    return entry;
  }
}

export const db = new DatabaseStore();
