import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IScreeningDetails {
  weightKg: number;
  hemoglobinGdl?: number;
  hasRecentTattooOrPiercing: boolean;
  hasMajorIllness: boolean;
  isTakingAntibiotics: boolean;
  isPregnantOrNursing?: boolean;
  screenedAt: Date;
  clinicalDisclaimerAcknowledged: boolean;
}

export interface IDonorProfile extends Document {
  user: Types.ObjectId;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  dob: Date;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  state: string;
  district: string;
  city: string;
  location?: string;
  address?: string;
  profilePhoto?: string;
  availabilityStatus: 'available' | 'unavailable';
  screeningStatus: 'screened' | 'pending_screening' | 'ineligible';
  screeningDetails?: IScreeningDetails;
  lastDonationDate?: Date;
  consentGiven: boolean;
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScreeningDetailsSchema = new Schema<IScreeningDetails>(
  {
    weightKg: {
      type: Number,
      required: [true, 'Donor weight in kilograms is required'],
      min: [30, 'Weight must be realistically recorded'],
    },
    hemoglobinGdl: {
      type: Number,
      min: [5, 'Hemoglobin value out of valid range'],
      max: [25, 'Hemoglobin value out of valid range'],
    },
    hasRecentTattooOrPiercing: {
      type: Boolean,
      default: false,
    },
    hasMajorIllness: {
      type: Boolean,
      default: false,
    },
    isTakingAntibiotics: {
      type: Boolean,
      default: false,
    },
    isPregnantOrNursing: {
      type: Boolean,
      default: false,
    },
    screenedAt: {
      type: Date,
      default: Date.now,
    },
    clinicalDisclaimerAcknowledged: {
      type: Boolean,
      required: [true, 'Clinical disclaimer must be acknowledged'],
      default: true,
    },
  },
  { _id: false }
);

const DonorProfileSchema = new Schema<IDonorProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Associated user reference is required'],
      unique: true,
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: '{VALUE} is not a valid ABO/Rh blood group',
      },
      required: [true, 'Blood group is required'],
      index: true,
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      required: [true, 'Gender identification is required'],
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
    location: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      type: String,
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'unavailable'],
      default: 'available',
      index: true,
    },
    screeningStatus: {
      type: String,
      enum: ['screened', 'pending_screening', 'ineligible'],
      default: 'pending_screening',
      index: true,
    },
    screeningDetails: {
      type: ScreeningDetailsSchema,
    },
    lastDonationDate: {
      type: Date,
    },
    consentGiven: {
      type: Boolean,
      required: [true, 'Consent to privacy policy and clinical terms is mandatory'],
      default: true,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for geographic matching and donor broadcast queries
DonorProfileSchema.index({
  bloodGroup: 1,
  city: 1,
  availabilityStatus: 1,
  screeningStatus: 1,
});

DonorProfileSchema.index({
  bloodGroup: 1,
  state: 1,
  availabilityStatus: 1,
});

export const DonorProfile: Model<IDonorProfile> =
  mongoose.models.DonorProfile ||
  mongoose.model<IDonorProfile>('DonorProfile', DonorProfileSchema);

export default DonorProfile;
