# Smart Blood Connect

**Smart Online Blood Donation & Hospital Coordination System**

A full-stack healthcare platform connecting voluntary blood donors, accredited hospital blood banks, and emergency patients.

---

## 1. Features & Architectural Workflow

- **Role-Based Access Control (RBAC)**:
  - **Donor**: Personalized portal, medical eligibility screening questionnaire, geographic proximity matching, contact consent protection, availability toggle, and digital donation history certificates.
  - **Hospital**: Licensure verification queue, real-time blood inventory tracking, automated component expiry calculations, targeted donor outreach broadcasts with rate limits, and donation fulfillment certification.
  - **Administrator**: State Medical Board licensing verification queue, user moderation (active/suspended), network-wide request surveillance, and immutable audit logs.
- **Medically Validated Compatibility**:
  - Algorithmic RBC and Plasma compatibility calculation based on standard ABO/Rh matrices.
  - Mandatory clinical crossmatching and laboratory verification disclaimers across all workflows.
- **Privacy by Default**:
  - Donors' phone numbers and email addresses are protected and revealed exclusively when a donor explicitly responds "Interested" with contact consent.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Motion.
- **Backend**: Node.js, Express.js.
- **Authentication**: JWT tokens and bcrypt password hashing.
- **Database**: MongoDB Atlas supported via `MONGODB_URI` connection string, with automatic in-memory persistent fallback store.
- **API Testing**: Postman Collection (`/api/docs/postman`).

---

## 3. Environment Variables

Configure `.env` using `.env.example`:

```bash
# Server Port
PORT=3000

# JWT Signing Secret
JWT_SECRET="smart_blood_connect_jwt_secure_secret_key_2026"

# MongoDB Atlas URI (Optional - automatic persistent store used if omitted)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/smart_blood_connect?retryWrites=true&w=majority"
```

---

## 4. Local Development & Deployment

```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server (Express + Vite on Port 3000)
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```

---

## 5. Demo Accounts for Instant Evaluation

The top banner includes a 1-click **Quick Role Switcher** for instant testing:

- **Admin Medical Director**: `admin@smartblood.org` / `Password@123`
- **Verified Hospital (Metro Health)**: `bloodbank@metrohealth.org` / `Password@123`
- **Pending Hospital (St. Jude)**: `director@stjude-clinic.org` / `Password@123`
- **Screened Donor (Sarah O-)**: `sarah.donor@example.com` / `Password@123`
- **New Donor (Elena B+)**: `elena.rostova@example.com` / `Password@123`
