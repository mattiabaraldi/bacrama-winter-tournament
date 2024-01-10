import { useState } from 'react';
import {io} from 'socket.io-client';

let socket;

const App = () => {

  const [fighters, setFighters] = useState({});
  const [socket, setSocket] = useState(() => {
    const socket = io();
    socket.on('disconnect', () => console.log('disconnect'));
    //socket.on('connect_error', () => {
    //  setTimeout(() => socket.connect(), 5000);
    //});
    socket.on('serveFighters', data => setFighters(data));
    socket.on('connect', () => socket.emit('getFighters'));
    return socket;
  });
  
  const addFighter = e => {
    e.preventDefault();
    socket?.emit('addFighter', {
      name: e.target.elements.name.value,
      level: e.target.elements.level.value
    });
  }

  return (
    <>
      <form onSubmit={addFighter}>
        <div style={{
          height: '200px',
          width: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div>
            <p>Nome:</p>
            <input name="name" />
          </div>
          <div>
            <p>Livello:</p>
            <input type='number' name="level" />
          </div>
          <div style={{paddingTop: '30px'}}>
            <button type="submit">Aggiungi</button>
          </div>
        </div>
        {Object.entries(fighters).map(([key, value]) => {
          return <p>{`${key}: ${value}`}</p>;
        })}
      </form>
      
    </>
  );
}

export default App;