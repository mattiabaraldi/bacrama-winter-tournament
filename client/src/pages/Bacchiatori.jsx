import { useState, useEffect } from 'react';
import './Bacchiatori.css';

const Bacchiatori = ({socket, bacchiatori}) => {

  const [classifica, setClassifica] = useState([]);

  useEffect(() => {
    socket.on('serveClassifica', data => {
      setClassifica([...data]);
    });
    socket.emit('getClassifica');
  }, [socket]);

  const podio = ['🥇', '🥈', '🥉'];

  return (
    <>
      <div className='bacchiatori-container'>
        { classifica.length == 0 ?
          Object.entries(bacchiatori).sort().map(([key, value]) => { return (
            <div key={key} className='bacchiatore-riga'>
              <p>{`· ${key} ·`}</p>
            </div>
          )})
        :
          classifica.map((value, index) => { return (
            <div key={index} className='classifica-riga'>
              <p>{index in podio ? `${podio[index]}` : `· ${index + 1}`}</p>
              <p>{`${value.name}`}</p>
              <p>{index in podio ? `${podio[index]}` : `${index + 1} ·`}</p>
            </div>
          )})
        }
      </div>
    </>
  );
}

export default Bacchiatori;