/**
 * EmailLog Model
 * MongoDB model for tracking sent emails and campaign performance
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IEmailLog } from '@/types';

/**
 * EmailLog Schema Definition
 */
const EmailLogSchema = new Schema<IEmailLog>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: [true, 'Campaign ID is required'],
      index: true
    },
    customerInfoId: {
      type: Schema.Types.ObjectId,
      ref: 'CustomerInfo',
      required: [true, 'Customer Info ID is required'],
      index: true
    },
    recipientEmail: {
      type: String,
      required: [true, 'Recipient email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(email: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Recipient email must be a valid email address'
      },
      index: true
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
    sentAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['sent', 'failed', 'bounced'],
        message: 'Status must be one of: sent, failed, bounced'
      },
      default: 'sent',
      index: true
    },
    error: {
      type: String,
      default: null,
      maxlength: [1000, 'Error message cannot exceed 1000 characters']
    },
    attemptCount: {
      type: Number,
      default: 1,
      min: [1, 'Attempt count must be at least 1'],
      max: [10, 'Attempt count cannot exceed 10']
    }
  },
  {
    timestamps: false, // Using sentAt instead
    collection: 'emaillogs'
  }
);

/**
 * Indexes for performance
 */
EmailLogSchema.index({ campaignId: 1, sentAt: -1 });
EmailLogSchema.index({ customerInfoId: 1, emailType: 1 });
EmailLogSchema.index({ recipientEmail: 1, sentAt: -1 });
EmailLogSchema.index({ status: 1, sentAt: -1 });
EmailLogSchema.index({ sentAt: -1 });

/**
 * Compound index for campaign analytics
 */
EmailLogSchema.index({ 
  campaignId: 1, 
  status: 1, 
  sentAt: -1 
});

/**
 * Static methods
 */
EmailLogSchema.statics.findByCampaign = function(campaignId: string, limit?: number) {
  const query = this.find({ campaignId })
    .populate('customerInfoId', 'url primaryEmail location')
    .sort({ sentAt: -1 });
  
  if (limit) {
    query.limit(limit);
  }
  
  return query;
};

EmailLogSchema.statics.findByCustomer = function(customerInfoId: string) {
  return this.find({ customerInfoId })
    .populate('campaignId', 'emailType filters')
    .sort({ sentAt: -1 });
};

EmailLogSchema.statics.getCampaignStats = function(campaignId: string) {
  return this.aggregate([
    {
      $match: { campaignId: new mongoose.Types.ObjectId(campaignId) }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        latestSent: { $max: '$sentAt' },
        earliestSent: { $min: '$sentAt' }
      }
    }
  ]);
};

EmailLogSchema.statics.getDailyStats = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  return this.aggregate([
    {
      $match: {
        sentAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$sentAt' }
          },
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        sent: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'sent'] }, '$count', 0]
          }
        },
        failed: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'failed'] }, '$count', 0]
          }
        },
        bounced: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'bounced'] }, '$count', 0]
          }
        }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
};

EmailLogSchema.statics.getEmailTypePerformance = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$emailType',
        totalSent: { $sum: 1 },
        successful: {
          $sum: {
            $cond: [{ $eq: ['$status', 'sent'] }, 1, 0]
          }
        },
        failed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
          }
        },
        bounced: {
          $sum: {
            $cond: [{ $eq: ['$status', 'bounced'] }, 1, 0]
          }
        }
      }
    },
    {
      $addFields: {
        successRate: {
          $multiply: [
            { $divide: ['$successful', '$totalSent'] },
            100
          ]
        }
      }
    }
  ]);
};

EmailLogSchema.statics.getTodaysSentCount = function(campaignId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const match: any = {
    sentAt: { $gte: today, $lt: tomorrow },
    status: 'sent'
  };
  
  if (campaignId) {
    match.campaignId = new mongoose.Types.ObjectId(campaignId);
  }
  
  return this.countDocuments(match);
};

EmailLogSchema.statics.getBouncedEmails = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    status: 'bounced',
    sentAt: { $gte: startDate }
  })
    .select('recipientEmail sentAt customerInfoId')
    .sort({ sentAt: -1 });
};

/**
 * Instance methods
 */
EmailLogSchema.methods.markAsFailed = function(errorMessage: string) {
  this.status = 'failed';
  this.error = errorMessage;
  return this.save();
};

EmailLogSchema.methods.markAsBounced = function() {
  this.status = 'bounced';
  return this.save();
};

EmailLogSchema.methods.incrementAttempt = function() {
  this.attemptCount += 1;
  return this.save();
};

/**
 * Pre-save middleware
 */
EmailLogSchema.pre('save', function(next) {
  // Clean recipient email
  if (this.isModified('recipientEmail')) {
    this.recipientEmail = this.recipientEmail.trim().toLowerCase();
  }
  
  // Trim error message
  if (this.isModified('error') && this.error) {
    this.error = this.error.trim();
  }
  
  next();
});

/**
 * Post-save middleware to update campaign stats
 */
EmailLogSchema.post('save', async function() {
  try {
    const Campaign = mongoose.models.Campaign;
    if (!Campaign) return;
    
    const campaign = await Campaign.findById(this.campaignId);
    if (!campaign) return;
    
    // Update campaign counters
    if (this.status === 'sent') {
      await campaign.recordEmailSent(this.customerInfoId.toString());
    } else if (['failed', 'bounced'].includes(this.status)) {
      await campaign.recordEmailFailed(this.customerInfoId.toString());
    }
  } catch (error) {
    console.error('Error updating campaign stats:', error);
  }
});

/**
 * Prevent duplicate logs for same customer/campaign/email type
 */
EmailLogSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  const existingLog = await mongoose.models.EmailLog.findOne({
    campaignId: this.campaignId,
    customerInfoId: this.customerInfoId,
    emailType: this.emailType,
    status: 'sent'
  });
  
  if (existingLog) {
    const error = new Error('Email already sent to this customer for this campaign and email type');
    return next(error);
  }
  
  next();
});

/**
 * Export EmailLog model
 * Use existing model if already compiled, otherwise create new one
 */
export const EmailLog: Model<IEmailLog> = 
  mongoose.models.EmailLog || mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);

export default EmailLog;
