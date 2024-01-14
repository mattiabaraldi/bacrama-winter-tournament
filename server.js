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

const bacchiatori = JSON.parse(readFileSync('./database.json'));
const calculatedGironi = {};
const datiGironi = {
  8: [4, 4],
  9: [5, 4],
  10: [5, 5],
  11: [6, 5],
  12: [6, 6],
  13: [5, 4, 4],
  14: [5, 5, 4],
  15: [5, 5, 5],
  16: [6, 5, 5],
  17: [6, 6, 5],
  18: [6, 6, 6],
  19: [5, 5, 5,	4],
  20: [5, 5, 5,	5],
  21: [6, 5, 5,	5],
  22: [6, 6, 5,	5],
  23: [6, 6, 6,	5],
  24: [6, 6, 6,	6],
  25: [5, 5, 5,	5, 5],
  26: [6, 5, 5,	5, 5],
  27: [6, 6, 5,	5, 5],
  28: [6, 6, 6,	5, 5],
  29: [6, 6, 6,	6, 5],
  30: [6, 6, 6,	6, 6],
  31: [6, 5, 5,	5, 5,	5],
  32: [6, 6, 5,	5, 5,	5]
}

setInterval(() => {
  writeFile('./database.json', JSON.stringify(bacchiatori), err => {
    if(err) console.log('Save error');
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
  socket.on('getFighters', () => {
    io.emit('serveFighters', bacchiatori);
  });
  socket.on('addFighter', data => {
    bacchiatori[data.name] = data.level;
    io.emit('serveFighters', bacchiatori);
  });
  socket.on('deleteFighter', data => {
    if(data in bacchiatori) delete bacchiatori[data];
    io.emit('serveFighters', bacchiatori);
  });
  socket.on('calcGironi', () => {
    calcGironi(io);
  });
  socket.on('getGironi', () => {
    io.emit('serveGironi', calculatedGironi);
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function calcGironi(io) {
  const arrayBacchiatori = Object.entries(bacchiatori);
  const numBacchiatori = arrayBacchiatori.length;

  if(!(numBacchiatori in datiGironi)) return;
  
  const gironi = datiGironi[numBacchiatori];
  for(const key in calculatedGironi) delete calculatedGironi[key];
  for(let i = 0; i < gironi.length; i++) calculatedGironi[i] = [];

  let i = 0;
  const numGironi = gironi.length;
  arrayBacchiatori.sort((a, b) => b[1] - a[1]);
  console.log(arrayBacchiatori)
  for(const bacchiatore of arrayBacchiatori) {
    const name = bacchiatore[0];
    if(i == gironi[i]) i = (i + 1) % numGironi;
    calculatedGironi[i].push(name);
    i = (i + 1) % numGironi;
  }
}



