import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 6000;

const CONTROL_URL = process.env.CONTROL_URL || 'http://localhost:6001';
const LOGGER_URL = process.env.LOGGER_URL || 'http://localhost:6002';

app.use(cors());

app.use(
  '/control',
  createProxyMiddleware({
    target: CONTROL_URL,
    pathRewrite: { '^/control': '' },
    changeOrigin: true,
  })
);

app.use(
  '/logs',
  createProxyMiddleware({
    target: LOGGER_URL,
    pathRewrite: { '^/logs': '' },
    changeOrigin: true,
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', services: { control: CONTROL_URL, logger: LOGGER_URL } });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`  /control -> ${CONTROL_URL}`);
  console.log(`  /logs    -> ${LOGGER_URL}`);
});
