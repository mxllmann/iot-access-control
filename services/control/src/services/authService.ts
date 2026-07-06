import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, type UserDocument } from '@iot-access/user';

const JWT_SECRET = process.env.JWT_SECRET || 'iot-access-secret-change-me';
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 days in seconds

export type JwtPayload = {
  userId: string;
  email: string;
  role: string;
};

export const authService = {
  generateToken(user: UserDocument): string {
    const payload: JwtPayload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  },

  async login(email: string, password: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) throw new Error('Credenciais inválidas');
    if (!user.passwordHash) throw new Error('Senha não definida. Verifique seu email de convite.');
    if (!user.active) throw new Error('Usuário desativado');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Credenciais inválidas');

    return { token: this.generateToken(user), user: this.sanitizeUser(user) };
  },

  async createUser(email: string, name: string, password: string, role: 'admin' | 'user') {
    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) throw new Error('Email já cadastrado');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      email: email.toLowerCase(),
      name,
      role,
      passwordHash,
    });

    return this.sanitizeUser(user);
  },

  async seedAdmin() {
    const count = await UserModel.countDocuments();
    if (count > 0) return;

    const email = process.env.ADMIN_EMAIL || 'admin@iot.local';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const name = 'Administrador';

    const passwordHash = await bcrypt.hash(password, 10);
    await UserModel.create({ email, name, passwordHash, role: 'admin' });
    console.log(`Admin seed: ${email} / ${password}`);
  },

  sanitizeUser(user: UserDocument) {
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
