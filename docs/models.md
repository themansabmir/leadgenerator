// ===================================
// FILE: src/lib/db/mongodb.ts
// MongoDB Connection Utility
// ===================================

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

// ===================================
// FILE: src/types/index.ts
// TypeScript Interfaces
// ===================================

import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string; // hashed
  createdAt: Date;
}

export interface ICredential {
  _id: Types.ObjectId;
  label: string; // "API Key 1", "Work API", etc.
  apiKey: string; // encrypted
  engineId: string; // encrypted
  createdAt: Date;
}

export interface ICategory {
  _id: Types.ObjectId;
  name: string; // "Cafe", "Restaurant", etc.
  slug: string; // "cafe", "restaurant"
  createdAt: Date;
}

export interface IQuery {
  _id: Types.ObjectId;
  dork: string; // Google dork query
  categoryId: Types.ObjectId; // ref: Category
  location: string; // "London", "Paris", etc.
  status: 'pending' | 'scraping' | 'completed' | 'failed';
  totalResults: number; // count of URLs scraped
  lastPageScraped: number; // last page number processed
  createdAt: Date;
  updatedAt: Date;
}

export interface IResult {
  _id: Types.ObjectId;
  queryId: Types.ObjectId; // ref: Query
  url: string;
  title: string;
  snippet: string;
  pageNumber: number; // which page this result came from (1, 2, 3...)
  position: number; // position in results (1-10)
  extractionStatus: 'pending' | 'processing' | 'extracted' | 'failed' | 'no_data';
  scrapedAt: Date;
}

export interface ICustomerInfo {
  _id: Types.ObjectId;
  resultId: Types.ObjectId; // ref: Result
  queryId: Types.ObjectId; // ref: Query
  categoryId: Types.ObjectId; // ref: Category
  location: string;
  url: string;
  emails: string[]; // all emails found
  phones: string[]; // all phones found
  primaryEmail: string | null; // first email or null
  primaryPhone: string | null; // first phone or null
  emailsSentCount: number; // how many emails sent to this customer
  lastEmailType: string | null; // 'first_email', 'follow_up_1', etc.
  lastContactedAt: Date | null;
  isLead: boolean; // converted to lead?
  leadId: Types.ObjectId | null; // ref: Lead (if converted)
  isUnsubscribed: boolean; // opted out of emails
  extractedAt: Date;
  updatedAt: Date;
}

export interface ILead {
  _id: Types.ObjectId;
  customerInfoId: Types.ObjectId; // ref: CustomerInfo
  categoryId: Types.ObjectId; // ref: Category
  location: string;
  url: string;
  emails: string[];
  phones: string[];
  primaryEmail: string;
  primaryPhone: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high';
  notes: string; // rich text notes
  emailsSent: number;
  lastEmailType: string | null;
  lastContactedAt: Date | null;
  repliedAt: Date | null; // when customer replied
  convertedAt: Date;
  nextFollowUpDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailTemplate {
  _id: Types.ObjectId;
  categoryId: Types.ObjectId | null; // ref: Category (nullable for global templates)
  location: string | null; // "London" or null for global
  templateType: 'first_email' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3';
  subject: string; // can include {{variables}}
  bodyTemplate: string; // HTML with Handlebars {{variables}}
  variables: {
    key: string;
    source: string;
    value?: string;
    default?: string;
  }[]; // metadata about available variables
  createdAt: Date;
  updatedAt: Date;
}

export interface ICampaign {
  _id: Types.ObjectId;
  filters: {
    categoryId: Types.ObjectId | null; // ref: Category
    location: string | null;
  };
  emailType: 'first_email' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3';
  totalEligible: number; // total customers eligible at start
  sentCount: number; // emails sent so far
  failedCount: number; // failed emails
  processedCustomerIds: Types.ObjectId[]; // refs: CustomerInfo (already processed)
  status: 'running' | 'paused' | 'completed' | 'stopped';
  dailyLimit: number; // max emails per day (default 500)
  startedAt: Date;
  pausedAt: Date | null;
  completedAt: Date | null;
  stoppedAt: Date | null;
}

export interface IEmailLog {
  _id: Types.ObjectId;
  campaignId: Types.ObjectId; // ref: Campaign
  customerInfoId: Types.ObjectId; // ref: CustomerInfo
  recipientEmail: string;
  emailType: 'first_email' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3';
  sentAt: Date;
  status: 'sent' | 'failed' | 'bounced';
  error: string | null; // error message if failed
  attemptCount: number; // which email in sequence (1-4)
}

// ===================================
// FILE: src/lib/db/models/User.ts
// ===================================

import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '@/types';

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

// ===================================
// FILE: src/lib/db/models/Credential.ts
// ===================================

import mongoose, { Schema, Model } from 'mongoose';
import { ICredential } from '@/types';

const CredentialSchema = new Schema<ICredential>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    apiKey: {
      type: String,
      required: true, // encrypted value
    },
    engineId: {
      type: String,
      required: true, // encrypted value
    },
  },
  {
    timestamps: true,
  }
);

