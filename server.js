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
const calculatedGironi = JSON.parse(readFileSync('./gironi.json'));
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
const ordineDuelli = {
  4: [
    [1, 4],
    [2, 3],
    [1, 3],
    [2, 4],
    [1, 2],
    [3, 4]
  ],
  5: [
    [1, 2],
    [3, 4],
    [5, 1],
    [2, 3],
    [5, 4],
    [1, 3],
    [2, 5],
    [4, 1],
    [3, 5],
    [4, 2]
  ],
  6: [
    [1, 2],
    [4, 5],
    [2, 3],
    [5, 6],
    [3, 1],
    [6, 4],
    [2, 5],
    [1, 4],
    [5, 3],
    [1, 6],
    [4, 2],
    [3, 6],
    [5, 1],
    [3, 4],
    [6, 2]
  ]
}

setInterval(() => {
  writeFile('./bacchiatori.json', JSON.stringify(bacchiatori), err => {
    if(err) console.log('Save error');
  });
  writeFile('./gironi.json', JSON.stringify(calculatedGironi), err => {
    if(err) console.log('Save error');
  });
}, 10000);

app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('*', express.static(__dirname + '/public/'));

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
    calcGironi();
  });
  socket.on('getGironi', () => {
    socket.emit('serveGironi', calculatedGironi);
  });
  socket.on('setPunteggi', data => {
    calculatedGironi[data.girone][data.duello] = {
      ...calculatedGironi[data.girone][data.duello],
      puntiUguale: data.uguale,
      puntiOpposto: data.opposto
    };
    console.log(calculatedGironi)
    socket.emit('serveGironi', calculatedGironi);
  })
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function calcGironi() {
  const arrayBacchiatori = Object.entries(bacchiatori);
  const numBacchiatori = arrayBacchiatori.length;
  const composizioneGironi = [];

  if(!(numBacchiatori in datiGironi)) return;
  
  const gironi = datiGironi[numBacchiatori];
  for(const key in calculatedGironi) delete calculatedGironi[key];
  for(let i = 0; i < gironi.length; i++) {
    calculatedGironi[i] = [];
    composizioneGironi[i] = [];
  }

  let i = 0;
  const numGironi = gironi.length;
  arrayBacchiatori.sort((a, b) => b[1] - a[1]);
  
  for(const bacchiatore of arrayBacchiatori) {
    const name = bacchiatore[0];
    if(i == gironi[i]) i = (i + 1) % numGironi;
    composizioneGironi[i].push(name);
    //calculatedGironi[i].push(name);
    i = (i + 1) % numGironi;
  }

  composizioneGironi.forEach((girone, iGirone) => {
    ordineDuelli[girone.length].forEach((ordine, iOrdine) => {
      const duello = {
        numeroDuello: iOrdine + 1,
        nomeUguale: girone[ordine[0] - 1],
        puntiUguale: 0,
        nomeOpposto: girone[ordine[1] - 1],
        puntiOpposto: 0
      };
      calculatedGironi[iGirone].push(duello);
    });
  });
}



