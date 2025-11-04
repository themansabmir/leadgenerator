/**
 * Location Model
 * MongoDB model for business locations (e.g., cities, countries).
 */

import mongoose, { Schema, Model } from 'mongoose';
import { ILocation } from '@/types';

/**
 * Location Schema Definition
 */
const LocationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Location name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: [true, 'Location slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    }
  },
  {
    timestamps: true,
    collection: 'locations'
  }
);

/**
 * Indexes for performance
 */
LocationSchema.index({ slug: 1 });
LocationSchema.index({ name: 1 });
LocationSchema.index({ createdAt: -1 });

/**
 * Static methods
 */
LocationSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug: slug.toLowerCase().trim() });
};

LocationSchema.statics.findByName = function(name: string) {
  return this.findOne({ name: name.trim() });
};

/**
 * Pre-save middleware
 */
LocationSchema.pre('save', function(next) {
  // Auto-generate slug from name if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  // Ensure name and slug are trimmed
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  if (this.isModified('slug')) {
    this.slug = this.slug.toLowerCase().trim();
  }

  next();
});

/**
 * Pre-save validation for duplicate slug
 */
LocationSchema.pre('save', async function(next) {
  if (!this.isModified('slug')) {
    return next();
  }

  const existingLocation = await mongoose.models.Location.findOne({
    slug: this.slug,
    _id: { $ne: this._id }
  });

  if (existingLocation) {
    const error = new Error('Location with this slug already exists');
    return next(error);
  }

  next();
});

/**
 * Export Location model
 * Use existing model if already compiled, otherwise create new one
 */
export const Location: Model<ILocation> =
  mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);

export default Location;
