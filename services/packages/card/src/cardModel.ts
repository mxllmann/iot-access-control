import mongoose, { Schema, Document } from 'mongoose';
import { Card } from './Card';

export interface CardDocument extends Card, Document {
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<CardDocument>(
  {
    uid: { type: String, required: true, unique: true },
    ownerName: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CardModel = mongoose.model<CardDocument>('Card', CardSchema);
