/**
 * Database Models Index
 * Centralized export for all MongoDB models
 */

// Export all models as default exports
export { default as User } from './User';
export { default as Credential } from './Credential';
export { default as Category } from './Category';
export { default as Location } from './Location';
export { default as Dork } from './Dork';
export { default as Query } from './Query';
export { default as Result } from './Result';
export { default as CustomerInfo } from './CustomerInfo';
export { default as Lead } from './Lead';
export { default as EmailTemplate } from './EmailTemplate';
export { default as Campaign } from './Campaign';
export { default as EmailLog } from './EmailLog';

// Re-export types
export type {
  IUser,
  ICredential,
  ICategory,
  ILocation,
  IDork,
  IQuery,
  IResult,
  ICustomerInfo,
  ILead,
  IEmailTemplate,
  ICampaign,
  IEmailLog,
  // Document interfaces
  IUserDocument,
  ICredentialDocument,
  ICategoryDocument,
  ILocationDocument,
  IDorkDocument,
  IQueryDocument,
  IResultDocument,
  ICustomerInfoDocument,
  ILeadDocument,
  IEmailTemplateDocument,
  ICampaignDocument,
  IEmailLogDocument
} from '@/types';
