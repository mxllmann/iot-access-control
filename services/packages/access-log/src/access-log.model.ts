import mongoose, { Schema, Document } from 'mongoose';
import { AccessLog } from './AccessLog';

export interface AccessLogDocument extends AccessLog, Document {}

const AccessLogSchema = new Schema<AccessLogDocument>({
  cardUid: { type: String, required: true, index: true },
  ownerName: { type: String },
  authorized: { type: Boolean, required: true },
  timestamp: { type: Date, required: true, index: true },
});

export const AccessLogModel = mongoose.model<AccessLogDocument>('AccessLog', AccessLogSchema);
