/**
 * CustomerInfo Model
 * MongoDB model for extracted customer contact information
 */

import mongoose, { Schema, Model } from 'mongoose';
import { ICustomerInfo } from '@/types';

/**
 * CustomerInfo Schema Definition
 */
const CustomerInfoSchema = new Schema<ICustomerInfo>(
  {
    resultId: {
      type: Schema.Types.ObjectId,
      ref: 'Result',
      required: [true, 'Result ID is required'],
      index: true
    },
    queryId: {
      type: Schema.Types.ObjectId,
      ref: 'Query',
      required: [true, 'Query ID is required'],
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
      default: null,
      validate: {
        validator: function(email: string) {
          return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    emailsSentCount: {
      type: Number,
      default: 0,
      min: [0, 'Emails sent count cannot be negative']
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
    isLead: {
      type: Boolean,
      default: false,
      index: true
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
      index: true
    },
    isUnsubscribed: {
      type: Boolean,
      default: false,
      index: true
    },
    extractedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'customerinfos'
  }
);

/**
 * Indexes for performance
 */
CustomerInfoSchema.index({ categoryId: 1, location: 1 });
CustomerInfoSchema.index({ isLead: 1, isUnsubscribed: 1, emailsSentCount: 1 });
CustomerInfoSchema.index({ queryId: 1, extractedAt: -1 });
CustomerInfoSchema.index({ primaryEmail: 1 });
CustomerInfoSchema.index({ lastContactedAt: -1 });
CustomerInfoSchema.index({ extractedAt: -1 });

/**
 * Virtual for contact availability
 */
CustomerInfoSchema.virtual('hasContact').get(function() {
  return this.primaryEmail || this.primaryPhone;
});

CustomerInfoSchema.virtual('contactScore').get(function() {
  let score = 0;
  if (this.primaryEmail) score += 50;
  if (this.primaryPhone) score += 30;
  if (this.emails.length > 1) score += 10;
  if (this.phones.length > 1) score += 10;
  return Math.min(score, 100);
});

/**
 * Static methods
 */
CustomerInfoSchema.statics.findByCategory = function(categoryId: string, location?: string) {
  const query: any = { categoryId };
  if (location) {
    query.location = new RegExp(location.trim(), 'i');
  }
  return this.find(query)
    .populate('categoryId', 'name slug')
    .populate('queryId', 'dork location');
};

CustomerInfoSchema.statics.findEligibleForEmail = function(emailType: string, categoryId?: string, location?: string) {
  const query: any = {
    isUnsubscribed: false,
    primaryEmail: { $ne: null },
    $or: [
      { lastEmailType: null }, // Never contacted
      { lastEmailType: { $ne: emailType } } // Not this email type
    ]
  };
  
  if (categoryId) query.categoryId = categoryId;
  if (location) query.location = new RegExp(location.trim(), 'i');
  
  return this.find(query)
    .populate('categoryId', 'name slug')
    .sort({ extractedAt: 1 }); // Oldest first
};

CustomerInfoSchema.statics.getContactStats = function(categoryId?: string, location?: string) {
  const match: any = {};
  if (categoryId) match.categoryId = new mongoose.Types.ObjectId(categoryId);
  if (location) match.location = new RegExp(location.trim(), 'i');
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        withEmail: { $sum: { $cond: [{ $ne: ['$primaryEmail', null] }, 1, 0] } },
        withPhone: { $sum: { $cond: [{ $ne: ['$primaryPhone', null] }, 1, 0] } },
        leads: { $sum: { $cond: ['$isLead', 1, 0] } },
        unsubscribed: { $sum: { $cond: ['$isUnsubscribed', 1, 0] } },
        contacted: { $sum: { $cond: [{ $gt: ['$emailsSentCount', 0] }, 1, 0] } }
      }
    }
  ]);
};

/**
 * Instance methods
 */
CustomerInfoSchema.methods.convertToLead = function() {
  this.isLead = true;
  return this.save();
};

CustomerInfoSchema.methods.unsubscribe = function() {
  this.isUnsubscribed = true;
  return this.save();
};

CustomerInfoSchema.methods.recordEmailSent = function(emailType: string) {
  this.emailsSentCount += 1;
  this.lastEmailType = emailType;
  this.lastContactedAt = new Date();
  return this.save();
};

/**
 * Pre-save middleware
 */
CustomerInfoSchema.pre('save', function(next) {
  // Set primary email/phone from arrays if not set
  if (!this.primaryEmail && this.emails.length > 0) {
    this.primaryEmail = this.emails[0];
  }
  if (!this.primaryPhone && this.phones.length > 0) {
    this.primaryPhone = this.phones[0];
  }
  
  // Clean and validate data
  if (this.isModified('emails')) {
    this.emails = this.emails
      .map(email => email.trim().toLowerCase())
      .filter((email, index, arr) => arr.indexOf(email) === index); // Remove duplicates
  }
  
  if (this.isModified('phones')) {
    this.phones = this.phones
      .map(phone => phone.trim())
      .filter((phone, index, arr) => arr.indexOf(phone) === index); // Remove duplicates
  }
  
  next();
});

/**
 * Export CustomerInfo model
 * Use existing model if already compiled, otherwise create new one
 */
export const CustomerInfo: Model<ICustomerInfo> = 
  mongoose.models.CustomerInfo || mongoose.model<ICustomerInfo>('CustomerInfo', CustomerInfoSchema);

export default CustomerInfo;
