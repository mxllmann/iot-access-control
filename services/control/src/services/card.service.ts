import { CardModel } from '@iot-access/card';

export async function getAll() {
  return CardModel.find().sort({ createdAt: -1 });
}

export async function getActive() {
  return CardModel.find({ active: true });
}

export async function getByUid(uid: string) {
  return CardModel.findOne({ uid });
}

export async function register(uid: string, ownerName: string) {
  const existing = await CardModel.findOne({ uid });
  if (existing) throw new Error('Card already registered');
  return CardModel.create({ uid, ownerName });
}

export async function update(uid: string, data: { ownerName?: string; active?: boolean }) {
  const card = await CardModel.findOneAndUpdate({ uid }, data, { new: true });
  if (!card) throw new Error('Card not found');
  return card;
}

export async function remove(uid: string) {
  const result = await CardModel.deleteOne({ uid });
  if (result.deletedCount === 0) throw new Error('Card not found');
}
