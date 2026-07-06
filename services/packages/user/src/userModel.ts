import mongoose, { Schema, Document } from 'mongoose';
import type { User, UserRole } from './User';

export interface UserDocument extends User, Document {
  passwordHash: string | null;
  inviteToken: string | null;
  inviteTokenExpires: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    passwordHash: { type: String, default: null },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    inviteToken: { type: String, default: null },
    inviteTokenExpires: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
