import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IVerificationDocument {
  docType: string;
  docName: string;
  fileUrl?: string;
  uploadedAt: Date;
  verified: boolean;
}

export interface IHospitalProfile extends Document {
  user: Types.ObjectId;
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
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  documents: IVerificationDocument[];
  consentGiven: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationDocumentSchema = new Schema<IVerificationDocument>(
  {
    docType: {
      type: String,
      required: [true, 'Document type is required'],
      trim: true,
    },
    docName: {
      type: String,
      required: [true, 'Document file name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const HospitalProfileSchema = new Schema<IHospitalProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Associated user reference is required'],
      unique: true,
      index: true,
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital or medical center name is required'],
      trim: true,
      index: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Medical license / registration number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Authorized contact person name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Official institutional email is required'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid official email address'],
    },
    phone: {
      type: String,
      required: [true, 'Clinical contact phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Physical hospital address is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State / Province is required'],
      trim: true,
      index: true,
    },
    district: {
      type: String,
      required: [true, 'District / County is required'],
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
    },
    hasBloodBank: {
      type: Boolean,
      default: true,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'rejected'],
        message: 'Status must be pending, verified, or rejected',
      },
      default: 'pending',
      index: true,
    },
    verificationNotes: {
      type: String,
      trim: true,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    documents: {
      type: [VerificationDocumentSchema],
      default: [],
    },
    consentGiven: {
      type: Boolean,
      required: [true, 'Acceptance of verification and clinical terms is required'],
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for geographic filtering and verification auditing
HospitalProfileSchema.index({ city: 1, verificationStatus: 1 });
HospitalProfileSchema.index({ state: 1, verificationStatus: 1 });
HospitalProfileSchema.index({ verificationStatus: 1, hasBloodBank: 1 });

export const HospitalProfile: Model<IHospitalProfile> =
  mongoose.models.HospitalProfile ||
  mongoose.model<IHospitalProfile>('HospitalProfile', HospitalProfileSchema);

export default HospitalProfile;
