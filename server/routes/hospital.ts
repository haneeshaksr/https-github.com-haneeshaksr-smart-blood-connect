import { Router } from 'express';
import { db, BloodInventoryItem, BloodRequest, DonationRecord } from '../db.js';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../auth.js';
import { checkBloodCompatibility } from '../compatibility.js';

export const hospitalRouter = Router();

hospitalRouter.use(authenticateJWT);
hospitalRouter.use(requireRole(['hospital']));

// Helper to get current hospital profile
function getHospital(req: AuthenticatedRequest) {
  return db.hospitalProfiles.find(h => h.userId === req.user!.userId);
}

// 1. Dashboard Overview
hospitalRouter.get('/dashboard-overview', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital) {
    return res.status(404).json({ success: false, error: 'Hospital profile not found.' });
  }

  // Real database-backed statistics for this hospital
  const hospitalRequests = db.bloodRequests.filter(r => r.hospitalId === hospital.id);
  const totalRequests = hospitalRequests.length;
  const pendingRequests = hospitalRequests.filter(r => ['Created', 'Awaiting Hospital Review'].includes(r.status)).length;
  const inProgressRequests = hospitalRequests.filter(r => ['Accepted by Hospital', 'Donor Outreach in Progress', 'Appointment or Collection Coordination'].includes(r.status)).length;
  const fulfilledRequests = hospitalRequests.filter(r => r.status === 'Fulfilled').length;

  const now = new Date();
  const inventoryItems = db.bloodInventory.filter(i => i.hospitalId === hospital.id);

  // Automatically calculate expired and low-stock inventory
  let totalAvailableUnits = 0;
  let expiredUnitsCount = 0;
  let lowStockAlertsCount = 0;

  inventoryItems.forEach(item => {
    const isExpired = new Date(item.expiryDate) <= now;
    if (isExpired) {
      item.stockStatus = 'expired';
      expiredUnitsCount += item.unitsAvailable;
    } else {
      totalAvailableUnits += item.unitsAvailable;
      if (item.unitsAvailable <= 3 && item.stockStatus !== 'low_stock') {
        item.stockStatus = 'low_stock';
      }
      if (item.stockStatus === 'low_stock') {
        lowStockAlertsCount++;
      }
    }
  });

  const recentNotifications = db.notifications
    .filter(n => n.recipientUserId === req.user!.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return res.json({
    success: true,
    data: {
      hospital,
      verificationStatus: hospital.verificationStatus,
      isVerified: hospital.verificationStatus === 'verified',
      metrics: {
        totalRequests,
        pendingRequests,
        inProgressRequests,
        fulfilledRequests,
        totalAvailableUnits,
        expiredUnitsCount,
        lowStockAlertsCount,
        totalInventoryRecords: inventoryItems.length
      },
      recentNotifications
    }
  });
});

// 2. Blood Inventory Management: Get List
hospitalRouter.get('/inventory', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital) {
    return res.status(404).json({ success: false, error: 'Hospital profile not found.' });
  }

  const now = new Date();
  const items = db.bloodInventory.filter(i => i.hospitalId === hospital.id);

  // Refresh status calculations
  items.forEach(item => {
    if (new Date(item.expiryDate) <= now) {
      item.stockStatus = 'expired';
    } else if (item.unitsAvailable <= 3 && item.unitsAvailable > 0) {
      item.stockStatus = 'low_stock';
    } else if (item.unitsAvailable > 3) {
      item.stockStatus = 'available';
    }
  });

  return res.json({
    success: true,
    data: items
  });
});

