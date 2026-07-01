import { ConfigModel } from '@iot-access/config';

export const configService = {
  async getAll() {
    return ConfigModel.find();
  },

  async getByKey(key: string) {
    return ConfigModel.findOne({ key });
  },

  async upsert(key: string, value: string | number | boolean, description?: string) {
    return ConfigModel.findOneAndUpdate(
      { key },
      { value, ...(description && { description }) },
      { new: true, upsert: true }
    );
  },
};
