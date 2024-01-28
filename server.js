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

const classifica = {data: []}; //JSON.parse(readFileSync('./classifica.json'));
const bacchiatori = JSON.parse(readFileSync('./bacchiatori.json'));
const calculatedGironi = JSON.parse(readFileSync('./gironi.json'));
const calculatedEliminatorie = JSON.parse(readFileSync('./eliminatorie.json'));
const datiGironi = {
  3: [3],
  4: [4],
  5: [5],
  6: [6],
  7: [4, 3],
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
  3: [
    [1, 2],
    [2, 3],
    [1, 3]
  ],
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

const numeroDuelliPerPersona = {15: 6, 10: 5, 6: 4, 3: 3};

const ordineEliminatorie = [
  1, 31, 4, 27,  8, 23, 12, 19, 17, 14, 21, 10, 25,  6, 29,  2, 
  3, 28, 7,  5, 11, 20, 15, 16, 18, 13, 22,  9, 26, 24, 30,  0
];

setInterval(() => {
  writeFile('./bacchiatori.json', JSON.stringify(bacchiatori), err => {
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
    bacchiatori[data.name] = data.level;
    io.emit('serveFighters', bacchiatori);
  });
  socket.on('deleteFighter', data => {
    if(data in bacchiatori) delete bacchiatori[data];
    io.emit('serveFighters', bacchiatori);
  });
  socket.on('calcGironi', () => {
    calcGironi();
    io.emit('serveGironi', calculatedGironi);
  });
  socket.on('getGironi', () => {
    socket.emit('serveGironi', calculatedGironi);
  });
  socket.on('calcEliminatorie', data => {
    calcEliminatorie(data);
    io.emit('serveEliminatorie', calculatedEliminatorie);
  });
  socket.on('getEliminatorie', () => {
    socket.emit('serveEliminatorie', calculatedEliminatorie);
  });
  socket.on('editScore', data => {
    calculatedEliminatorie[data.fase][data.bacchiatore].score = data.score*1;
    updateEliminatorie();
    io.emit('serveEliminatorie', calculatedEliminatorie);
  });
  socket.on('setPunteggi', data => {
    calculatedGironi[data.girone][data.duello].puntiUguale = data.uguale;
    calculatedGironi[data.girone][data.duello].puntiOpposto = data.opposto;

    calculatedGironi[data.girone][data.duello].winner = '';

    if(!isNaN(data.uguale) && !isNaN(data.opposto) && data.uguale != null && data.opposto != null) {
      //if((data.uguale >= 10 || data.opposto >= 10) && data.uguale != data.opposto) {
        const winner = data.uguale*1 > data.opposto*1 ? 'uguale' : 'opposto';
        calculatedGironi[data.girone][data.duello].winner = winner;
      //}
    }
    
    io.emit('serveGironi', calculatedGironi);
  })
  socket.on('calcClassifica', type => {
    switch(type) {
      case 'gironi':
        classifica.data = calcClassificaGironi();
        break;
      case 'eliminatorie':
        classifica.data = calcClassificaEliminatorie();
        break;
      case 'reset':
        classifica.data = [];
        break;
    }
    io.emit('serveClassifica', classifica.data);
  });
  socket.on('getClassifica', () => {
    socket.emit('serveClassifica', classifica.data);
  });
  socket.on('saveAll', () => {
    const epoch = Date.now();
    writeFile(`./backup/bacchiatori_${epoch}.json`, JSON.stringify(bacchiatori), err => {
      if(err) console.log('Save error');
    });
    writeFile(`./backup/gironi_${epoch}.json`, JSON.stringify(calculatedGironi), err => {
      if(err) console.log('Save error');
    });
    writeFile(`./backup/eliminatorie_${epoch}.json`, JSON.stringify(calculatedEliminatorie), err => {
      if(err) console.log('Save error');
    });
    writeFile(`./backup/classifica_${epoch}.json`, JSON.stringify(classifica), err => {
      if(err) console.log('Save error');
    });
    socket.emit('savedAll');
  });

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
}

function calcEliminatorie(data) {
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
      if(winnerScore > 8 && loserScore > 8) {
        punteggi[winnerName] += 1 / numeroDuelliPerPersona[girone.length];
      } else {
        punteggi[winnerName] += (winnerScore - loserScore) / numeroDuelliPerPersona[girone.length];
      }
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

  const dimensioneGirone = data ? data * 1 : 32;

  arrayPunteggi.forEach((bacchiatore, index) => {
    if(index < dimensioneGirone) calculatedEliminatorie[0][ordineEliminatorie[index]] = {...defaultValue, name: bacchiatore.name};
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
  arrayBacchiatori.sort((a, b) => b[1] - a[1]);
  
  for(const bacchiatore of arrayBacchiatori) {
    const name = bacchiatore[0];
    if(i == gironi[i]) i = (i + 1) % numGironi;
    composizioneGironi[i].push(name);
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

function calcClassificaGironi() {
  const result = {};

  for(const girone of Object.values(calculatedGironi)) {
    const dimensioneGirone = numeroDuelliPerPersona[girone.length];
    for (const duello of girone) {
      if(!(duello.nomeUguale in result)) result[duello.nomeUguale] = {wins: 0, fatti: 0, ricevuti: 0};
      if(!(duello.nomeOpposto in result)) result[duello.nomeOpposto] = {wins: 0, fatti: 0, ricevuti: 0};
      if(duello.winner == 'uguale') {
        result[duello.nomeUguale].wins++;
      } else if(duello.winner == 'opposto') {
        result[duello.nomeOpposto].wins++;
      }
      result[duello.nomeUguale].fatti += duello.puntiUguale / dimensioneGirone;
      result[duello.nomeUguale].ricevuti += duello.puntiOpposto / dimensioneGirone;
      result[duello.nomeOpposto].fatti += duello.puntiOpposto / dimensioneGirone;
      result[duello.nomeOpposto].ricevuti += duello.puntiUguale / dimensioneGirone;
    }
  }
  const arrayResult = Object.entries(result).map(([key, item]) => {
    return {name: key, ...item};
  });
  arrayResult.sort((a, b) => {
    if(b.wins - a.wins != 0) return b.wins - a.wins;
    if(b.fatti - a.fatti != 0) return b.fatti - a.fatti;
    if(a.ricevuti - b.ricevuti != 0) return a.ricevuti - b.ricevuti;
  });
  return arrayResult;
}

function calcClassificaEliminatorie() {

  let totalBacchiatori = 0;
  if(calculatedEliminatorie.length > 0) {
    for(const el of calculatedEliminatorie[0]) {
      if(el.name != '') totalBacchiatori++;
    }
  }
  if(totalBacchiatori == 0) return;

  const result = {
    [calculatedEliminatorie[5][0].name]: {
      name: calculatedEliminatorie[5][0].name,
      wins: 0,
      duelli: 0,
      fatti: 0,
      ricevuti: 0
    }
  };

  for(let i = calculatedEliminatorie.length - 2; i >= 0; i--) {
    const currentGirone = calculatedEliminatorie[i];
    for(let j = 0; j < currentGirone.length; j += 2) {
      const b1 = currentGirone[j];
      const b2 = currentGirone[j + 1];
      if(!b1.name || !b2.name) continue;
      if(!(b1.name in result)) result[b1.name] = {
        name: b1.name,
        wins: 0,
        duelli: 0,
        fatti: 0,
        ricevuti: 0
      };
      if(!(b2.name in result)) result[b2.name] = {
        name: b2.name,
        wins: 0,
        duelli: 0,
        fatti: 0,
        ricevuti: 0
      };
      result[b1.name].duelli++;
      result[b1.name].fatti += b1.score;
      result[b1.name].ricevuti += b2.score;
      result[b2.name].duelli++;
      result[b2.name].fatti += b2.score;
      result[b2.name].ricevuti += b1.score;
      if(b1.score > b2.score) result[b1.name].wins++;
      else result[b2.name].wins++;
    }
  }
  const arrayResult = Object.values(result);
  arrayResult.forEach(el => {
    el.fatti /= el.duelli;
    el.ricevuti /= el.duelli;
  });
  arrayResult.sort((a, b) => {
    if(b.wins - a.wins != 0) return b.wins - a.wins;
    if(b.fatti - a.fatti != 0) return b.fatti - a.fatti;
    if(a.ricevuti - b.ricevuti != 0) return a.ricevuti - b.ricevuti;
  });
  return arrayResult;
}
