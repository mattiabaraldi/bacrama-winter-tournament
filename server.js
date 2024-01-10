import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { Server } from 'socket.io';

const app = express();
const port = 3000;
const server = createServer(app);
const io = new Server(server);
let ioSocket = null;

const fighters = {};

app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname + '/public/'));

app.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) socket.end('HTTP/2 400 Bad Request\n');
  console.log('client error\n', err);
});

io.on('connection', (socket) => {
  socket.on('getFighters', data => {
    io.emit('serveFighters', fighters);
  });
  socket.on('addFighter', data => {
    fighters[data.name] = data.level;
    io.emit('serveFighters', fighters);
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



