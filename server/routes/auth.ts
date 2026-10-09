import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, User, DonorProfile, HospitalProfile } from '../db.js';
import { generateToken, authenticateJWT, AuthenticatedRequest } from '../auth.js';

export const authRouter = Router();

// 1. Donor Registration
authRouter.post('/register-donor', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      dob,
      gender,
      bloodGroup,
      state,
      district,
      city,
      location,
      address,
      consentGiven
    } = req.body;

    // Field Validations
    if (!name || !email || !phone || !password || !bloodGroup || !dob || !gender) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address format.' });
    }

    if (!consentGiven) {
      return res.status(400).json({ success: false, error: 'You must consent to the privacy policy and terms.' });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = 'usr_d_' + Date.now();
    const newUser: User = {
      id: userId,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'donor',
      name: name.trim(),
      phone: phone.trim(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newProfile: DonorProfile = {
      id: 'prof_d_' + Date.now(),
      userId,
      bloodGroup,
      dob,
      gender,
      state: state || 'California',
      district: district || 'San Francisco County',
      city: city || 'San Francisco',
      location: location || 'Downtown',
      address: address || '',
      availabilityStatus: 'available',
      screeningStatus: 'pending_screening',
      consentGiven: true,
      isProfileComplete: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.donorProfiles.push(newProfile);

    // Initial Welcome Notification
    db.notifications.push({
      id: 'notif_' + Date.now(),
      recipientUserId: userId,
      recipientRole: 'donor',
      title: 'Welcome to Smart Blood Connect',
      message: 'Your donor account is registered. Please complete the initial medical screening questionnaire to confirm your blood donation readiness.',
      type: 'general',
      read: false,
      createdAt: new Date().toISOString()
    });

    db.logAudit('DONOR_REGISTERED', { id: userId, name: newUser.name, role: 'donor' }, `New donor registered with blood group ${bloodGroup}.`);

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    });

    return res.status(201).json({
      success: true,
      message: 'Donor registered successfully. Please proceed with health eligibility screening.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      },
      profile: newProfile
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during donor registration.' });
  }
});

// 2. Hospital Registration
authRouter.post('/register-hospital', async (req, res) => {
  try {
    const {
      hospitalName,
      licenseNumber,
      contactPerson,
      email,
      phone,
      address,
      state,
      district,
      city,
      postalCode,
      password,
      confirmPassword,
      hasBloodBank,
      consentGiven,
      documentName
    } = req.body;

    if (!hospitalName || !licenseNumber || !contactPerson || !email || !phone || !address || !password) {
      return res.status(400).json({ success: false, error: 'Please provide all required hospital fields.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid official email address format.' });
    }

    if (!consentGiven) {
      return res.status(400).json({ success: false, error: 'You must accept the terms and clinical privacy policy.' });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = 'usr_h_' + Date.now();
    const newUser: User = {
      id: userId,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'hospital',
      name: hospitalName.trim(),
      phone: phone.trim(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newProfile: HospitalProfile = {
      id: 'prof_h_' + Date.now(),
      userId,
      hospitalName: hospitalName.trim(),
      licenseNumber: licenseNumber.trim(),
      contactPerson: contactPerson.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      state: state || 'California',
      district: district || 'San Francisco County',
      city: city || 'San Francisco',
      postalCode: postalCode || '94103',
      hasBloodBank: Boolean(hasBloodBank),
      verificationStatus: 'pending', // REQUIREMENT: Pending Verification until admin review
      verificationNotes: 'Pending credential review by State Medical Board administrator.',
      documents: [
        {
          docType: 'Hospital Operating License',
          docName: documentName || 'Hospital_License_Credential.pdf',
          uploadedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.hospitalProfiles.push(newProfile);

    // Notification for hospital
    db.notifications.push({
      id: 'notif_' + Date.now(),
      recipientUserId: userId,
      recipientRole: 'hospital',
      title: 'Registration Submitted - Verification Pending',
      message: 'Your hospital registration has been logged. An administrator will review your medical operating license before hospital inventory and donor outreach features are enabled.',
      type: 'hospital_verified',
      read: false,
      createdAt: new Date().toISOString()
    });

    db.logAudit(
      'HOSPITAL_REGISTERED',
      { id: userId, name: hospitalName, role: 'hospital' },
      `Hospital registered with license ${licenseNumber}. Status set to Pending Verification.`
    );

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    });

    return res.status(201).json({
      success: true,
      message: 'Hospital registered successfully. Account is currently Pending Verification by platform administrators.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      },
      profile: newProfile
    });
  } catch (error: any) {
    console.error('Hospital registration error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during hospital registration.' });
  }
});

// 3. Login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials. User not found.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Your account has been suspended by administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        error: `Selected role (${role}) does not match your registered account role (${user.role}).`
      });
    }

    let donorProfile: DonorProfile | undefined;
    let hospitalProfile: HospitalProfile | undefined;

    if (user.role === 'donor') {
      donorProfile = db.donorProfiles.find(d => d.userId === user.id);
    } else if (user.role === 'hospital') {
      hospitalProfile = db.hospitalProfiles.find(h => h.userId === user.id);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    db.logAudit('USER_LOGIN', { id: user.id, name: user.name, role: user.role }, `User logged in from web client.`);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      donorProfile,
      hospitalProfile
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during authentication.' });
  }
});

