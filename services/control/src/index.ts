import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { connectRabbitMQ } from './messaging/publisher';
import cardRoutes from './routes/card.routes';
import configRoutes from './routes/config.routes';
import accessRoutes from './routes/access.routes';

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/iot-access-control';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  await connectRabbitMQ(RABBITMQ_URL);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/cards', cardRoutes);
  app.use('/config', configRoutes);
  app.use('/access', accessRoutes);
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.listen(PORT, () => {
    console.log(`Control service running on port ${PORT}`);
  });
}

main().catch(console.error);
