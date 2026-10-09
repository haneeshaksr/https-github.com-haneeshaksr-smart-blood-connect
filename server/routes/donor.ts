import { Router } from 'express';
import { db } from '../db.js';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../auth.js';
import { checkBloodCompatibility } from '../compatibility.js';

export const donorRouter = Router();

// Protect all donor endpoints
donorRouter.use(authenticateJWT);
donorRouter.use(requireRole(['donor']));

// 1. Get Donor Profile
donorRouter.get('/profile', (req: AuthenticatedRequest, res) => {
  const profile = db.donorProfiles.find(d => d.userId === req.user!.userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Donor profile record not found.' });
  }

  return res.json({
    success: true,
    data: {
      user: {
        id: req.fullUser!.id,
        name: req.fullUser!.name,
        email: req.fullUser!.email,
        phone: req.fullUser!.phone
      },
      profile
    }
  });
});

// 2. Update Donor Profile
donorRouter.put('/profile', (req: AuthenticatedRequest, res) => {
  const profile = db.donorProfiles.find(d => d.userId === req.user!.userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Donor profile record not found.' });
  }

  const {
    bloodGroup,
    dob,
    gender,
    state,
    district,
    city,
    location,
    address,
    availabilityStatus
  } = req.body;

  if (bloodGroup) profile.bloodGroup = bloodGroup;
  if (dob) profile.dob = dob;
  if (gender) profile.gender = gender;
  if (state) profile.state = state;
  if (district) profile.district = district;
  if (city) profile.city = city;
  if (location) profile.location = location;
  if (address !== undefined) profile.address = address;
  if (availabilityStatus) profile.availabilityStatus = availabilityStatus;
  profile.updatedAt = new Date().toISOString();

  // Also update user basic info if provided
  if (req.body.name && req.fullUser) req.fullUser.name = req.body.name.trim();
  if (req.body.phone && req.fullUser) req.fullUser.phone = req.body.phone.trim();

  return res.json({
    success: true,
    message: 'Profile updated successfully.',
    data: profile
  });
});

// 3. Submit Health Screening / Eligibility Questionnaire
donorRouter.post('/screening', (req: AuthenticatedRequest, res) => {
  const profile = db.donorProfiles.find(d => d.userId === req.user!.userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Donor profile record not found.' });
  }

  const {
    weightKg,
    hemoglobinGdl,
    hasRecentTattooOrPiercing,
    hasMajorIllness,
    isTakingAntibiotics,
    isPregnantOrNursing,
    clinicalDisclaimerAcknowledged
  } = req.body;

  if (!weightKg || clinicalDisclaimerAcknowledged !== true) {
    return res.status(400).json({
      success: false,
      error: 'Weight and acknowledgement of medical disclaimer are required.'
    });
  }

  const weight = Number(weightKg);
  // Preliminary screening criteria
  let screeningStatus: 'screened' | 'ineligible' = 'screened';
  let screeningNote = 'Preliminary software questionnaire completed.';

  if (weight < 50) {
    screeningStatus = 'ineligible';
    screeningNote = 'Minimum weight requirement for whole blood donation is 50 kg.';
  } else if (hasMajorIllness || isTakingAntibiotics) {
    screeningStatus = 'ineligible';
    screeningNote = 'Temporary deferral indicated due to active medication or illness.';
  } else if (hasRecentTattooOrPiercing) {
    screeningStatus = 'ineligible';
    screeningNote = 'Standard 6-month deferral advised following recent tattoo or body piercing.';
  }

  profile.screeningStatus = screeningStatus;
  profile.screeningDetails = {
    weightKg: weight,
    hemoglobinGdl: hemoglobinGdl ? Number(hemoglobinGdl) : undefined,
    hasRecentTattooOrPiercing: Boolean(hasRecentTattooOrPiercing),
    hasMajorIllness: Boolean(hasMajorIllness),
    isTakingAntibiotics: Boolean(isTakingAntibiotics),
    isPregnantOrNursing: Boolean(isPregnantOrNursing),
    screenedAt: new Date().toISOString(),
    clinicalDisclaimerAcknowledged: true
  };
  profile.isProfileComplete = true;
  profile.updatedAt = new Date().toISOString();

  db.logAudit(
    'DONOR_SCREENING_COMPLETED',
    { id: req.user!.userId, name: req.user!.name, role: 'donor' },
    `Completed screening questionnaire with outcome: ${screeningStatus} (${screeningNote}).`
  );

  return res.json({
    success: true,
    message: 'Screening evaluation submitted. Final eligibility will be confirmed by qualified medical staff.',
    data: {
      profile,
      screeningStatus,
      screeningNote
    }
  });
});

// 4. Toggle Availability Status
donorRouter.put('/availability', (req: AuthenticatedRequest, res) => {
  const profile = db.donorProfiles.find(d => d.userId === req.user!.userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Donor profile record not found.' });
  }

  const { availabilityStatus } = req.body;
  if (!['available', 'unavailable'].includes(availabilityStatus)) {
    return res.status(400).json({ success: false, error: 'Status must be "available" or "unavailable".' });
  }

  profile.availabilityStatus = availabilityStatus;
  profile.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    message: `Availability updated to ${availabilityStatus}.`,
    data: { availabilityStatus: profile.availabilityStatus }
  });
});

