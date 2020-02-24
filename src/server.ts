import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import { applyMiddleware } from './utils';
import middleware from './middleware';

dotenv.config();

const router = express();

applyMiddleware(middleware, router);

const { PORT = 3000 } = process.env;
const server = http.createServer(router);

server.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
