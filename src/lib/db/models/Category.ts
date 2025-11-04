/**
 * Category Model
 * MongoDB model for business categories (Cafe, Restaurant, etc.)
 */

import mongoose, { Schema, Model } from 'mongoose';
import { ICategory } from '@/types';

/**
 * Category Schema Definition
 */
const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    }
  },
  {
    timestamps: true,
    collection: 'categories'
  }
);

/**
 * Indexes for performance
 */
CategorySchema.index({ slug: 1 });
CategorySchema.index({ name: 1 });
CategorySchema.index({ createdAt: -1 });

/**
 * Static methods
 */
CategorySchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug: slug.toLowerCase().trim() });
};

CategorySchema.statics.findByName = function(name: string) {
  return this.findOne({ name: name.trim() });
};

/**
 * Pre-save middleware
 */
CategorySchema.pre('save', function(next) {
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
CategorySchema.pre('save', async function(next) {
  if (!this.isModified('slug')) {
    return next();
  }
  
  const existingCategory = await mongoose.models.Category.findOne({ 
    slug: this.slug,
    _id: { $ne: this._id }
  });
  
  if (existingCategory) {
    const error = new Error('Category with this slug already exists');
    return next(error);
  }
  
  next();
});

/**
 * Export Category model
 * Use existing model if already compiled, otherwise create new one
 */
export const Category: Model<ICategory> = 
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
