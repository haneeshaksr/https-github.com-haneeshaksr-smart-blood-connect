import { Router } from 'express';
import { db, BloodRequest } from '../db.js';
import { checkBloodCompatibility, VALID_BLOOD_GROUPS, BLOOD_COMPONENTS } from '../compatibility.js';

export const publicRouter = Router();

// 1. System Statistics backed strictly by real database records
publicRouter.get('/stats', (req, res) => {
  const stats = db.getSystemStats();
  return res.json({
    success: true,
    data: stats
  });
});

// 2. Find Blood: Search verified non-expired blood inventory
publicRouter.get('/find-blood', (req, res) => {
  const { bloodGroup, component, city, state, includeCompatible } = req.query;

  const now = new Date();
  const verifiedHospitals = db.hospitalProfiles.filter(h => h.verificationStatus === 'verified');
  const verifiedHospMap = new Map(verifiedHospitals.map(h => [h.id, h]));

  // Filter available inventory (verified hospital + non-expired + available status + units > 0)
  let items = db.bloodInventory.filter(item => {
    const isVerifiedHosp = verifiedHospMap.has(item.hospitalId);
    const isNotExpired = new Date(item.expiryDate) > now;
    const isAvailable = item.stockStatus !== 'expired' && item.unitsAvailable > 0;
    return isVerifiedHosp && isNotExpired && isAvailable;
  });

  if (city) {
    items = items.filter(i => i.city.toLowerCase().includes(String(city).toLowerCase()));
  }

  if (state) {
    items = items.filter(i => i.state.toLowerCase().includes(String(state).toLowerCase()));
  }

  if (component && component !== 'all') {
    items = items.filter(i => i.component.toLowerCase() === String(component).toLowerCase());
  }

  // Exact matches
  let exactMatches = items;
  if (bloodGroup && bloodGroup !== 'all') {
    exactMatches = items.filter(i => i.bloodGroup.toUpperCase() === String(bloodGroup).toUpperCase());
  }

  // Compatible matches (if requested and bloodGroup provided)
  let compatibleMatches: typeof items = [];
  if (bloodGroup && bloodGroup !== 'all' && includeCompatible === 'true') {
    compatibleMatches = items.filter(i => {
      if (i.bloodGroup.toUpperCase() === String(bloodGroup).toUpperCase()) return false;
      const compCheck = checkBloodCompatibility(String(bloodGroup), i.bloodGroup, i.component);
      return compCheck.isCompatible;
    });
  }

  return res.json({
    success: true,
    data: {
      exactMatches,
      compatibleMatches,
      totalExactUnits: exactMatches.reduce((acc, curr) => acc + curr.unitsAvailable, 0),
      totalCompatibleUnits: compatibleMatches.reduce((acc, curr) => acc + curr.unitsAvailable, 0),
      disclaimer: 'Blood inventory figures reflect real-time hospital laboratory logs. Mandatory clinical crossmatching and compatibility verification are required prior to transfusion.'
    }
  });
});

// 3. List Verified Hospitals for Public Blood Requisitions
publicRouter.get('/verified-hospitals', (req, res) => {
  const verified = db.hospitalProfiles
    .filter(h => h.verificationStatus === 'verified')
    .map(h => ({
      id: h.id,
      hospitalName: h.hospitalName,
      address: h.address,
      city: h.city,
      state: h.state,
      phone: h.phone,
      email: h.email,
      hasBloodBank: h.hasBloodBank
    }));

  return res.json({
    success: true,
    data: verified
  });
});

// 4. Create Public Blood Request (Patient / Emergency Family member)
publicRouter.post('/request-blood', (req, res) => {
  try {
    const {
      requesterName,
      requesterPhone,
      requesterEmail,
      patientName,
      patientAge,
      hospitalId,
      bloodGroup,
      component,
      unitsNeeded,
      priority,
      requiredBy,
      notes
    } = req.body;

    if (!requesterName || !requesterPhone || !patientName || !hospitalId || !bloodGroup || !unitsNeeded) {
      return res.status(400).json({ success: false, error: 'Please supply all mandatory patient and requester fields.' });
    }

    const hospital = db.hospitalProfiles.find(h => h.id === hospitalId && h.verificationStatus === 'verified');
    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Specified hospital must be an authorized, verified medical center.' });
    }

    const refNumber = 'REQ-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const requestId = 'req_' + Date.now();

    const newRequest: BloodRequest = {
      id: requestId,
      refNumber,
      requesterType: 'public',
      requesterName: requesterName.trim(),
      requesterPhone: requesterPhone.trim(),
      requesterEmail: requesterEmail ? requesterEmail.trim() : '',
      patientName: patientName.trim(),
      patientAge: Number(patientAge) || 30,
      hospitalId: hospital.id,
      hospitalName: hospital.hospitalName,
      bloodGroup,
      component: component || 'Whole Blood',
      unitsNeeded: Number(unitsNeeded),
      priority: priority || 'Normal',
      requiredBy: requiredBy || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      location: hospital.address,
      city: hospital.city,
      state: hospital.state,
      status: 'Awaiting Hospital Review',
      notes: notes ? notes.trim() : '',
      statusTimeline: [
        {
          status: 'Created',
          actor: requesterName.trim(),
          actorRole: 'public',
          timestamp: new Date().toISOString(),
          comment: `Emergency requisition filed by family for patient ${patientName}.`
        },
        {
          status: 'Awaiting Hospital Review',
          actor: 'System Coordinator',
          actorRole: 'system',
          timestamp: new Date().toISOString(),
          comment: `Forwarded to ${hospital.hospitalName} clinical blood bank desk for verification.`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.bloodRequests.unshift(newRequest);

    // Notify Hospital staff
    db.notifications.push({
      id: 'notif_' + Date.now(),
      recipientUserId: hospital.userId,
      recipientRole: 'hospital',
      title: `Emergency Blood Request: ${bloodGroup} (${priority})`,
      message: `New requisition ${refNumber} submitted for patient ${patientName}. Requires ${unitsNeeded} units of ${newRequest.component}. Please review and accept.`,
      type: 'request_update',
      relatedRequestId: requestId,
      read: false,
      createdAt: new Date().toISOString()
    });

    db.logAudit(
      'PUBLIC_BLOOD_REQUEST_CREATED',
      { id: 'public_requester', name: requesterName, role: 'public' },
      `Created request ${refNumber} for ${unitsNeeded} units of ${bloodGroup} at ${hospital.hospitalName}.`
    );

    return res.status(201).json({
      success: true,
      message: `Blood request ${refNumber} logged successfully. Transferred to ${hospital.hospitalName} blood bank desk for clinical verification.`,
      data: newRequest
    });
  } catch (err: any) {
    console.error('Blood request error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error while processing blood request.' });
  }
});

// 5. Medical Compatibility Reference Matrix
publicRouter.get('/compatibility-info', (req, res) => {
  return res.json({
    success: true,
    data: {
      bloodGroups: VALID_BLOOD_GROUPS,
      components: BLOOD_COMPONENTS,
      universalRbcDonor: 'O-',
      universalRbcRecipient: 'AB+',
      universalPlasmaDonor: 'AB+',
      universalPlasmaRecipient: 'O-',
      disclaimer: 'Clinical compatibility and crossmatching must be performed by qualified laboratory personnel before transfusion.'
    }
  });
});
