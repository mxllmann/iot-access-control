import { CardModel } from '@iot-access/card';
import { AccessEvent } from '@iot-access/access-log';
import { publishAccessEvent } from '../messaging/publisher';

export async function verifyAccess(cardUid: string) {
  const card = await CardModel.findOne({ uid: cardUid });
  const authorized = !!card && card.active;

  const event: AccessEvent = {
    cardUid,
    ownerName: card?.ownerName,
    authorized,
    timestamp: new Date().toISOString(),
  };

  publishAccessEvent(event);

  return { authorized, ownerName: card?.ownerName };
}
