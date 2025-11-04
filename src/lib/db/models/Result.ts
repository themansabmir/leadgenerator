/**
 * Result Model
 * MongoDB model for individual search results from Google queries
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IResult } from '@/types';

/**
 * Result Schema Definition
 */
const ResultSchema = new Schema<IResult>(
  {
    queryId: {
      type: Schema.Types.ObjectId,
      ref: 'Query',
      required: [true, 'Query ID is required'],
      index: true
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      maxlength: [2000, 'URL cannot exceed 2000 characters']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [500, 'Title cannot exceed 500 characters']
    },
    snippet: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Snippet cannot exceed 1000 characters']
    },
    pageNumber: {
      type: Number,
      required: [true, 'Page number is required'],
      min: [1, 'Page number must be at least 1']
    },
    position: {
      type: Number,
      required: [true, 'Position is required'],
      min: [1, 'Position must be at least 1'],
      max: [100, 'Position cannot exceed 100']
    },
    extractionStatus: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'extracted', 'failed', 'no_data'],
        message: 'Extraction status must be one of: pending, processing, extracted, failed, no_data'
      },
      default: 'pending',
      index: true
    },
    scrapedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false, // Using scrapedAt instead
    collection: 'results'
  }
);

/**
 * Indexes for performance
 */
ResultSchema.index({ queryId: 1, extractionStatus: 1 });
ResultSchema.index({ queryId: 1, scrapedAt: -1 });
ResultSchema.index({ extractionStatus: 1, scrapedAt: -1 });
ResultSchema.index({ url: 1 }); // For duplicate detection
ResultSchema.index({ queryId: 1, pageNumber: 1, position: 1 }); // Compound for ordering

/**
 * Static methods
 */
ResultSchema.statics.findByQuery = function(queryId: string) {
  return this.find({ queryId })
    .sort({ pageNumber: 1, position: 1 })
    .populate('queryId', 'dork location status');
};

ResultSchema.statics.findByExtractionStatus = function(status: string) {
  return this.find({ extractionStatus: status })
    .populate('queryId', 'dork location categoryId');
};

ResultSchema.statics.getPendingExtraction = function(limit: number = 100) {
  return this.find({ extractionStatus: 'pending' })
    .limit(limit)
    .sort({ scrapedAt: 1 }) // Oldest first
    .populate('queryId', 'dork location categoryId');
};

ResultSchema.statics.getExtractionStats = function(queryId?: string) {
  const match = queryId ? { queryId: new mongoose.Types.ObjectId(queryId) } : {};
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$extractionStatus',
        count: { $sum: 1 }
      }
    }
  ]);
};

/**
 * Instance methods
 */
ResultSchema.methods.markAsProcessing = function() {
  this.extractionStatus = 'processing';
  return this.save();
};

ResultSchema.methods.markAsExtracted = function() {
  this.extractionStatus = 'extracted';
  return this.save();
};

ResultSchema.methods.markAsFailed = function() {
  this.extractionStatus = 'failed';
  return this.save();
};

ResultSchema.methods.markAsNoData = function() {
  this.extractionStatus = 'no_data';
  return this.save();
};

/**
 * Pre-save middleware
 */
ResultSchema.pre('save', function(next) {
  // Trim and clean text fields
  if (this.isModified('url')) {
    this.url = this.url.trim();
  }
  if (this.isModified('title')) {
    this.title = this.title.trim();
  }
  if (this.isModified('snippet')) {
    this.snippet = this.snippet.trim();
  }
  next();
});

/**
 * Prevent duplicate URLs for the same query
 */
ResultSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  const existingResult = await mongoose.models.Result.findOne({
    queryId: this.queryId,
    url: this.url
  });
  
  if (existingResult) {
    const error = new Error('URL already exists for this query');
    return next(error);
  }
  
  next();
});

/**
 * Export Result model
 * Use existing model if already compiled, otherwise create new one
 */
export const Result: Model<IResult> = 
  mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);

export default Result;
