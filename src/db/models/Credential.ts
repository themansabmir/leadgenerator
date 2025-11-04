/**
 * Credential Model
 * MongoDB model for storing encrypted Google API credentials
 */

import mongoose, { Schema, Model } from 'mongoose';
import { ICredential } from '@/types';

/**
 * Credential Schema Definition
 */
const CredentialSchema = new Schema<ICredential>(
  {
    label: {
      type: String,
      required: [true, 'Label is required'],
      trim: true,
      maxlength: [100, 'Label cannot exceed 100 characters']
    },
    apiKey: {
      type: String,
      required: [true, 'API Key is required'], // encrypted value
      select: false // Don't include in queries by default for security
    },
    engineId: {
      type: String,
      required: [true, 'Engine ID is required'], // encrypted value
      select: false // Don't include in queries by default for security
    }
  },
  {
    timestamps: true,
    collection: 'credentials'
  }
);

/**
 * Indexes for performance
 */
CredentialSchema.index({ createdAt: -1 });
CredentialSchema.index({ label: 1 });

/**
 * Instance methods
 */
CredentialSchema.methods.toJSON = function() {
  const credentialObject = this.toObject();
  // Remove sensitive fields from JSON output
  delete credentialObject.apiKey;
  delete credentialObject.engineId;
  return credentialObject;
};

/**
 * Static methods
 */
CredentialSchema.statics.findByLabel = function(label: string) {
  return this.findOne({ label: label.trim() });
};

/**
 * Pre-save middleware
 */
CredentialSchema.pre('save', function(next) {
  // Trim label before saving
  if (this.isModified('label')) {
    this.label = this.label.trim();
  }
  next();
});

/**
 * Export Credential model
 * Use existing model if already compiled, otherwise create new one
 */
export const Credential: Model<ICredential> = 
  mongoose.models.Credential || mongoose.model<ICredential>('Credential', CredentialSchema);

export default Credential;
