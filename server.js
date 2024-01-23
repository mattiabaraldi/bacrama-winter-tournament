import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'url';
import { readFileSync, writeFile } from 'fs';
import { Server } from 'socket.io';
import { isNull } from 'util';

const app = express();
const port = process.env.PORT || 3000;
const server = createServer(app);
const io = new Server(server, {transports: ['websocket']});

const bacchiatori = JSON.parse(readFileSync('./bacchiatori.json'));
const calculatedGironi = JSON.parse(readFileSync('./gironi.json'));
const calculatedEliminatorie = JSON.parse(readFileSync('./eliminatorie.json'));
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

const numeroDuelliPerPersona = {15: 6, 10: 5, 6: 4};

const ordineEliminatorie = [
  1, 31, 4, 27,  8, 23, 12, 19, 17, 14, 21, 10, 25,  6, 29,  2, 
  3, 28, 7,  5, 11, 20, 15, 16, 18, 13, 22,  9, 26, 24, 30,  0
];

const ordineEliminatorieOld = [
  31, 0, 15, 16, 2, 19, 13, 18, 4, 27, 11, 20, 6, 25, 9, 22,
  23, 8, 24, 7, 21, 10, 26, 5, 29, 12, 28, 3, 17, 14, 30, 1
];
const ordineEliminatorieOldOld = [
  [
    31, 0, 15, 16, 2, 19, 13, 18, 4, 27, 11, 20, 6, 25, 9, 22,
    23, 8, 24, 7, 21, 10, 26, 5, 29, 12, 28, 3, 17, 14, 30, 1
  ], [
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null
  ], [
    null, null, null, null,
    null, null, null, null
  ], [
    null, null,
    null, null
  ], [
    null,
    null
  ], [
    null
  ]
]

setInterval(() => {
  writeFile('./bacchiatori.json', JSON.stringify(bacchiatori), err => {
    console.log('salvati!');
    if(err) console.log('Save error');
  });
  writeFile('./gironi.json', JSON.stringify(calculatedGironi), err => {
    if(err) console.log('Save error');
  });
  writeFile('./eliminatorie.json', JSON.stringify(calculatedEliminatorie), err => {
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
    bacchiatori[data.name] = {level: data.level, scoreClassifica: 0};
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
  socket.on('calcEliminatorie', () => {
    calcEliminatorie();
  });
  socket.on('getEliminatorie', () => {
    socket.emit('serveEliminatorie', calculatedEliminatorie);
  });
  socket.on('editScore', data => {
    calculatedEliminatorie[data.fase][data.bacchiatore].score = data.score*1;
    updateEliminatorie();
    socket.emit('serveEliminatorie', calculatedEliminatorie);
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

function updateEliminatorie() {
  for(let i = 0; i < calculatedEliminatorie.length - 1; i++) {
    const currentGirone = calculatedEliminatorie[i];
    const nextGirone = calculatedEliminatorie[i + 1];
    for(let j = 0; j < currentGirone.length; j += 2) {
      const b1 = currentGirone[j];
      const b2 = currentGirone[j + 1];
      if(!b1.name || !b2.name) continue;
      nextGirone[Math.floor(j / 2)].name = '?';
      if(isNaN(b1.score) || isNaN(b2.score) || b1.score == null || b2.score == null) continue;
      if((b1.score < 10 && b2.score < 10) || b1.score == b2.score) continue;
      const winner = b1.score > b2.score ? b1 : b2;
      nextGirone[Math.floor(j / 2)].name = winner.name;
    }
  }
  console.log(calculatedEliminatorie);
}

function calcEliminatorie() {
  const punteggi = {};
  for(const gironeObj of Object.entries(calculatedGironi)) {
    const girone = gironeObj[1];
    for(const duello of girone) {
      let vinceUguale = false;
      duello.puntiUguale *= 1;
      duello.puntiOpposto *= 1;
      if(duello.puntiUguale > duello.puntiOpposto) {
        vinceUguale = true;
      } else if(duello.puntiUguale < duello.puntiOpposto) {
        vinceUguale = false;
      } else {
        vinceUguale = Math.random() > 0.5;
      }
      let winnerName;
      let winnerScore;
      let loserName;
      let loserScore;
      if(vinceUguale) {
        winnerName = duello.nomeUguale;
        winnerScore = duello.puntiUguale;
        loserName = duello.nomeOpposto;
        loserScore = duello.puntiOpposto;
      } else {
        winnerName = duello.nomeOpposto;
        winnerScore = duello.puntiOpposto;
        loserName = duello.nomeUguale;
        loserScore = duello.puntiUguale;
      }
      if(!(winnerName in punteggi)) punteggi[winnerName] = 0;
      if(!(loserName in punteggi)) punteggi[loserName] = 0;
      punteggi[winnerName] += (winnerScore - loserScore) / numeroDuelliPerPersona[girone.length];
      punteggi[loserName] += 0;
    }
  }
  const arrayPunteggi = Object.entries(punteggi)
  .reduce((accum, record) => {
    accum.push({name: record[0], scoreClassifica: record[1]});
    return accum;
  }, []);
  arrayPunteggi.sort((a, b) => b.scoreClassifica - a.scoreClassifica);

  calculatedEliminatorie.splice(0, calculatedEliminatorie.length);
  calculatedEliminatorie.push([], [], [], [], [], []);

  const defaultValue = {
    name: '',
    score: null,
  }

  for(let i = 0; i < 32; i++) calculatedEliminatorie[0].push({...defaultValue});
  for(let i = 0; i < 16; i++) calculatedEliminatorie[1].push({...defaultValue});
  for(let i = 0; i < 8; i++) calculatedEliminatorie[2].push({...defaultValue});
  for(let i = 0; i < 4; i++) calculatedEliminatorie[3].push({...defaultValue});
  for(let i = 0; i < 2; i++) calculatedEliminatorie[4].push({...defaultValue});
  calculatedEliminatorie[5].push({...defaultValue});

  arrayPunteggi.forEach((bacchiatore, index) => {
    calculatedEliminatorie[0][ordineEliminatorie[index]] = {...defaultValue, ...bacchiatore};
  })

  for(let i = 0; i < 5; i++) {
    for(let j = 0; j < calculatedEliminatorie[i].length - 1; j += 2) {
      if(calculatedEliminatorie[i][j].name !== '' && calculatedEliminatorie[i][j + 1].name !== '') {
        calculatedEliminatorie[i + 1][j / 2].name = '?';
      } else if(calculatedEliminatorie[i][j].name !== '') {
        calculatedEliminatorie[i + 1][j / 2].name = calculatedEliminatorie[i][j].name;
      } else if(calculatedEliminatorie[i][j + 1].name !== '') {
        calculatedEliminatorie[i + 1][j / 2].name = calculatedEliminatorie[i][j + 1].name;
      }
    }
  }

  return;
}

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
  arrayBacchiatori.sort((a, b) => b[1].level - a[1].level);
  
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



