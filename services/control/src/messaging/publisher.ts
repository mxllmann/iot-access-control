import amqplib from 'amqplib';
import { AccessEvent, ACCESS_EVENT_QUEUE } from '@iot-access/access-log';

let channel: Awaited<ReturnType<amqplib.ChannelModel['createChannel']>> | null = null;

export async function connectRabbitMQ(url: string): Promise<void> {
  const connection = await amqplib.connect(url);
  channel = await connection.createChannel();
  await channel.assertQueue(ACCESS_EVENT_QUEUE, { durable: true });
  console.log('RabbitMQ publisher connected');
}

export function publishAccessEvent(event: AccessEvent): boolean {
  if (!channel) throw new Error('RabbitMQ not connected');
  return channel.sendToQueue(
    ACCESS_EVENT_QUEUE,
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );
}
