/**
 * Campaign Model
 * MongoDB model for email campaigns and bulk sending
 */

import mongoose, { Schema, Model } from 'mongoose';
import { ICampaign } from '../../../types';

/**
 * Campaign Filters Schema
 */
const FiltersSchema = new Schema({
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  location: {
    type: String,
    default: null,
    trim: true
  }
}, { _id: false });

/**
 * Campaign Schema Definition
 */
const CampaignSchema = new Schema<ICampaign>(
  {
    filters: {
      type: FiltersSchema,
      required: true,
      default: {}
    },
    emailType: {
      type: String,
      enum: {
        values: ['first_email', 'follow_up_1', 'follow_up_2', 'follow_up_3'],
        message: 'Email type must be one of: first_email, follow_up_1, follow_up_2, follow_up_3'
      },
      required: [true, 'Email type is required'],
      index: true
    },
    totalEligible: {
      type: Number,
      default: 0,
      min: [0, 'Total eligible cannot be negative']
    },
    sentCount: {
      type: Number,
      default: 0,
      min: [0, 'Sent count cannot be negative']
    },
    failedCount: {
      type: Number,
      default: 0,
      min: [0, 'Failed count cannot be negative']
    },
    processedCustomerIds: {
      type: [Schema.Types.ObjectId],
      ref: 'CustomerInfo',
      default: [],
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['running', 'paused', 'completed', 'stopped'],
        message: 'Status must be one of: running, paused, completed, stopped'
      },
      default: 'running',
      index: true
    },
    dailyLimit: {
      type: Number,
      default: 500,
      min: [1, 'Daily limit must be at least 1'],
      max: [10000, 'Daily limit cannot exceed 10000']
    },
    startedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    pausedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    stoppedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: false, // Using custom date fields
    collection: 'campaigns'
  }
);

/**
 * Indexes for performance
 */
CampaignSchema.index({ status: 1, startedAt: -1 });
CampaignSchema.index({ 'filters.categoryId': 1, 'filters.location': 1 });
CampaignSchema.index({ emailType: 1, status: 1 });
CampaignSchema.index({ startedAt: -1 });

/**
 * Virtual for completion percentage
 */
CampaignSchema.virtual('completionPercentage').get(function() {
  if (this.totalEligible === 0) return 0;
  return Math.round((this.sentCount / this.totalEligible) * 100);
});

/**
 * Virtual for success rate
 */
CampaignSchema.virtual('successRate').get(function() {
  const totalAttempted = this.sentCount + this.failedCount;
  if (totalAttempted === 0) return 100;
  return Math.round((this.sentCount / totalAttempted) * 100);
});

/**
 * Virtual for remaining emails
 */
CampaignSchema.virtual('remainingEmails').get(function() {
  const self = this as any;
  const totalEligible = Number(self.totalEligible) || 0;
  const sentCount = Number(self.sentCount) || 0;
  const failedCount = Number(self.failedCount) || 0;
  return Math.max(0, totalEligible - sentCount - failedCount);
});

/**
 * Virtual for estimated completion time
 */
CampaignSchema.virtual('estimatedCompletionDays').get(function() {
  const self = this as any;
  const totalEligible = Number(self.totalEligible) || 0;
  const sentCount = Number(self.sentCount) || 0;
  const failedCount = Number(self.failedCount) || 0;
  const remaining = Math.max(0, totalEligible - sentCount - failedCount);
  const dailyLimit = Number(self.dailyLimit) || 0;
  if (remaining === 0 || dailyLimit === 0) return 0;
  return Math.ceil(remaining / dailyLimit);
});

/**
 * Static methods
 */
CampaignSchema.statics.findActive = function() {
  return this.find({ 
    status: { $in: ['running', 'paused'] } 
  })
    .populate('filters.categoryId', 'name slug')
    .sort({ startedAt: -1 });
};

CampaignSchema.statics.findByStatus = function(status: string) {
  return this.find({ status })
    .populate('filters.categoryId', 'name slug')
    .sort({ startedAt: -1 });
};

CampaignSchema.statics.getCampaignStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalSent: { $sum: '$sentCount' },
        totalFailed: { $sum: '$failedCount' },
        avgDailyLimit: { $avg: '$dailyLimit' }
      }
    }
  ]);
};

CampaignSchema.statics.getPerformanceMetrics = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        startedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$startedAt' }
        },
        campaignsStarted: { $sum: 1 },
        totalSent: { $sum: '$sentCount' },
        totalFailed: { $sum: '$failedCount' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
};

/**
 * Instance methods
 */
CampaignSchema.methods.pause = function() {
  if (this.status === 'running') {
    this.status = 'paused';
    this.pausedAt = new Date();
  }
  return this.save();
};

CampaignSchema.methods.resume = function() {
  if (this.status === 'paused') {
    this.status = 'running';
    this.pausedAt = null;
  }
  return this.save();
};

CampaignSchema.methods.stop = function() {
  if (['running', 'paused'].includes(this.status)) {
    this.status = 'stopped';
    this.stoppedAt = new Date();
  }
  return this.save();
};

CampaignSchema.methods.complete = function() {
  if (['running', 'paused'].includes(this.status)) {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  return this.save();
};

CampaignSchema.methods.recordEmailSent = function(customerInfoId: string) {
  this.sentCount += 1;
  if (!this.processedCustomerIds.includes(customerInfoId)) {
    this.processedCustomerIds.push(customerInfoId);
  }
  
  // Auto-complete if all emails sent
  if (this.sentCount + this.failedCount >= this.totalEligible) {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

CampaignSchema.methods.recordEmailFailed = function(customerInfoId: string) {
  this.failedCount += 1;
  if (!this.processedCustomerIds.includes(customerInfoId)) {
    this.processedCustomerIds.push(customerInfoId);
  }
  
  // Auto-complete if all emails processed
  if (this.sentCount + this.failedCount >= this.totalEligible) {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

CampaignSchema.methods.canSendToday = function() {
  if (this.status !== 'running') return false;
  
  // Check if we've reached daily limit
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // This would need to be implemented with EmailLog aggregation
  // For now, return true
  return true;
};

/**
 * Pre-save middleware
 */
CampaignSchema.pre('save', function(next) {
  // Validate status transitions
  if (this.isModified('status')) {
    const validTransitions: Record<string, string[]> = {
      'running': ['paused', 'completed', 'stopped'],
      'paused': ['running', 'completed', 'stopped'],
      'completed': [], // Terminal state
      'stopped': [] // Terminal state
    };
    
    const currentStatus = String((this as any).status);
    const changes = (this as any).getChanges ? (this as any).getChanges() : undefined;
    const previousStatus = changes?.$set?.status as string | undefined;

    if (previousStatus && Array.isArray(validTransitions[previousStatus]) && !validTransitions[previousStatus].includes(currentStatus)) {
      return next(new Error(`Invalid status transition from ${previousStatus} to ${currentStatus}`));
    }
  }
  
  next();
});

/**
 * Export Campaign model
 * Use existing model if already compiled, otherwise create new one
 */
export const Campaign: Model<ICampaign> = 
  mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;
