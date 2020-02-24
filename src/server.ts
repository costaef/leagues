import http from 'http';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express();
const { PORT = 3000 } = process.env;
const server = http.createServer(router);

server.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
