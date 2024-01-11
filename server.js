import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'url';
import { readFileSync, writeFile } from 'fs';
import { Server } from 'socket.io';

const app = express();
const port = process.env.PORT || 3000;
const server = createServer(app);
const io = new Server(server, {transports: ['websocket']});

const fighters = JSON.parse(readFileSync('./database.json'));

setInterval(() => {
  writeFile('./database.json', JSON.stringify(fighters), err => {
    if(err) {
      console.log('error');
    } else {
      console.log('saved');
    }
  });
}, 10000);

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
  socket.on('deleteFighter', data => {
    if(data in fighters) delete fighters[data];
    io.emit('serveFighters', fighters);
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



