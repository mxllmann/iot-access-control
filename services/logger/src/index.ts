import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { startConsumer } from './messaging/consumer';
import { logService } from './services/logService';
import logRoutes from './routes/logRoutes';

const PORT = process.env.PORT || 3002;
const MONGO_URI =
  process.env.LOGGER_MONGO_URI || 'mongodb://localhost:27017/iot-access-logger';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  await startConsumer(RABBITMQ_URL, async (event) => {
    await logService.logAccess(event);
    console.log(
      `Access logged: ${event.credentialUid} - ${event.authorized ? 'AUTHORIZED' : 'DENIED'}`
    );
  });

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/', logRoutes);
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.listen(PORT, () => {
    console.log(`Logger service running on port ${PORT}`);
  });
}

main().catch(console.error);
