import mongoose, { Document, Schema } from 'mongoose';

export interface IQuery extends Document {
  queryName: string;
  category: string;
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  timestamp: string;
  createdAt: Date;
}

const QuerySchema = new Schema<IQuery>({
  queryName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Prevent duplicate URLs
  },
  snippet: {
    type: String,
    trim: true,
  },
  displayLink: {
    type: String,
    trim: true,
  },
  formattedUrl: {
    type: String,
    trim: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
QuerySchema.index({ queryName: 1, category: 1 });
QuerySchema.index({ link: 1 });

export const Query = mongoose.models.Query || mongoose.model<IQuery>('Query', QuerySchema);
