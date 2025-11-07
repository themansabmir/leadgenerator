/**
 * QueryCombo Model
 * MongoDB model for storing query combinations (Location + Category + Dork)
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IQueryCombo } from '@/types';

/**
 * QueryCombo Schema Definition
 */
const QueryComboSchema = new Schema<IQueryCombo>(
  {
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location ID is required'],
      index: true
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required'],
      index: true
    },
    dorkId: {
      type: Schema.Types.ObjectId,
      ref: 'Dork',
      required: [true, 'Dork ID is required'],
      index: true
    },
    dorkString: {
      type: String,
      required: [true, 'Dork string is required'],
      trim: true
    },
    credentialId: {
      type: Schema.Types.ObjectId,
      ref: 'Credential',
      required: [true, 'Credential ID is required']
    },
    totalResultsFetched: {
      type: Number,
      default: 0,
      min: 0
    },
    lastStartIndex: {
      type: Number,
      default: 0,
      min: 0
    },
    nextStartIndex: {
      type: Number,
      default: 1,
      min: 1
    },
    maxAllowedResults: {
      type: Number,
      default: 100,
      min: 1,
      max: 1000
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'paused', 'completed', 'failed'],
      default: 'pending',
      index: true
    },
    errorMessage: {
      type: String,
      default: null
    },
    lastRunAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'querycombos'
  }
);

/**
 * Indexes for performance and uniqueness
 */
// Unique compound index to prevent duplicate query combos
QueryComboSchema.index(
  { locationId: 1, categoryId: 1, dorkId: 1 },
  { unique: true }
);

// Single field indexes for filtering
QueryComboSchema.index({ status: 1 });
QueryComboSchema.index({ createdAt: -1 });

/**
 * Instance methods
 */
QueryComboSchema.methods.toJSON = function() {
  const queryComboObject = this.toObject();
  return queryComboObject;
};

/**
 * Static methods
 */
QueryComboSchema.statics.findByCombo = function(
  locationId: string,
  categoryId: string,
  dorkId: string
) {
  return this.findOne({ locationId, categoryId, dorkId });
};

/**
 * Virtual for progress calculation
 */
QueryComboSchema.virtual('progress').get(function() {
  if (this.maxAllowedResults === 0) return 0;
  return Math.min(100, Math.round((this.totalResultsFetched / this.maxAllowedResults) * 100));
});

/**
 * Virtual for checking if more results can be fetched
 */
QueryComboSchema.virtual('canFetchMore').get(function() {
  return this.totalResultsFetched < this.maxAllowedResults && 
         this.status !== 'completed' && 
         this.status !== 'failed';
});

/**
 * Export QueryCombo model
 * Use existing model if already compiled, otherwise create new one
 */
export const QueryCombo: Model<IQueryCombo> = 
  mongoose.models.QueryCombo || mongoose.model<IQueryCombo>('QueryCombo', QueryComboSchema);

export default QueryCombo;
