import { useState, useEffect } from 'react';
import './Bacchiatori.css';

const Bacchiatori = ({socket, bacchiatori}) => {

  const [gironi, setGironi] = useState();
  console.log(gironi)
  
  useEffect(() => {
    socket.on('serveGironi', data => {
      setGironi([...Object.values(data)]);
    });
    socket.emit('getGironi');
  }, [socket]);

  return (
    <>
      <div className='bacchiatori-container'>
        {Object.entries(bacchiatori).toSorted().map(([key, value]) => { return (
          <div className='bacchiatore-riga'>
            <p key={key}>{`⚞ · ${key} · ⚟`}</p>
          </div>
        )})}
      </div>
    </>
  );
}

export default Bacchiatori;