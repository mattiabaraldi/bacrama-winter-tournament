import { useState } from 'react';
import { io } from 'socket.io-client';

import Route from './components/Route';
import Link from './components/Link';
import Home from './pages/Home';
import Bacchiatori from './pages/Bacchiatori';
import Gironi from './pages/Gironi';
import Eliminazione from './pages/Eliminazione';

import './App.css';

const App = () => {

  const [bacchiatori, setBacchiatori] = useState({});
  const [socket, setSocket] = useState(() => {
    //const socket = io('/', {transports: ['websocket']});
    const socket = io('http://localhost:3000', {transports: ['websocket']});
    socket.on('disconnect', () => console.log('disconnect'));
    socket.on('connect_error', () => {
      setTimeout(() => socket.connect(), 5000);
    });
    socket.on('serveFighters', data => setBacchiatori(data));
    socket.on('connect', () => socket.emit('getFighters'));
    return socket;
  });

  return (
    <div className='outlet-container'>
      <nav>
        <ul className='navigator'>
          <Link href='/'>Home</Link>
          <Link href='/bacchiatori/'>Bacchiatori</Link>
          <Link href='/gironi/'>Gironi</Link>
          <Link href='/eliminatorie/'>Eliminatorie</Link>
        </ul>
      </nav>

      <div className='main-grid'>     
        <div className='main-column'>
          <Route path='/'>
            <Home />
          </Route>
          <Route path='/bacchiatori/'>
            <Bacchiatori socket={socket} bacchiatori={bacchiatori} />
          </Route>
          <Route path='/gironi/'>
            <Gironi socket={socket} bacchiatori={bacchiatori} />
          </Route>
        </div>
        <Route path='/eliminatorie/'>
          <Eliminazione socket={socket} bacchiatori={bacchiatori} />
        </Route>
      </div>
    </div>
  );
}

export default App;