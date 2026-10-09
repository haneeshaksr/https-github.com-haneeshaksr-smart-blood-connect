import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IRequestTimelineEvent {
  status: string;
  actor: string;
  actorRole: 'hospital' | 'admin' | 'donor' | 'public' | 'system';
  timestamp: Date;
  comment?: string;
}

export interface IBloodRequest extends Document {
  refNumber: string;
  requesterType: 'hospital' | 'public';
  requester?: Types.ObjectId;
  requesterName: string;
  requesterPhone: string;
  requesterEmail?: string;
  patientName: string;
  patientAge: number;
  hospital: Types.ObjectId;
  hospitalName: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  component:
    | 'Whole Blood'
    | 'Red Blood Cells (PRBC)'
    | 'Platelets'
    | 'Fresh Frozen Plasma (FFP)'
    | 'Cryoprecipitate';
  unitsNeeded: number;
  priority: 'Normal' | 'Urgent' | 'Critical Emergency';
  requiredBy: Date;
  location?: string;
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
  statusTimeline: IRequestTimelineEvent[];
  broadcastSentAt?: Date;
  broadcastCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const RequestTimelineEventSchema = new Schema<IRequestTimelineEvent>(
  {
    status: {
      type: String,
      required: true,
    },
    actor: {
      type: String,
      required: true,
      trim: true,
    },
    actorRole: {
      type: String,
      enum: ['hospital', 'admin', 'donor', 'public', 'system'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const BloodRequestSchema = new Schema<IBloodRequest>(
  {
    refNumber: {
      type: String,
      required: [true, 'Reference number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    requesterType: {
      type: String,
      enum: ['hospital', 'public'],
      required: true,
      index: true,
    },
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    requesterName: {
      type: String,
      required: [true, 'Requester contact name is required'],
      trim: true,
    },
    requesterPhone: {
      type: String,
      required: [true, 'Requester phone number is required'],
      trim: true,
    },
    requesterEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientAge: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Patient age must be non-negative'],
      max: [130, 'Patient age out of valid clinical range'],
    },
    hospital: {
      type: Schema.Types.ObjectId,
      ref: 'HospitalProfile',
      required: [true, 'Receiving hospital reference is required'],
      index: true,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: '{VALUE} is not a valid blood group',
      },
      required: [true, 'Required blood group is mandatory'],
      index: true,
    },
    component: {
      type: String,
      enum: [
        'Whole Blood',
        'Red Blood Cells (PRBC)',
        'Platelets',
        'Fresh Frozen Plasma (FFP)',
        'Cryoprecipitate',
      ],
      default: 'Whole Blood',
      required: true,
      index: true,
    },
    unitsNeeded: {
      type: Number,
      required: [true, 'Quantity of blood units needed is mandatory'],
      min: [1, 'At least 1 unit must be requested'],
    },
    priority: {
      type: String,
      enum: ['Normal', 'Urgent', 'Critical Emergency'],
      default: 'Normal',
      index: true,
    },
    requiredBy: {
      type: Date,
      required: [true, 'Required-by date and time is mandatory'],
      index: true,
    },
    location: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City location is required'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: [true, 'State location is required'],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Created',
        'Awaiting Hospital Review',
        'Accepted by Hospital',
        'Donor Outreach in Progress',
        'Appointment or Collection Coordination',
        'Fulfilled',
        'Rejected',
        'Cancelled',
        'Expired',
      ],
      default: 'Created',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    statusTimeline: {
      type: [RequestTimelineEventSchema],
      default: [],
    },
    broadcastSentAt: {
      type: Date,
    },
    broadcastCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for emergency matching, priority triaging, and hospital management
BloodRequestSchema.index({ status: 1, bloodGroup: 1, city: 1 });
BloodRequestSchema.index({ hospital: 1, status: 1 });
BloodRequestSchema.index({ priority: 1, requiredBy: 1 });
BloodRequestSchema.index({ createdAt: -1 });

export const BloodRequest: Model<IBloodRequest> =
  mongoose.models.BloodRequest ||
  mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);

export default BloodRequest;
