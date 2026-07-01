import mongoose, { Schema, Document } from 'mongoose';
import { Config } from './Config';

export interface ConfigDocument extends Config, Document {
  updatedAt: Date;
}

const ConfigSchema = new Schema<ConfigDocument>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const ConfigModel = mongoose.model<ConfigDocument>('Config', ConfigSchema);
