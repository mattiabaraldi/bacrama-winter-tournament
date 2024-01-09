import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname + '/public/'));

app.get('/api/getDatabase', (req, res) => {
  res.send(readFileSync('./database.json', 'utf8'));
});

app.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) socket.end('HTTP/2 400 Bad Request\n');
  console.log('client error\n', err);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