// 3. Add or Update Blood Inventory (Requires Verified Hospital)
hospitalRouter.post('/inventory', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital) {
    return res.status(404).json({ success: false, error: 'Hospital profile not found.' });
  }

  if (hospital.verificationStatus !== 'verified') {
    return res.status(403).json({
      success: false,
      error: 'Account verification required. Only administrators-verified hospitals can log or manage blood inventory.'
    });
  }

  const { bloodGroup, component, unitsAvailable, collectionDate, expiryDate, storageLocation } = req.body;

  if (!bloodGroup || !component || unitsAvailable === undefined || !expiryDate) {
    return res.status(400).json({ success: false, error: 'All inventory parameters are required.' });
  }

  const now = new Date();
  const isExpired = new Date(expiryDate) <= now;
  const units = Number(unitsAvailable);

  let status: 'available' | 'low_stock' | 'expired' = 'available';
  if (isExpired) status = 'expired';
  else if (units <= 3) status = 'low_stock';

  const newItem: BloodInventoryItem = {
    id: 'inv_' + Date.now(),
    hospitalId: hospital.id,
    hospitalName: hospital.hospitalName,
    city: hospital.city,
    state: hospital.state,
    bloodGroup,
    component,
    unitsAvailable: units,
    collectionDate: collectionDate || new Date().toISOString(),
    expiryDate,
    storageLocation: storageLocation || 'Main Blood Storage Vault',
    stockStatus: status,
    lastUpdated: new Date().toISOString()
  };

  db.bloodInventory.push(newItem);

  db.logAudit(
    'INVENTORY_ADDED',
    { id: req.user!.userId, name: hospital.hospitalName, role: 'hospital' },
    `Added ${units} units of ${bloodGroup} (${component}) expiring ${new Date(expiryDate).toLocaleDateString()}.`
  );

  return res.status(201).json({
    success: true,
    message: 'Inventory batch recorded in laboratory database.',
    data: newItem
  });
});

hospitalRouter.put('/inventory/:id', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital || hospital.verificationStatus !== 'verified') {
    return res.status(403).json({ success: false, error: 'Verified hospital authorization required.' });
  }

  const item = db.bloodInventory.find(i => i.id === req.params.id && i.hospitalId === hospital.id);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Inventory record not found.' });
  }

  const { unitsAvailable, expiryDate, storageLocation, stockStatus } = req.body;
  if (unitsAvailable !== undefined) item.unitsAvailable = Number(unitsAvailable);
  if (expiryDate) item.expiryDate = expiryDate;
  if (storageLocation) item.storageLocation = storageLocation;
  if (stockStatus) item.stockStatus = stockStatus;
  item.lastUpdated = new Date().toISOString();

  // Re-check expiry
  if (new Date(item.expiryDate) <= new Date()) {
    item.stockStatus = 'expired';
  }

  return res.json({
    success: true,
    message: 'Inventory item updated.',
    data: item
  });
});

hospitalRouter.delete('/inventory/:id', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital || hospital.verificationStatus !== 'verified') {
    return res.status(403).json({ success: false, error: 'Verified hospital authorization required.' });
  }

  const index = db.bloodInventory.findIndex(i => i.id === req.params.id && i.hospitalId === hospital.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Inventory item not found.' });
  }

  const removed = db.bloodInventory.splice(index, 1)[0];
  db.logAudit(
    'INVENTORY_DELETED',
    { id: req.user!.userId, name: hospital.hospitalName, role: 'hospital' },
    `Disposed/removed inventory batch ${removed.id} of ${removed.bloodGroup} ${removed.component}.`
  );

  return res.json({ success: true, message: 'Inventory record removed.' });
});

