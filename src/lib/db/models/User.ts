/**
 * User Model
 * MongoDB model for user authentication
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * User interface extending Mongoose Document
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Schema Definition
 */
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        'Please enter a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Don't include password in queries by default
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'users'
  }
);

/**
 * Indexes for performance
 */
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

/**
 * Pre-save middleware to ensure email uniqueness
 */
UserSchema.pre('save', async function(next) {
  if (!this.isModified('email')) {
    return next();
  }
  
  const existingUser = await mongoose.models.User.findOne({ 
    email: this.email,
    _id: { $ne: this._id }
  });
  
  if (existingUser) {
    const error = new Error('Email already exists');
    return next(error);
  }
  
  next();
});

/**
 * Instance methods
 */
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

/**
 * Static methods
 */
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

/**
 * Export User model
 * Use existing model if already compiled, otherwise create new one
 */
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
