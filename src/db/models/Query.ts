/**
 * Query Model
 * MongoDB model for Google dork queries and scraping status
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IQuery } from '@/types';

/**
 * Query Schema Definition
 */
const QuerySchema = new Schema<IQuery>(
  {
    dork: {
      type: String,
      required: [true, 'Google dork query is required'],
      trim: true,
      maxlength: [500, 'Dork query cannot exceed 500 characters']
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'scraping', 'completed', 'failed'],
        message: 'Status must be one of: pending, scraping, completed, failed'
      },
      default: 'pending',
      index: true
    },
    totalResults: {
      type: Number,
      default: 0,
      min: [0, 'Total results cannot be negative']
    },
    lastPageScraped: {
      type: Number,
      default: 0,
      min: [0, 'Last page scraped cannot be negative']
    }
  },
  {
    timestamps: true,
    collection: 'queries'
  }
);

/**
 * Indexes for performance
 */
QuerySchema.index({ categoryId: 1, status: 1 });
QuerySchema.index({ status: 1, createdAt: -1 });
QuerySchema.index({ location: 1, categoryId: 1 });
QuerySchema.index({ createdAt: -1 });

/**
 * Virtual for completion percentage
 */
QuerySchema.virtual('completionPercentage').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'failed') return 0;
  if (this.totalResults === 0) return 0;
  
  // Estimate based on pages scraped (assuming 10 results per page)
  const estimatedTotal = Math.max(this.totalResults, this.lastPageScraped * 10);
  return Math.min(Math.round((this.totalResults / estimatedTotal) * 100), 100);
});

/**
 * Static methods
 */
QuerySchema.statics.findByCategory = function(categoryId: string) {
  return this.find({ categoryId }).populate('categoryId', 'name slug');
};

QuerySchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).populate('categoryId', 'name slug');
};

QuerySchema.statics.findByLocation = function(location: string) {
  return this.find({ 
    location: new RegExp(location.trim(), 'i') 
  }).populate('categoryId', 'name slug');
};

QuerySchema.statics.getActiveQueries = function() {
  return this.find({ 
    status: { $in: ['pending', 'scraping'] } 
  }).populate('categoryId', 'name slug');
};

/**
 * Instance methods
 */
QuerySchema.methods.markAsStarted = function() {
  this.status = 'scraping';
  return this.save();
};

QuerySchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  return this.save();
};

QuerySchema.methods.markAsFailed = function() {
  this.status = 'failed';
  return this.save();
};

QuerySchema.methods.updateProgress = function(totalResults: number, lastPage: number) {
  this.totalResults = totalResults;
  this.lastPageScraped = lastPage;
  return this.save();
};

/**
 * Pre-save middleware
 */
QuerySchema.pre('save', function(next) {
  // Trim and clean text fields
  if (this.isModified('dork')) {
    this.dork = this.dork.trim();
  }
  if (this.isModified('location')) {
    this.location = this.location.trim();
  }
  next();
});

/**
 * Export Query model
 * Use existing model if already compiled, otherwise create new one
 */
export const Query: Model<IQuery> = 
  mongoose.models.Query || mongoose.model<IQuery>('Query', QuerySchema);

export default Query;
