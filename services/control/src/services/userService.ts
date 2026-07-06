import { UserModel } from '@iot-access/user';

export const userService = {
  async getAll() {
    return UserModel.find()
      .select('-passwordHash -inviteToken -inviteTokenExpires')
      .sort({ createdAt: -1 });
  },

  async getById(id: string) {
    return UserModel.findById(id).select('-passwordHash -inviteToken -inviteTokenExpires');
  },

  async update(id: string, data: { name?: string; role?: string; active?: boolean }) {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true }).select(
      '-passwordHash -inviteToken -inviteTokenExpires'
    );
    if (!user) throw new Error('Usuário não encontrado');
    return user;
  },

  async remove(id: string) {
    const result = await UserModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) throw new Error('Usuário não encontrado');
  },
};
