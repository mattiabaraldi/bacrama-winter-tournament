import { useState } from 'react';
import { io } from 'socket.io-client';

import Route from './components/Route';
import Link from './components/Link';
import Admin from './pages/Admin';
import Bacchiatori from './pages/Bacchiatori';
import Gironi from './pages/Gironi';
import Eliminazione from './pages/Eliminazione';

import './App.css';

const App = () => {

  const [bacchiatori, setBacchiatori] = useState({});
  const [socket, setSocket] = useState(() => {
    const socket = io('/', {transports: ['websocket']});
    //const socket = io('http://localhost:3000', {transports: ['websocket']});
    socket.on('disconnect', () => console.log('disconnect'));
    socket.on('connect_error', () => {
      setTimeout(() => socket.connect(), 5000);
    });
    socket.on('serveFighters', data => setBacchiatori(data));
    socket.on('connect', () => socket.emit('getFighters'));
    return socket;
  });
  const [admin, setAdmin] = useState(() => localStorage.getItem('admin') === 'true')

  return (
    <div className='outlet-container'>
      <nav>
        <ul className='navigator'>
          <img src='/bacrama.svg'></img>
          {admin && <Link href='/admin/'>Admin</Link>}
          <Link href='/bacchiatori/'>Bacchiatori</Link>
          <Link href='/gironi/'>Gironi</Link>
          <Link href='/eliminatorie/'>Eliminatorie</Link>
        </ul>
      </nav>

      <div className='main-grid'>     
        <div className='main-column'>
          <Route path='/admin/'>
            <Admin socket={socket} bacchiatori={bacchiatori} admin={admin} setAdmin={setAdmin}/>
          </Route>
          <Route path='/bacchiatori/' defaultPath='/'>
            <Bacchiatori socket={socket} bacchiatori={bacchiatori} />
          </Route>
          <Route path='/gironi/'>
            <Gironi admin={admin} socket={socket} />
          </Route>
        </div>
        <Route path='/eliminatorie/'>
          <Eliminazione admin={admin} socket={socket} />
        </Route>
      </div>
    </div>
  );
}

export default App;