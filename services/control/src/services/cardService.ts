import { CardModel } from '@iot-access/card';

export const cardService = {
  async getAll() {
    return CardModel.find().sort({ createdAt: -1 });
  },

  async getActive() {
    return CardModel.find({ active: true });
  },

  async getByUid(uid: string) {
    return CardModel.findOne({ uid });
  },

  async register(uid: string, ownerName: string) {
    const existing = await CardModel.findOne({ uid });
    if (existing) throw new Error('Card already registered');
    return CardModel.create({ uid, ownerName });
  },

  async update(uid: string, data: { ownerName?: string; active?: boolean }) {
    const card = await CardModel.findOneAndUpdate({ uid }, data, { new: true });
    if (!card) throw new Error('Card not found');
    return card;
  },

  async remove(uid: string) {
    const result = await CardModel.deleteOne({ uid });
    if (result.deletedCount === 0) throw new Error('Card not found');
  },
};
