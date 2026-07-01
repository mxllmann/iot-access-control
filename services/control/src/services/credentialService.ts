import { CredentialModel } from '@iot-access/credential';
import { configService } from './configService';

type EnrollmentStatus = 'waiting_card' | 'success' | 'error' | 'already_registered';

type CredentialEnrollment = {
  enabled: boolean;
  status: EnrollmentStatus;
  ownerName: string;
  uid: string | null;
  message: string;
};

const CREDENTIAL_ENROLLMENT_KEY = 'credentialEnrollment';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unexpected error';
}

export const credentialService = {
  async getAll() {
    return CredentialModel.find().sort({ createdAt: -1 });
  },

  async getActive() {
    return CredentialModel.find({ active: true });
  },

  async getByUid(uid: string) {
    return CredentialModel.findOne({ uid });
  },

  async register(uid: string, ownerName: string) {
    const existing = await CredentialModel.findOne({ uid });
    if (existing) throw new Error('Credential already registered');
    return CredentialModel.create({ uid, ownerName });
  },

  async startEnrollment(ownerName: string) {
    const enrollment: CredentialEnrollment = {
      enabled: true,
      status: 'waiting_card',
      ownerName,
      uid: null,
      message: 'Waiting for card read',
    };

    await configService.upsert(
      CREDENTIAL_ENROLLMENT_KEY,
      enrollment,
      'Current RFID credential enrollment state'
    );

    return enrollment;
  },

  async getEnrollmentStatus() {
    const config = await configService.getByKey(CREDENTIAL_ENROLLMENT_KEY);

    if (!config) {
      return {
        enabled: false,
        status: 'error',
        ownerName: '',
        uid: null,
        message: 'Enrollment was not started',
      } satisfies CredentialEnrollment;
    }

    return config.value as CredentialEnrollment;
  },

  async completeEnrollment(uid: string) {
    const enrollment = await credentialService.getEnrollmentStatus();

    if (!enrollment.enabled || enrollment.status !== 'waiting_card') {
      const errorEnrollment: CredentialEnrollment = {
        ...enrollment,
        enabled: false,
        status: 'error',
        uid,
        message: 'Enrollment mode is not active',
      };

      await configService.upsert(CREDENTIAL_ENROLLMENT_KEY, errorEnrollment);
      return { enrollment: errorEnrollment, credential: null };
    }

    try {
      const credential = await credentialService.register(uid, enrollment.ownerName);
      const successEnrollment: CredentialEnrollment = {
        ...enrollment,
        enabled: false,
        status: 'success',
        uid,
        message: 'Credential registered successfully',
      };

      await configService.upsert(CREDENTIAL_ENROLLMENT_KEY, successEnrollment);
      return { enrollment: successEnrollment, credential };
    } catch (error) {
      const message = getErrorMessage(error);
      const errorEnrollment: CredentialEnrollment = {
        ...enrollment,
        enabled: false,
        status: message === 'Credential already registered' ? 'already_registered' : 'error',
        uid,
        message,
      };

      await configService.upsert(CREDENTIAL_ENROLLMENT_KEY, errorEnrollment);
      return { enrollment: errorEnrollment, credential: null };
    }
  },

  async update(uid: string, data: { ownerName?: string; active?: boolean }) {
    const credential = await CredentialModel.findOneAndUpdate({ uid }, data, { new: true });
    if (!credential) throw new Error('Credential not found');
    return credential;
  },

  async remove(uid: string) {
    const result = await CredentialModel.deleteOne({ uid });
    if (result.deletedCount === 0) throw new Error('Credential not found');
  },
};
