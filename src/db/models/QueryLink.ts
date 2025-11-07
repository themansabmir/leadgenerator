/**
 * QueryLink Model
 * MongoDB model for storing individual search result links from query executions
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IQueryLink } from '@/types';

/**
 * QueryLink Schema Definition
 */
const QueryLinkSchema = new Schema<IQueryLink>(
  {
    queryComboId: {
      type: Schema.Types.ObjectId,
      ref: 'QueryCombo',
      required: [true, 'Query Combo ID is required'],
      index: true
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true
    },
    canonicalUrl: {
      type: String,
      required: [true, 'Canonical URL is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    snippet: {
      type: String,
      required: [true, 'Snippet is required'],
      trim: true
    },
    displayLink: {
      type: String,
      default: null,
      trim: true
    },
    formattedUrl: {
      type: String,
      default: null,
      trim: true
    },
    rank: {
      type: Number,
      default: null,
      min: 1
    },
    pageNumber: {
      type: Number,
      default: null,
      min: 1
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'querylinks'
  }
);

/**
 * Indexes for performance and uniqueness
 */
// Unique compound index to prevent duplicate links per query combo
QueryLinkSchema.index(
  { queryComboId: 1, canonicalUrl: 1 },
  { unique: true }
);

// Single field indexes for filtering and sorting
QueryLinkSchema.index({ queryComboId: 1 });
QueryLinkSchema.index({ fetchedAt: -1 });

/**
 * Instance methods
 */
QueryLinkSchema.methods.toJSON = function() {
  const queryLinkObject = this.toObject();
  return queryLinkObject;
};

/**
 * Static methods
 */
QueryLinkSchema.statics.findByQueryCombo = function(queryComboId: string) {
  return this.find({ queryComboId }).sort({ fetchedAt: -1 });
};

QueryLinkSchema.statics.countByQueryCombo = function(queryComboId: string) {
  return this.countDocuments({ queryComboId });
};

/**
 * Export QueryLink model
 * Use existing model if already compiled, otherwise create new one
 */
export const QueryLink: Model<IQueryLink> = 
  mongoose.models.QueryLink || mongoose.model<IQueryLink>('QueryLink', QueryLinkSchema);

export default QueryLink;
