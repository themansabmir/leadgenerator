/**
 * Lead Model
 * MongoDB model for qualified leads converted from customer info
 */

import mongoose, { Schema, Model } from 'mongoose';
import { ILead } from '@/types';

/**
 * Lead Schema Definition
 */
const LeadSchema = new Schema<ILead>(
  {
    customerInfoId: {
      type: Schema.Types.ObjectId,
      ref: 'CustomerInfo',
      required: [true, 'Customer Info ID is required'],
      unique: true, // One lead per customer info
      index: true
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required'],
      index: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      maxlength: [2000, 'URL cannot exceed 2000 characters']
    },
    emails: {
      type: [String],
      default: [],
      validate: {
        validator: function(emails: string[]) {
          return emails.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
        },
        message: 'All emails must be valid email addresses'
      }
    },
    phones: {
      type: [String],
      default: [],
      validate: {
        validator: function(phones: string[]) {
          return phones.every(phone => /^[\d\s\-\+\(\)\.]+$/.test(phone));
        },
        message: 'All phone numbers must contain only valid characters'
      }
    },
    primaryEmail: {
      type: String,
      required: [true, 'Primary email is required'],
      validate: {
        validator: function(email: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Primary email must be a valid email address'
      },
      index: true
    },
    primaryPhone: {
      type: String,
      default: null,
      validate: {
        validator: function(phone: string) {
          return !phone || /^[\d\s\-\+\(\)\.]+$/.test(phone);
        },
        message: 'Primary phone must contain only valid characters'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'],
        message: 'Status must be one of: new, contacted, qualified, proposal_sent, won, lost'
      },
      default: 'new',
      index: true
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be one of: low, medium, high'
      },
      default: 'medium',
      index: true
    },
    notes: {
      type: String,
      default: '',
      maxlength: [5000, 'Notes cannot exceed 5000 characters']
    },
    emailsSent: {
      type: Number,
      default: 0,
      min: [0, 'Emails sent cannot be negative']
    },
    lastEmailType: {
      type: String,
      enum: {
        values: ['first_email', 'follow_up_1', 'follow_up_2', 'follow_up_3'],
        message: 'Last email type must be one of: first_email, follow_up_1, follow_up_2, follow_up_3'
      },
      default: null
    },
    lastContactedAt: {
      type: Date,
      default: null,
      index: true
    },
    repliedAt: {
      type: Date,
      default: null,
      index: true
    },
    convertedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'leads'
  }
);

/**
 * Indexes for performance
 */
LeadSchema.index({ status: 1, priority: 1 });
LeadSchema.index({ categoryId: 1, location: 1 });
LeadSchema.index({ nextFollowUpDate: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ lastContactedAt: -1 });
LeadSchema.index({ repliedAt: -1 });

/**
 * Virtual for lead score
 */
LeadSchema.virtual('leadScore').get(function() {
  let score = 0;
  
  // Base score
  score += 20;
  
  // Status scoring
  const statusScores = {
    'new': 10,
    'contacted': 20,
    'qualified': 40,
    'proposal_sent': 60,
    'won': 100,
    'lost': 0
  };
  score += statusScores[this.status] || 0;
  
  // Priority scoring
  const priorityScores = {
    'low': 5,
    'medium': 15,
    'high': 25
  };
  score += priorityScores[this.priority] || 0;
  
  // Engagement scoring
  if (this.repliedAt) score += 30;
  if (this.emailsSent > 0) score += 10;
  if (this.phones.length > 0) score += 10;
  
  return Math.min(score, 100);
});

/**
 * Virtual for days since conversion
 */
LeadSchema.virtual('daysSinceConversion').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.convertedAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

/**
 * Static methods
 */
LeadSchema.statics.findByStatus = function(status: string) {
  return this.find({ status })
    .populate('categoryId', 'name slug')
    .populate('customerInfoId', 'url extractedAt')
    .sort({ createdAt: -1 });
};

LeadSchema.statics.findByPriority = function(priority: string) {
  return this.find({ priority })
    .populate('categoryId', 'name slug')
    .sort({ createdAt: -1 });
};

LeadSchema.statics.findDueForFollowUp = function() {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  return this.find({
    nextFollowUpDate: { $lte: today },
    status: { $nin: ['won', 'lost'] }
  })
    .populate('categoryId', 'name slug')
    .sort({ nextFollowUpDate: 1 });
};

LeadSchema.statics.getLeadStats = function(categoryId?: string, location?: string) {
  const match: any = {};
  if (categoryId) match.categoryId = new mongoose.Types.ObjectId(categoryId);
  if (location) match.location = new RegExp(location.trim(), 'i');
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgEmailsSent: { $avg: '$emailsSent' }
      }
    }
  ]);
};

LeadSchema.statics.getConversionFunnel = function(categoryId?: string) {
  const match: any = {};
  if (categoryId) match.categoryId = new mongoose.Types.ObjectId(categoryId);
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        contacted: { $sum: { $cond: [{ $eq: ['$status', 'contacted'] }, 1, 0] } },
        qualified: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
        proposal_sent: { $sum: { $cond: [{ $eq: ['$status', 'proposal_sent'] }, 1, 0] } },
        won: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
        lost: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } }
      }
    }
  ]);
};

/**
 * Instance methods
 */
LeadSchema.methods.updateStatus = function(status: string, notes?: string) {
  this.status = status;
  if (notes) {
    this.notes = notes;
  }
  
  // Set follow-up dates based on status
  if (status === 'contacted') {
    this.nextFollowUpDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
  } else if (status === 'qualified') {
    this.nextFollowUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
  } else if (status === 'proposal_sent') {
    this.nextFollowUpDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days
  } else if (['won', 'lost'].includes(status)) {
    this.nextFollowUpDate = null; // No follow-up needed
  }
  
  return this.save();
};

LeadSchema.methods.recordReply = function() {
  this.repliedAt = new Date();
  return this.save();
};

LeadSchema.methods.recordEmailSent = function(emailType: string) {
  this.emailsSent += 1;
  this.lastEmailType = emailType;
  this.lastContactedAt = new Date();
  return this.save();
};

LeadSchema.methods.scheduleFollowUp = function(days: number) {
  this.nextFollowUpDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return this.save();
};

/**
 * Pre-save middleware
 */
LeadSchema.pre('save', function(next) {
  // Ensure primary email is in emails array
  if (this.primaryEmail && !this.emails.includes(this.primaryEmail)) {
    this.emails.unshift(this.primaryEmail);
  }
  
  // Ensure primary phone is in phones array
  if (this.primaryPhone && !this.phones.includes(this.primaryPhone)) {
    this.phones.unshift(this.primaryPhone);
  }
  
  // Clean and deduplicate arrays
  if (this.isModified('emails')) {
    this.emails = this.emails
      .map(email => email.trim().toLowerCase())
      .filter((email, index, arr) => arr.indexOf(email) === index);
  }
  
  if (this.isModified('phones')) {
    this.phones = this.phones
      .map(phone => phone.trim())
      .filter((phone, index, arr) => arr.indexOf(phone) === index);
  }
  
  next();
});

/**
 * Export Lead model
 * Use existing model if already compiled, otherwise create new one
 */
export const Lead: Model<ILead> = 
  mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
