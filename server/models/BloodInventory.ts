import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IBloodInventory extends Document {
  hospital: Types.ObjectId;
  hospitalName: string;
  city: string;
  state: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  component:
    | 'Whole Blood'
    | 'Red Blood Cells (PRBC)'
    | 'Platelets'
    | 'Fresh Frozen Plasma (FFP)'
    | 'Cryoprecipitate';
  unitsAvailable: number;
  collectionDate: Date;
  expiryDate: Date;
  storageLocation: string;
  stockStatus: 'available' | 'reserved' | 'expired' | 'low_stock';
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BloodInventorySchema = new Schema<IBloodInventory>(
  {
    hospital: {
      type: Schema.Types.ObjectId,
      ref: 'HospitalProfile',
      required: true,
      index: true,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
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
      required: true,
      index: true,
    },
    unitsAvailable: {
      type: Number,
      required: true,
      min: [0, 'Available units cannot be negative'],
    },
    collectionDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    storageLocation: {
      type: String,
      trim: true,
      default: 'Main Storage Vault',
    },
    stockStatus: {
      type: String,
      enum: ['available', 'reserved', 'expired', 'low_stock'],
      default: 'available',
      index: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for inventory search and automatic expiry calculations
BloodInventorySchema.index({ hospital: 1, bloodGroup: 1, component: 1 });
BloodInventorySchema.index({ bloodGroup: 1, component: 1, expiryDate: 1, stockStatus: 1 });
BloodInventorySchema.index({ city: 1, bloodGroup: 1, stockStatus: 1 });

export const BloodInventory: Model<IBloodInventory> =
  mongoose.models.BloodInventory ||
  mongoose.model<IBloodInventory>('BloodInventory', BloodInventorySchema);

export default BloodInventory;
