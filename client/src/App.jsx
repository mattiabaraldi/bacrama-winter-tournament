import { useState } from 'react';
import {io} from 'socket.io-client';
import './App.css';

const App = () => {

  const [fighters, setFighters] = useState({});
  const [socket, setSocket] = useState(() => {
    const socket = io('/', {transports: ['websocket']});
    //const socket = io('http://localhost:3000', {transports: ['websocket']});
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
      <div className='main-grid'>     
        <div className='main-column' style={{display: 'flex', flexDirection: 'column'}}>
          <form className='form' onSubmit={addFighter}>
            <div className='form-item'>
              <p>Nome:</p>
              <input required={true} name="name" />
            </div>
            <div className='form-item'>
              <p>Livello:</p>
              <input type='number' required={true} max={10} min={0} name="level" />
            </div>
            <div className='form-item'>
              <button className='submit-button' type="submit">Aggiungi</button>
            </div>
          </form>
          <div>
          {Object.entries(fighters).map(([key, value]) => {
              return (
                <div className='fighter-row'>
                  <p key={key}>{`${key}: ${value}`}</p>
                  <button onClick={() => {
                    if(confirm('Vuoi cancellare questo bacchiatore?')) socket?.emit('deleteFighter', key);
                  }}>X</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;