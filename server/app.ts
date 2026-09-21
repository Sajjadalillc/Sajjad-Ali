import express from 'express';
import { apiRouter } from './routes';

export function createServerApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount API router
  app.use('/api', apiRouter);

  return app;
}
