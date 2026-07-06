import mongoose, { Schema, Document } from 'mongoose';
import { Credential } from './Credential';

export interface CredentialDocument extends Credential, Document {
  createdAt: Date;
  updatedAt: Date;
}

const CredentialSchema = new Schema<CredentialDocument>(
  {
    uid: { type: String, required: true, unique: true },
    ownerName: { type: String, required: true },
    userId: { type: String, default: null, index: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CredentialModel = mongoose.model<CredentialDocument>(
  'Credential',
  CredentialSchema
);