// 4. Current Authenticated User & Profile
authRouter.get('/me', authenticateJWT, (req: AuthenticatedRequest, res) => {
  const user = req.fullUser;
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  let donorProfile: DonorProfile | undefined;
  let hospitalProfile: HospitalProfile | undefined;

  if (user.role === 'donor') {
    donorProfile = db.donorProfiles.find(d => d.userId === user.id);
  } else if (user.role === 'hospital') {
    hospitalProfile = db.hospitalProfiles.find(h => h.userId === user.id);
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    },
    donorProfile,
    hospitalProfile
  });
});

// 5. Demo Account Instant Switcher (for convenient examiner testing)
authRouter.post('/demo-switch', (req, res) => {
  const { roleType } = req.body;
  // roleType options: 'admin', 'verified_hospital', 'pending_hospital', 'screened_donor', 'new_donor'
  let targetUser: User | undefined;

  if (roleType === 'admin') {
    targetUser = db.users.find(u => u.role === 'admin');
  } else if (roleType === 'verified_hospital') {
    const verifiedHosp = db.hospitalProfiles.find(h => h.verificationStatus === 'verified');
    targetUser = db.users.find(u => u.id === verifiedHosp?.userId);
  } else if (roleType === 'pending_hospital') {
    const pendingHosp = db.hospitalProfiles.find(h => h.verificationStatus === 'pending');
    targetUser = db.users.find(u => u.id === pendingHosp?.userId);
  } else if (roleType === 'screened_donor') {
    const screened = db.donorProfiles.find(d => d.screeningStatus === 'screened');
    targetUser = db.users.find(u => u.id === screened?.userId);
  } else if (roleType === 'new_donor') {
    const pendingDonor = db.donorProfiles.find(d => d.screeningStatus === 'pending_screening');
    targetUser = db.users.find(u => u.id === pendingDonor?.userId);
  }

  if (!targetUser) {
    return res.status(404).json({ success: false, error: 'Demo account not found for selected role.' });
  }

  const token = generateToken({
    userId: targetUser.id,
    email: targetUser.email,
    role: targetUser.role,
    name: targetUser.name
  });

  const donorProfile = db.donorProfiles.find(d => d.userId === targetUser.id);
  const hospitalProfile = db.hospitalProfiles.find(h => h.userId === targetUser.id);

  return res.json({
    success: true,
    token,
    user: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      phone: targetUser.phone,
      role: targetUser.role
    },
    donorProfile,
    hospitalProfile
  });
});
