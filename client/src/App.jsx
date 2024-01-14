import { useState } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from './pages/Layout';
import Home from './pages/Home';
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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="bacchiatori" element={<Bacchiatori socket={socket} bacchiatori={bacchiatori} />} />
          <Route path="gironi" element={<Gironi socket={socket} bacchiatori={bacchiatori} />} />
          <Route path="eliminazione" element={<Eliminazione socket={socket} bacchiatori={bacchiatori} />} />
          <Route path="*" element={<Eliminazione socket={socket} bacchiatori={bacchiatori} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;