import { CredentialModel } from '@iot-access/credential';
import { AccessEvent } from '@iot-access/access-log';
import { publishAccessEvent } from '../messaging/publisher';

export const accessService = {
  async verifyAccess(credentialUid: string) {
    const credential = await CredentialModel.findOne({ uid: credentialUid });
    const authorized = !!credential && credential.active;

    const event: AccessEvent = {
      credentialUid,
      ownerName: credential?.ownerName,
      authorized,
      timestamp: new Date().toISOString(),
    };

    publishAccessEvent(event);

    return { authorized, ownerName: credential?.ownerName };
  },
};