// 4. Create Blood Request
hospitalRouter.post('/requests', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital) {
    return res.status(404).json({ success: false, error: 'Hospital profile not found.' });
  }

  if (hospital.verificationStatus !== 'verified') {
    return res.status(403).json({
      success: false,
      error: 'Account verification required. Pending hospitals cannot issue clinical blood requests.'
    });
  }

  const {
    patientName,
    patientAge,
    bloodGroup,
    component,
    unitsNeeded,
    priority,
    requiredBy,
    location,
    notes
  } = req.body;

  if (!patientName || !bloodGroup || !unitsNeeded || !requiredBy) {
    return res.status(400).json({ success: false, error: 'Please provide all mandatory blood request parameters.' });
  }

  const refNumber = 'REQ-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const requestId = 'req_' + Date.now();

  const newRequest: BloodRequest = {
    id: requestId,
    refNumber,
    requesterType: 'hospital',
    requesterId: hospital.id,
    requesterName: hospital.contactPerson || hospital.hospitalName,
    requesterPhone: hospital.phone,
    requesterEmail: hospital.email,
    patientName: patientName.trim(),
    patientAge: Number(patientAge) || 35,
    hospitalId: hospital.id,
    hospitalName: hospital.hospitalName,
    bloodGroup,
    component: component || 'Whole Blood',
    unitsNeeded: Number(unitsNeeded),
    priority: priority || 'Normal',
    requiredBy,
    location: location || hospital.address,
    city: hospital.city,
    state: hospital.state,
    status: 'Accepted by Hospital', // Internal hospital request is immediately verified and accepted by the creating hospital
    notes: notes ? notes.trim() : '',
    statusTimeline: [
      {
        status: 'Created',
        actor: hospital.hospitalName,
        actorRole: 'hospital',
        timestamp: new Date().toISOString(),
        comment: `Request generated by authorized hospital department for patient ${patientName}.`
      },
      {
        status: 'Accepted by Hospital',
        actor: hospital.contactPerson || 'Blood Bank Coordinator',
        actorRole: 'hospital',
        timestamp: new Date().toISOString(),
        comment: 'Clinical requisition accepted and logged for allocation or donor outreach.'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.bloodRequests.unshift(newRequest);

  db.logAudit(
    'HOSPITAL_REQUEST_CREATED',
    { id: req.user!.userId, name: hospital.hospitalName, role: 'hospital' },
    `Created internal request ${refNumber} for ${unitsNeeded} units of ${bloodGroup} (${newRequest.component}).`
  );

  return res.status(201).json({
    success: true,
    message: `Blood request ${refNumber} generated successfully.`,
    data: newRequest
  });
});

// 5. Get Hospital Blood Requests
hospitalRouter.get('/requests', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital) {
    return res.status(404).json({ success: false, error: 'Hospital profile not found.' });
  }

  const requests = db.bloodRequests
    .filter(r => r.hospitalId === hospital.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Attach response counts
  const requestsWithCounts = requests.map(r => {
    const responses = db.donorResponses.filter(resp => resp.requestId === r.id);
    return {
      ...r,
      totalResponses: responses.length,
      interestedCount: responses.filter(resp => resp.status === 'Interested').length
    };
  });

  return res.json({
    success: true,
    data: requestsWithCounts
  });
});

// 6. Update Request Status Workflow
hospitalRouter.put('/requests/:id/status', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital || hospital.verificationStatus !== 'verified') {
    return res.status(403).json({ success: false, error: 'Verified hospital authorization required.' });
  }

  const { status, comment } = req.body;
  const allowedStatuses = [
    'Created',
    'Awaiting Hospital Review',
    'Accepted by Hospital',
    'Donor Outreach in Progress',
    'Appointment or Collection Coordination',
    'Fulfilled',
    'Rejected',
    'Cancelled',
    'Expired'
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid workflow status.' });
  }

  const request = db.bloodRequests.find(r => r.id === req.params.id && r.hospitalId === hospital.id);
  if (!request) {
    return res.status(404).json({ success: false, error: 'Blood request not found.' });
  }

  const oldStatus = request.status;
  request.status = status;
  request.updatedAt = new Date().toISOString();

  // Add timeline entry
  request.statusTimeline.push({
    status,
    actor: req.user!.name,
    actorRole: 'hospital',
    timestamp: new Date().toISOString(),
    comment: comment || `Status transitioned from ${oldStatus} to ${status}.`
  });

  db.logAudit(
    'REQUEST_STATUS_UPDATED',
    { id: req.user!.userId, name: hospital.hospitalName, role: 'hospital' },
    `Updated request ${request.refNumber} status to "${status}". Comment: ${comment || 'None'}`
  );

  return res.json({
    success: true,
    message: `Request status updated to ${status}.`,
    data: request
  });
});