const Credential: Model<ICredential> =
  mongoose.models.Credential ||
  mongoose.model<ICredential>('Credential', CredentialSchema);

export default Credential;

// ===================================
// FILE: src/lib/db/models/Category.ts
// ===================================

import mongoose, { Schema, Model } from 'mongoose';
import { ICategory } from '@/types';

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CategorySchema.index({ slug: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>('Category', CategorySchema);

export default Category;

// ===================================
// FILE: src/lib/db/models/Query.ts
// ===================================

import mongoose, { Schema, Model } from 'mongoose';
import { IQuery } from '@/types';

const QuerySchema = new Schema<IQuery>(
  {
    dork: {
      type: String,
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'scraping', 'completed', 'failed'],
      default: 'pending',
    },
    totalResults: {
      type: Number,
      default: 0,
    },
    lastPageScraped: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
QuerySchema.index({ categoryId: 1, status: 1 });
QuerySchema.index({ createdAt: -1 });

const Query: Model<IQuery> =
  mongoose.models.Query || mongoose.model<IQuery>('Query', QuerySchema);

export default Query;

// ===================================
// FILE: src/lib/db/models/Result.ts
// ===================================

import mongoose, { Schema, Model } from 'mongoose';
import { IResult } from '@/types';

const ResultSchema = new Schema<IResult>(
  {
    queryId: {
      type: Schema.Types.ObjectId,
      ref: 'Query',
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    snippet: {
      type: String,
      default: '',
    },
    pageNumber: {
      type: Number,
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    extractionStatus: {
      type: String,
      enum: ['pending', 'processing', 'extracted', 'failed', 'no_data'],
      default: 'pending',
    },
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
ResultSchema.index({ queryId: 1, extractionStatus: 1 });
ResultSchema.index({ queryId: 1, scrapedAt: -1 });

const Result: Model<IResult> =
  mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);

export default Result;

// ===================================
// FILE: src/lib/db/models/CustomerInfo.ts
// ===================================

import mongoose, { Schema, Model } from 'mongoose';
import { ICustomerInfo } from '@/types';

const CustomerInfoSchema = new Schema<ICustomerInfo>(
  {
    resultId: {
      type: Schema.Types.ObjectId,
      ref: 'Result',
      required: true,
    },
    queryId: {
      type: Schema.Types.ObjectId,
      ref: 'Query',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    emails: {
      type: [String],
      default: [],
    },
    phones: {
      type: [String],
      default: [],
    },
    primaryEmail: {
      type: String,
      default: null,
    },
    primaryPhone: {
      type: String,
      default: null,
    },
    emailsSentCount: {
      type: Number,
      default: 0,
    },
    lastEmailType: {
      type: String,
      default: null,
    },
    lastContactedAt: {
      type: Date,
      default: null,
    },
    isLead: {
      type: Boolean,
      default: false,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
    isUnsubscribed: {
      type: Boolean,
      default: false,
    },
    extractedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CustomerInfoSchema.index({ categoryId: 1, location: 1 });
CustomerInfoSchema.index({ isLead: 1, isUnsubscribed: 1, emailsSentCount: 1 });
CustomerInfoSchema.index({ queryId: 1 });
CustomerInfoSchema.index({ primaryEmail: 1 });

const CustomerInfo: Model<ICustomerInfo> =
  mongoose.models.CustomerInfo ||
  mongoose.model<ICustomerInfo>('CustomerInfo', CustomerInfoSchema);

export default CustomerInfo;

// ===================================
// FILE: src/lib/db/models/Lead.ts
// ===================================

import mongoose, { Schema, Model } from 'mongoose';
import { ILead } from '@/types';

const LeadSchema = new Schema<ILead>(
  {
    customerInfoId: {
      type: Schema.Types.ObjectId,
      ref: 'CustomerInfo',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    emails: {
      type: [String],
      default: [],
    },
    phones: {
      type: [String],
      default: [],
    },
    primaryEmail: {
      type: String,
      required: true,
    },
    primaryPhone: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    notes: {
      type: String,
      default: '',
    },
    emailsSent: {
      type: Number,
      default: 0,
    },
    lastEmailType: {
      type: String,
      default: null,
    },
    lastContactedAt: {
      type: Date,
      default: null,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    convertedAt: {
      type: Date,
      default: Date.now,
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LeadSchema.index({ status: 1, priority: 1 });
LeadSchema.index({ categoryId: 1, location: 1 });
LeadSchema.index({ nextFollowUpDate: 1 });
LeadSchema.index({ createdAt: -1 });

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;

// ===================================
// FILE: src/lib/db/models/EmailTemplate.ts
// ===================================

import mongoose, { Schema, Model } from 'mongoose';
import { IEmailTemplate } from '@/types';

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // null = global template
    },
    location: {
      type: String,
      default: null, // null = applies to all locations
    },
    templateType: {
      type: String,
      enum: ['first_email', 'follow_up_1', 'follow_up_2', 'follow_up_3'],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    bodyTemplate: {
      type: String,
      required: true,
    },
    variables: {
      type: [
        {
          key: String,
          source: String,
          value: String,
          default: String,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EmailTemplateSchema.index({ categoryId: 1, location: 1, templateType: 1 });
EmailTemplateSchema.index({ templateType: 1 });

const EmailTemplate: Model<IEmailTemplate> =
  mongoose.models.EmailTemplate ||
  mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);

export default EmailTemplate;

// ===================================
// FILE: src/lib/db/models/Campaign.ts
// ===================================

import mongoose, { Schema, Model } from 'mongoose';
import { ICampaign } from '@/types';

const CampaignSchema = new Schema<ICampaign>(
  {
    filters: {
      categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
      },
      location: {
        type: String,
        default: null,
      },
    },
    emailType: {
      type: String,
      enum: ['first_email', 'follow_up_1', 'follow_up_2', 'follow_up_3'],
      required: true,
    },
    totalEligible: {
      type: Number,
      default: 0,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    processedCustomerIds: {
      type: [Schema.Types.ObjectId],
      ref: 'CustomerInfo',
      default: [],
    },
    status: {
      type: String,
      enum: ['running', 'paused', 'completed', 'stopped'],
      default: 'running',
    },
    dailyLimit: {
      type: Number,
      default: 500,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    stoppedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ startedAt: -1 });

const Campaign: Model<ICampaign> =
  mongoose.models.Campaign ||
  mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;

// ===================================
// FILE: src/lib/db/models/EmailLog.ts
// ===================================

import mongoose, { Schema, Model } from 'mongoose';
import { IEmailLog } from '@/types';

const EmailLogSchema = new Schema<IEmailLog>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    customerInfoId: {
      type: Schema.Types.ObjectId,
      ref: 'CustomerInfo',
      required: true,
    },
    recipientEmail: {
      type: String,
      required: true,
    },
    emailType: {
      type: String,
      enum: ['first_email', 'follow_up_1', 'follow_up_2', 'follow_up_3'],
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'bounced'],
      default: 'sent',
    },
    error: {
      type: String,
      default: null,
    },
    attemptCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
EmailLogSchema.index({ campaignId: 1, sentAt: -1 });
EmailLogSchema.index({ customerInfoId: 1 });
EmailLogSchema.index({ sentAt: -1 });

const EmailLog: Model<IEmailLog> =
  mongoose.models.EmailLog ||
  mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);

export default EmailLog;

// ===================================
// EXPORT ALL MODELS
// FILE: src/lib/db/models/index.ts
// ===================================

export { default as User } from './User';
export { default as Credential } from './Credential';
export { default as Category } from './Category';
export { default as Query } from './Query';
export { default as Result } from './Result';
export { default as CustomerInfo } from './CustomerInfo';
export { default as Lead } from './Lead';
export { default as EmailTemplate } from './EmailTemplate';
export { default as Campaign } from './Campaign';
export { default as EmailLog } from './EmailLog';