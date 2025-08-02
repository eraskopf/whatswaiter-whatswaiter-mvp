import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/orders', (req, res) => {
  io.emit('order:new', req.body.order || 'unknown');
  res.sendStatus(200);
});

io.on('connection', () => {
  /* socket connected */
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Gateway listening on ${port}`);
});
