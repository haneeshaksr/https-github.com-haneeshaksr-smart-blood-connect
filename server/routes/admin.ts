import { Router } from 'express';
import { db } from '../db.js';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../auth.js';

export const adminRouter = Router();

adminRouter.use(authenticateJWT);
adminRouter.use(requireRole(['admin']));

// 1. Admin System Dashboard Overview
adminRouter.get('/dashboard', (req: AuthenticatedRequest, res) => {
  const stats = db.getSystemStats();
  const pendingHospitalsCount = db.hospitalProfiles.filter(h => h.verificationStatus === 'pending').length;
  const totalUsersCount = db.users.length;
  const totalAuditLogs = db.auditLogs.length;

  return res.json({
    success: true,
    data: {
      ...stats,
      pendingHospitalsCount,
      totalUsersCount,
      totalAuditLogs,
      recentAuditLogs: db.auditLogs.slice(0, 10),
      recentRegistrations: db.users.slice(-5).reverse().map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt
      }))
    }
  });
});

// 2. Hospital List & Verification Queue
adminRouter.get('/hospitals', (req: AuthenticatedRequest, res) => {
  const { status } = req.query;
  let hospitals = db.hospitalProfiles;

  if (status && status !== 'all') {
    hospitals = hospitals.filter(h => h.verificationStatus === status);
  }

  return res.json({
    success: true,
    data: hospitals
  });
});

// 3. Hospital Verification Decision (Approve / Reject)
adminRouter.put('/hospitals/:id/verify', (req: AuthenticatedRequest, res) => {
  const { status, notes } = req.body;

  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Status must be "verified" or "rejected".' });
  }

  const hospital = db.hospitalProfiles.find(h => h.id === req.params.id);
  if (!hospital) {
    return res.status(404).json({ success: false, error: 'Hospital record not found.' });
  }

  hospital.verificationStatus = status;
  hospital.verificationNotes = notes || (status === 'verified' ? 'Medical operating license verified by State Medical Board.' : 'Application rejected due to unverified medical licensure credentials.');
  hospital.verifiedAt = new Date().toISOString();
  hospital.verifiedBy = req.user!.userId;
  hospital.updatedAt = new Date().toISOString();

  // Notify hospital user
  db.notifications.push({
    id: 'notif_' + Date.now(),
    recipientUserId: hospital.userId,
    recipientRole: 'hospital',
    title: status === 'verified' ? 'Hospital Credentials Verified' : 'Hospital Verification Update',
    message: status === 'verified'
      ? `Your hospital account "${hospital.hospitalName}" has been officially verified. Full blood inventory management and donor outreach privileges are now activated.`
      : `Your hospital application verification was marked as rejected. Reason: ${hospital.verificationNotes}`,
    type: 'hospital_verified',
    read: false,
    createdAt: new Date().toISOString()
  });

  db.logAudit(
    status === 'verified' ? 'HOSPITAL_VERIFIED' : 'HOSPITAL_REJECTED',
    { id: req.user!.userId, name: req.user!.name, role: 'admin' },
    `Updated hospital "${hospital.hospitalName}" (${hospital.licenseNumber}) verification to "${status}". Notes: ${hospital.verificationNotes}`
  );

  return res.json({
    success: true,
    message: `Hospital ${hospital.hospitalName} has been marked as ${status}.`,
    data: hospital
  });
});

// 4. User Management & Moderation
adminRouter.get('/users', (req: AuthenticatedRequest, res) => {
  const { role, status } = req.query;
  let users = db.users;

  if (role && role !== 'all') {
    users = users.filter(u => u.role === role);
  }

  if (status && status !== 'all') {
    users = users.filter(u => u.status === status);
  }

  const sanitized = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt
  }));

  return res.json({
    success: true,
    data: sanitized
  });
});

// 5. Toggle User Account Status (Active / Suspended)
adminRouter.put('/users/:id/status', (req: AuthenticatedRequest, res) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Status must be "active" or "suspended".' });
  }

  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  if (user.role === 'admin' && user.id === req.user!.userId) {
    return res.status(400).json({ success: false, error: 'Cannot suspend your own administrator account.' });
  }

  user.status = status;
  user.updatedAt = new Date().toISOString();

  db.logAudit(
    'USER_STATUS_CHANGED',
    { id: req.user!.userId, name: req.user!.name, role: 'admin' },
    `Changed status of user ${user.name} (${user.email}) to "${status}".`
  );

  return res.json({
    success: true,
    message: `User status changed to ${status}.`,
    data: { id: user.id, status: user.status }
  });
});

// 6. Request Monitoring (All Requests across hospitals)
adminRouter.get('/requests', (req: AuthenticatedRequest, res) => {
  const requests = db.bloodRequests.map(r => {
    const responses = db.donorResponses.filter(resp => resp.requestId === r.id);
    return {
      ...r,
      responsesCount: responses.length
    };
  });

  return res.json({
    success: true,
    data: requests
  });
});

// 7. Audit Logs
adminRouter.get('/audit-logs', (req: AuthenticatedRequest, res) => {
  return res.json({
    success: true,
    data: db.auditLogs
  });
});

// 8. Inventory Audit History
adminRouter.get('/inventory-audit', (req: AuthenticatedRequest, res) => {
  const inventoryAuditLogs = db.auditLogs.filter(
    l => l.action.startsWith('INVENTORY_') || l.action.startsWith('DONATION_')
  );

  return res.json({
    success: true,
    data: {
      totalRecords: db.bloodInventory.length,
      inventory: db.bloodInventory,
      auditHistory: inventoryAuditLogs
    }
  });
});
