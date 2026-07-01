import { ConfigModel } from '@iot-access/config';

export async function getAll() {
  return ConfigModel.find();
}

export async function getByKey(key: string) {
  return ConfigModel.findOne({ key });
}

export async function upsert(key: string, value: string | number | boolean, description?: string) {
  return ConfigModel.findOneAndUpdate(
    { key },
    { value, ...(description && { description }) },
    { new: true, upsert: true }
  );
}