// 7. Trigger Donor Outreach Broadcast
hospitalRouter.post('/requests/:id/broadcast', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital || hospital.verificationStatus !== 'verified') {
    return res.status(403).json({
      success: false,
      error: 'Account verification required. Only authorized hospitals can broadcast to blood donors.'
    });
  }

  const request = db.bloodRequests.find(r => r.id === req.params.id && r.hospitalId === hospital.id);
  if (!request) {
    return res.status(404).json({ success: false, error: 'Blood request not found.' });
  }

  // Rate limiting / deduplication check: prevent spamming donors if broadcast sent within last 2 hours
  const now = new Date();
  if (request.broadcastSentAt) {
    const lastBroadcast = new Date(request.broadcastSentAt);
    const diffHours = (now.getTime() - lastBroadcast.getTime()) / (1000 * 60 * 60);
    if (diffHours < 2) {
      return res.status(429).json({
        success: false,
        error: `Broadcast rate limit: An outreach notification was already sent ${Math.round(diffHours * 60)} minutes ago. Please wait 2 hours before rebroadcasting.`
      });
    }
  }

  // Identify potentially suitable, contactable donors:
  // - Available for contact
  // - Screening completed and not ineligible
  // - Medically compatible with the requested blood group
  const matchingDonors = db.donorProfiles.filter(donor => {
    if (donor.availabilityStatus !== 'available') return false;
    if (donor.screeningStatus === 'ineligible') return false;

    const comp = checkBloodCompatibility(request.bloodGroup, donor.bloodGroup, request.component);
    return comp.isCompatible;
  });

  let notifiedCount = 0;
  matchingDonors.forEach(donor => {
    // Send in-app notification
    db.notifications.push({
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      recipientUserId: donor.userId,
      recipientRole: 'donor',
      title: `Urgent Broadcast: ${request.bloodGroup} Blood Needed`,
      message: `${hospital.hospitalName} has initiated a priority outreach for ${request.unitsNeeded} units of ${request.component} in ${hospital.city}. Ref: ${request.refNumber}. Needed by: ${new Date(request.requiredBy).toLocaleString()}.`,
      type: 'broadcast',
      relatedRequestId: request.id,
      read: false,
      createdAt: new Date().toISOString()
    });
    notifiedCount++;
  });

  // Update request status
  request.status = 'Donor Outreach in Progress';
  request.broadcastSentAt = now.toISOString();
  request.broadcastCount = (request.broadcastCount || 0) + 1;
  request.updatedAt = now.toISOString();

  request.statusTimeline.push({
    status: 'Donor Outreach in Progress',
    actor: req.user!.name,
    actorRole: 'hospital',
    timestamp: now.toISOString(),
    comment: `Targeted outreach broadcast sent to ${notifiedCount} eligible matching donors in the network.`
  });

  db.logAudit(
    'DONOR_BROADCAST_SENT',
    { id: req.user!.userId, name: hospital.hospitalName, role: 'hospital' },
    `Broadcasted request ${request.refNumber} (${request.bloodGroup}) to ${notifiedCount} donors.`
  );

  return res.json({
    success: true,
    message: `Outreach broadcast successfully transmitted to ${notifiedCount} eligible contactable donors.`,
    data: {
      notifiedDonorsCount: notifiedCount,
      request
    }
  });
});

// 8. Manage Donor Responses for a Request
hospitalRouter.get('/requests/:id/responses', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital) {
    return res.status(404).json({ success: false, error: 'Hospital profile not found.' });
  }

  const request = db.bloodRequests.find(r => r.id === req.params.id && r.hospitalId === hospital.id);
  if (!request) {
    return res.status(404).json({ success: false, error: 'Request not found.' });
  }

  const responses = db.donorResponses.filter(r => r.requestId === request.id);

  // Requirement: Protect donor contact details.
  // Display or share phone/email ONLY when the donor has explicitly granted contactConsent!
  const sanitizedResponses = responses.map(r => {
    if (!r.contactConsent) {
      return {
        ...r,
        donorPhone: 'Protected (Consent Not Granted)',
        donorEmail: 'Protected (Consent Not Granted)'
      };
    }
    return r;
  });

  return res.json({
    success: true,
    data: sanitizedResponses
  });
});

// 9. Update Donor Response & Schedule Donation
hospitalRouter.put('/responses/:id', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital || hospital.verificationStatus !== 'verified') {
    return res.status(403).json({ success: false, error: 'Verified hospital authorization required.' });
  }

  const response = db.donorResponses.find(r => r.id === req.params.id);
  if (!response) {
    return res.status(404).json({ success: false, error: 'Donor response record not found.' });
  }

  const { contactedByHospital, appointmentArranged, appointmentDate, notes } = req.body;

  if (contactedByHospital !== undefined) response.contactedByHospital = Boolean(contactedByHospital);
  if (appointmentArranged !== undefined) response.appointmentArranged = Boolean(appointmentArranged);
  if (appointmentDate !== undefined) response.appointmentDate = appointmentDate;
  if (notes) response.notes = notes;
  response.updatedAt = new Date().toISOString();

  // If appointment arranged, update request status to Appointment or Collection Coordination if not already
  if (appointmentArranged) {
    const request = db.bloodRequests.find(r => r.id === response.requestId);
    if (request && request.status !== 'Fulfilled') {
      request.status = 'Appointment or Collection Coordination';
      request.statusTimeline.push({
        status: 'Appointment or Collection Coordination',
        actor: hospital.hospitalName,
        actorRole: 'hospital',
        timestamp: new Date().toISOString(),
        comment: `Donation appointment coordinated with donor ${response.donorName} for ${appointmentDate ? new Date(appointmentDate).toLocaleDateString() : 'near date'}.`
      });
    }
  }

  db.logAudit(
    'DONOR_RESPONSE_UPDATED',
    { id: req.user!.userId, name: hospital.hospitalName, role: 'hospital' },
    `Updated donor response ${response.id}: contacted=${response.contactedByHospital}, appointment=${response.appointmentArranged}.`
  );

  return res.json({
    success: true,
    message: 'Donor response details updated.',
    data: response
  });
});

