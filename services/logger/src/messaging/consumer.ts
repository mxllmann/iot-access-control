import amqplib from 'amqplib';
import { ACCESS_EVENT_QUEUE } from '@iot-access/access-log/src/AccessEvent';
import type { AccessEvent } from '@iot-access/access-log/src/AccessEvent';

export async function startConsumer(
  url: string,
  onMessage: (event: AccessEvent) => Promise<void>
): Promise<void> {
  const connection = await amqplib.connect(url);
  const channel = await connection.createChannel();
  await channel.assertQueue(ACCESS_EVENT_QUEUE, { durable: true });
  channel.prefetch(1);

  console.log('RabbitMQ consumer listening on queue:', ACCESS_EVENT_QUEUE);

  channel.consume(ACCESS_EVENT_QUEUE, async (msg) => {
    if (!msg) return;
    try {
      const event: AccessEvent = JSON.parse(msg.content.toString());
      await onMessage(event);
      channel.ack(msg);
    } catch (err) {
      console.error('Error processing message:', err);
      channel.nack(msg, false, false);
    }
  });
}
