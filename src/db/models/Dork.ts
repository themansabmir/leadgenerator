/**
 * Dork Model
 * MongoDB model for Google dorks.
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IDork } from '@/types';

/**
 * Dork Schema Definition
 */
const DorkSchema = new Schema<IDork>(
  {
    query: {
      type: String,
      required: [true, 'Dork query is required'],
      unique: true,
      trim: true,
      maxlength: [255, 'Dork query cannot exceed 255 characters']
    }
  },
  {
    timestamps: true,
    collection: 'dorks'
  }
);

/**
 * Indexes for performance
 */
DorkSchema.index({ query: 1 });
DorkSchema.index({ createdAt: -1 });

/**
 * Pre-save middleware
 */
DorkSchema.pre('save', function(next) {
  if (this.isModified('query')) {
    this.query = this.query.trim();
  }
  next();
});

/**
 * Export Dork model
 * Use existing model if already compiled, otherwise create new one
 */
export const Dork: Model<IDork> =
  mongoose.models.Dork || mongoose.model<IDork>('Dork', DorkSchema);

export default Dork;