// 10. Record Verified Completed Donation (Fulfilled)
hospitalRouter.post('/record-donation', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital || hospital.verificationStatus !== 'verified') {
    return res.status(403).json({ success: false, error: 'Verified hospital authorization required.' });
  }

  const { donorId, requestId, unitsDonated, bloodGroup, component, notes } = req.body;

  const donorProfile = db.donorProfiles.find(d => d.id === donorId);
  const donorUser = donorProfile ? db.users.find(u => u.id === donorProfile.userId) : null;

  const certId = 'CERT-SBC-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

  const donation: DonationRecord = {
    id: 'don_' + Date.now(),
    donorId: donorProfile ? donorProfile.id : 'unknown_donor',
    donorName: donorUser ? donorUser.name : 'Registered Blood Donor',
    hospitalId: hospital.id,
    hospitalName: hospital.hospitalName,
    bloodGroup: bloodGroup || (donorProfile ? donorProfile.bloodGroup : 'O+'),
    component: component || 'Whole Blood',
    unitsDonated: Number(unitsDonated) || 1,
    donationDate: new Date().toISOString().split('T')[0],
    verifiedByStaffName: req.user!.name,
    certificateId: certId,
    notes: notes || 'Verified clinical donation completed.',
    createdAt: new Date().toISOString()
  };

  db.donationRecords.push(donation);

  // Update donor profile last donation date
  if (donorProfile) {
    donorProfile.lastDonationDate = donation.donationDate;
    donorProfile.updatedAt = new Date().toISOString();

    // Send thank you notification to donor
    db.notifications.push({
      id: 'notif_' + Date.now(),
      recipientUserId: donorProfile.userId,
      recipientRole: 'donor',
      title: 'Donation Verified - Certificate Issued',
      message: `Thank you for your life-saving blood donation at ${hospital.hospitalName}. Certificate ${certId} is recorded in your history.`,
      type: 'general',
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  // If requestId provided, mark request as Fulfilled
  if (requestId) {
    const request = db.bloodRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'Fulfilled';
      request.statusTimeline.push({
        status: 'Fulfilled',
        actor: req.user!.name,
        actorRole: 'hospital',
        timestamp: new Date().toISOString(),
        comment: `Verified donation completed and units collected. Transfusion coordination fulfilled.`
      });
    }
  }

  db.logAudit(
    'DONATION_RECORDED_VERIFIED',
    { id: req.user!.userId, name: hospital.hospitalName, role: 'hospital' },
    `Recorded verified donation ${certId} of ${donation.unitsDonated} units ${donation.bloodGroup} for donor ${donation.donorName}.`
  );

  return res.status(201).json({
    success: true,
    message: 'Medical donation recorded and verified. Certificate generated.',
    data: donation
  });
});

// 11. Hospital Profile
hospitalRouter.get('/profile', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital) {
    return res.status(404).json({ success: false, error: 'Hospital profile not found.' });
  }

  return res.json({
    success: true,
    data: hospital
  });
});

hospitalRouter.put('/profile', (req: AuthenticatedRequest, res) => {
  const hospital = getHospital(req);
  if (!hospital) {
    return res.status(404).json({ success: false, error: 'Hospital profile not found.' });
  }

  const { contactPerson, phone, address, city, state, postalCode, hasBloodBank } = req.body;
  if (contactPerson) hospital.contactPerson = contactPerson;
  if (phone) hospital.phone = phone;
  if (address) hospital.address = address;
  if (city) hospital.city = city;
  if (state) hospital.state = state;
  if (postalCode) hospital.postalCode = postalCode;
  if (hasBloodBank !== undefined) hospital.hasBloodBank = Boolean(hasBloodBank);
  hospital.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    message: 'Hospital details updated.',
    data: hospital
  });
});