// 5. Matching Blood Requests for the Donor
donorRouter.get('/matching-requests', (req: AuthenticatedRequest, res) => {
  const profile = db.donorProfiles.find(d => d.userId === req.user!.userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Donor profile not found.' });
  }

  const { city, priority, status } = req.query;

  // Requests that are actively in progress or outreach
  const activeStatuses = ['Awaiting Hospital Review', 'Accepted by Hospital', 'Donor Outreach in Progress', 'Appointment or Collection Coordination'];

  let requests = db.bloodRequests.filter(r => activeStatuses.includes(r.status));

  if (city) {
    requests = requests.filter(r => r.city.toLowerCase().includes(String(city).toLowerCase()));
  }

  if (priority && priority !== 'all') {
    requests = requests.filter(r => r.priority === priority);
  }

  if (status && status !== 'all') {
    requests = requests.filter(r => r.status === status);
  }

  // Calculate compatibility for each request
  const requestsWithMatch = requests.map(reqItem => {
    const comp = checkBloodCompatibility(reqItem.bloodGroup, profile.bloodGroup, reqItem.component);
    const existingResponse = db.donorResponses.find(
      resItem => resItem.requestId === reqItem.id && resItem.donorUserId === req.user!.userId
    );

    return {
      ...reqItem,
      isCompatible: comp.isCompatible,
      compatibilityNotes: comp.notes,
      myResponse: existingResponse || null
    };
  });

  return res.json({
    success: true,
    data: requestsWithMatch
  });
});

// 6. Respond to Blood Request
donorRouter.post('/respond', (req: AuthenticatedRequest, res) => {
  const profile = db.donorProfiles.find(d => d.userId === req.user!.userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Donor profile not found.' });
  }

  const { requestId, status, contactConsent, notes } = req.body;

  if (!requestId || !status) {
    return res.status(400).json({ success: false, error: 'Request ID and response status are required.' });
  }

  if (!['Interested', 'Unavailable', 'Request more information'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid response status.' });
  }

  const bloodRequest = db.bloodRequests.find(r => r.id === requestId);
  if (!bloodRequest) {
    return res.status(404).json({ success: false, error: 'Blood request not found.' });
  }

  let existingResponse = db.donorResponses.find(
    r => r.requestId === requestId && r.donorUserId === req.user!.userId
  );

  if (existingResponse) {
    existingResponse.status = status;
    existingResponse.contactConsent = Boolean(contactConsent);
    existingResponse.notes = notes || existingResponse.notes;
    existingResponse.updatedAt = new Date().toISOString();
  } else {
    existingResponse = {
      id: 'resp_' + Date.now(),
      requestId,
      donorId: profile.id,
      donorUserId: req.user!.userId,
      donorName: req.user!.name,
      donorBloodGroup: profile.bloodGroup,
      donorPhone: req.fullUser!.phone,
      donorEmail: req.fullUser!.email,
      donorCity: profile.city,
      status,
      contactConsent: Boolean(contactConsent),
      contactedByHospital: false,
      appointmentArranged: false,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.donorResponses.unshift(existingResponse);
  }

  // If interested and consenting, notify the hospital coordinator
  if (status === 'Interested') {
    const hospital = db.hospitalProfiles.find(h => h.id === bloodRequest.hospitalId);
    if (hospital) {
      db.notifications.push({
        id: 'notif_' + Date.now(),
        recipientUserId: hospital.userId,
        recipientRole: 'hospital',
        title: `Donor Response for Request ${bloodRequest.refNumber}`,
        message: `${req.user!.name} (${profile.bloodGroup}) responded "Interested"${contactConsent ? ' and granted contact consent.' : '.'}`,
        type: 'request_update',
        relatedRequestId: requestId,
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  db.logAudit(
    'DONOR_RESPONSE_SUBMITTED',
    { id: req.user!.userId, name: req.user!.name, role: 'donor' },
    `Responded "${status}" to request ${bloodRequest.refNumber} with contactConsent: ${Boolean(contactConsent)}.`
  );

  return res.json({
    success: true,
    message: 'Your response has been recorded and safely transmitted to the hospital coordination team.',
    data: existingResponse
  });
});

// 7. Donor Notifications
donorRouter.get('/notifications', (req: AuthenticatedRequest, res) => {
  const notifs = db.notifications
    .filter(n => n.recipientUserId === req.user!.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({
    success: true,
    data: notifs
  });
});

donorRouter.put('/notifications/:id/read', (req: AuthenticatedRequest, res) => {
  const notif = db.notifications.find(n => n.id === req.params.id && n.recipientUserId === req.user!.userId);
  if (notif) {
    notif.read = true;
  }
  return res.json({ success: true });
});

// 8. Donation History
donorRouter.get('/history', (req: AuthenticatedRequest, res) => {
  const profile = db.donorProfiles.find(d => d.userId === req.user!.userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Donor profile not found.' });
  }

  const donations = db.donationRecords.filter(d => d.donorId === profile.id);
  const myResponses = db.donorResponses.filter(r => r.donorUserId === req.user!.userId);

  return res.json({
    success: true,
    data: {
      donations,
      responses: myResponses
    }
  });
});
