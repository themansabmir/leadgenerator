/**
 * EmailTemplate Model
 * MongoDB model for email templates with variable support
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IEmailTemplate } from '../../../types';

/**
 * Variable Schema for template variables
 */
const VariableSchema = new Schema({
  key: {
    type: String,
    required: [true, 'Variable key is required'],
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Variable source is required'],
    enum: {
      values: ['customer', 'lead', 'category', 'query', 'custom'],
      message: 'Source must be one of: customer, lead, category, query, custom'
    }
  },
  value: {
    type: String,
    default: '',
    trim: true
  },
  default: {
    type: String,
    default: '',
    trim: true
  }
}, { _id: false });

/**
 * EmailTemplate Schema Definition
 */
const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // null = global template
      index: true
    },
    location: {
      type: String,
      default: null, // null = applies to all locations
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    templateType: {
      type: String,
      enum: {
        values: ['first_email', 'follow_up_1', 'follow_up_2', 'follow_up_3'],
        message: 'Template type must be one of: first_email, follow_up_1, follow_up_2, follow_up_3'
      },
      required: [true, 'Template type is required'],
      index: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    bodyTemplate: {
      type: String,
      required: [true, 'Body template is required'],
      maxlength: [10000, 'Body template cannot exceed 10000 characters']
    },
    variables: {
      type: [VariableSchema],
      default: []
    }
  },
  {
    timestamps: true,
    collection: 'emailtemplates'
  }
);

/**
 * Indexes for performance
 */
EmailTemplateSchema.index({ categoryId: 1, location: 1, templateType: 1 });
EmailTemplateSchema.index({ templateType: 1, categoryId: 1 });
EmailTemplateSchema.index({ createdAt: -1 });

/**
 * Virtual for template scope
 */
EmailTemplateSchema.virtual('scope').get(function() {
  if (!this.categoryId && !this.location) return 'global';
  if (this.categoryId && !this.location) return 'category';
  if (!this.categoryId && this.location) return 'location';
  return 'specific';
});

/**
 * Static methods
 */
EmailTemplateSchema.statics.findByType = function(templateType: string) {
  return this.find({ templateType })
    .populate('categoryId', 'name slug')
    .sort({ categoryId: 1, location: 1 });
};

EmailTemplateSchema.statics.findBestMatch = function(templateType: string, categoryId?: string, location?: string) {
  // Priority order: specific > category+location > category > location > global
  const queries = [];
  
  // 1. Exact match (category + location)
  if (categoryId && location) {
    queries.push({ templateType, categoryId, location });
  }
  
  // 2. Category specific
  if (categoryId) {
    queries.push({ templateType, categoryId, location: null });
  }
  
  // 3. Location specific
  if (location) {
    queries.push({ templateType, categoryId: null, location });
  }
  
  // 4. Global template
  queries.push({ templateType, categoryId: null, location: null });
  
  // Try each query in order
  return queries.reduce(async (prevPromise, query) => {
    const prev = await prevPromise;
    if (prev) return prev;
    return this.findOne(query).populate('categoryId', 'name slug');
  }, Promise.resolve(null));
};

EmailTemplateSchema.statics.getTemplateHierarchy = function(categoryId?: string, location?: string) {
  const match: any = {};
  if (categoryId) match.categoryId = { $in: [null, new mongoose.Types.ObjectId(categoryId)] };
  if (location) match.location = { $in: [null, location] };
  
  return this.find(match)
    .populate('categoryId', 'name slug')
    .sort({ templateType: 1, categoryId: -1, location: -1 });
};

/**
 * Instance methods
 */
EmailTemplateSchema.methods.renderTemplate = function(data: Record<string, any>) {
  let subject = this.subject;
  let body = this.bodyTemplate;
  
  // Replace variables in subject and body
  this.variables.forEach((variable: { key: string; value: string; default: string }) => {
    const placeholder = `{{${variable.key}}}`;
    const value = data[variable.key] || variable.value || variable.default || '';
    
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
    body = body.replace(new RegExp(placeholder, 'g'), value);
  });
  
  // Replace any remaining handlebars with empty string
  subject = subject.replace(/\{\{[^}]+\}\}/g, '');
  body = body.replace(/\{\{[^}]+\}\}/g, '');
  
  return { subject, body };
};

EmailTemplateSchema.methods.extractVariables = function() {
  const subjectVars = this.subject.match(/\{\{([^}]+)\}\}/g) || [];
  const bodyVars = this.bodyTemplate.match(/\{\{([^}]+)\}\}/g) || [];
  
  const allVars = [...subjectVars, ...bodyVars]
    .map(v => v.replace(/[{}]/g, '').trim())
    .filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates
  
  return allVars;
};

EmailTemplateSchema.methods.validateVariables = function() {
  const extractedVars = this.extractVariables();
  const definedVars = this.variables.map((v: { key: string }) => v.key);
  
  const missingVars = extractedVars.filter((v: string) => !definedVars.includes(v));
  const unusedVars = definedVars.filter((v: string) => !extractedVars.includes(v));
  
  return {
    isValid: missingVars.length === 0,
    missingVariables: missingVars,
    unusedVariables: unusedVars
  };
};

EmailTemplateSchema.methods.clone = function(newCategoryId?: string, newLocation?: string) {
  const cloned = new (this.constructor as any)({
    categoryId: newCategoryId || this.categoryId,
    location: newLocation || this.location,
    templateType: this.templateType,
    subject: this.subject,
    bodyTemplate: this.bodyTemplate,
    variables: this.variables.map((v: { key: string; source: string; value: string; default: string }) => ({
      key: v.key,
      source: v.source,
      value: v.value,
      default: v.default
    }))
  });
  
  return cloned;
};

/**
 * Pre-save middleware
 */
EmailTemplateSchema.pre('save', function(next) {
  // Auto-extract and sync variables
  const self = this as any;
  const extractedVars: string[] = typeof self.extractVariables === 'function' ? self.extractVariables() : [];
  const currentVars: string[] = Array.isArray(self.variables) ? self.variables.map((v: { key: string }) => v.key) : [];

  // Add missing variables with default settings
  extractedVars.forEach((varKey: string) => {
    if (!currentVars.includes(varKey)) {
      self.variables.push({
        key: varKey,
        source: 'custom',
        value: '',
        default: ''
      });
    }
  });

  // Remove unused variables
  self.variables = (Array.isArray(self.variables) ? self.variables : []).filter((v: { key: string }) => extractedVars.includes(v.key));

  next();
});

/**
 * Prevent duplicate templates for same scope
 */
EmailTemplateSchema.pre('save', async function(next) {
  const query: any = {
    templateType: this.templateType,
    categoryId: this.categoryId,
    location: this.location,
    _id: { $ne: this._id }
  };
  
  const existingTemplate = await mongoose.models.EmailTemplate.findOne(query);
  
  if (existingTemplate) {
    const error = new Error('Template already exists for this scope and type');
    return next(error);
  }
  
  next();
});

/**
 * Export EmailTemplate model
 * Use existing model if already compiled, otherwise create new one
 */
export const EmailTemplate: Model<IEmailTemplate> = 
  mongoose.models.EmailTemplate || mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);

export default EmailTemplate;
