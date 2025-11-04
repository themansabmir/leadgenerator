/**
 * TypeScript Interfaces for Lead Harvester
 * Comprehensive type definitions for all database models
 */

import { Types, HydratedDocument } from 'mongoose';

// Base interfaces for all models
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

export interface ILocation {
  _id: Types.ObjectId;
  name: string; // "London", "New York"
  slug: string; // "london", "new-york"
  createdAt: Date;
}

export interface IDork {
  _id: Types.ObjectId;
  query: string; // "inurl:\"/wp-content/plugins/contact-form-7/\""
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

// Hydrated document type aliases (preferred with Mongoose v7)
export type IUserDocument = HydratedDocument<IUser>;
export type ICredentialDocument = HydratedDocument<ICredential>;
export type ICategoryDocument = HydratedDocument<ICategory>;
export type ILocationDocument = HydratedDocument<ILocation>;
export type IDorkDocument = HydratedDocument<IDork>;
export type IQueryDocument = HydratedDocument<IQuery>;
export type IResultDocument = HydratedDocument<IResult>;
export type ICustomerInfoDocument = HydratedDocument<ICustomerInfo>;
export type ILeadDocument = HydratedDocument<ILead>;
export type IEmailTemplateDocument = HydratedDocument<IEmailTemplate>;
export type ICampaignDocument = HydratedDocument<ICampaign>;
export type IEmailLogDocument = HydratedDocument<IEmailLog>;
