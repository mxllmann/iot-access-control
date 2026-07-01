import { CardModel } from '@iot-access/card';
import { configService } from './configService';

type EnrollmentStatus = 'waiting_card' | 'success' | 'error' | 'already_registered';

type CardEnrollment = {
  enabled: boolean;
  status: EnrollmentStatus;
  ownerName: string;
  uid: string | null;
  message: string;
};

const CARD_ENROLLMENT_KEY = 'cardEnrollment';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unexpected error';
}

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

  async startEnrollment(ownerName: string) {
    const enrollment: CardEnrollment = {
      enabled: true,
      status: 'waiting_card',
      ownerName,
      uid: null,
      message: 'Waiting for card read',
    };

    await configService.upsert(
      CARD_ENROLLMENT_KEY,
      enrollment,
      'Current RFID card enrollment state'
    );

    return enrollment;
  },

  async getEnrollmentStatus() {
    const config = await configService.getByKey(CARD_ENROLLMENT_KEY);

    if (!config) {
      return {
        enabled: false,
        status: 'error',
        ownerName: '',
        uid: null,
        message: 'Enrollment was not started',
      } satisfies CardEnrollment;
    }

    return config.value as CardEnrollment;
  },

  async completeEnrollment(uid: string) {
    const enrollment = await cardService.getEnrollmentStatus();

    if (!enrollment.enabled || enrollment.status !== 'waiting_card') {
      const errorEnrollment: CardEnrollment = {
        ...enrollment,
        enabled: false,
        status: 'error',
        uid,
        message: 'Enrollment mode is not active',
      };

      await configService.upsert(CARD_ENROLLMENT_KEY, errorEnrollment);
      return { enrollment: errorEnrollment, card: null };
    }

    try {
      const card = await cardService.register(uid, enrollment.ownerName);
      const successEnrollment: CardEnrollment = {
        ...enrollment,
        enabled: false,
        status: 'success',
        uid,
        message: 'Card registered successfully',
      };

      await configService.upsert(CARD_ENROLLMENT_KEY, successEnrollment);
      return { enrollment: successEnrollment, card };
    } catch (error) {
      const message = getErrorMessage(error);
      const errorEnrollment: CardEnrollment = {
        ...enrollment,
        enabled: false,
        status: message === 'Card already registered' ? 'already_registered' : 'error',
        uid,
        message,
      };

      await configService.upsert(CARD_ENROLLMENT_KEY, errorEnrollment);
      return { enrollment: errorEnrollment, card: null };
    }
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
