import { useState, useEffect } from 'react';
import './Gironi.css';

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

const Gironi = ({socket, bacchiatori}) => {

  const [gironi, setGironi] = useState([]);
  const [numEditDuello, setNumEditDuello] = useState([]);
  const [newPunteggi, setNewPunteggi] = useState({uguale: 0, opposto: 0});
  const [gironiVisibility, setGironiVisibility] = useState([]);

  useEffect(() => {
    socket.on('serveGironi', data => {
      const arrayGironi = Object.values(data);
      const newGironiVisibility = [];
      const newNumEditDuello = [];
      for(let i = 0; i < arrayGironi.length; i++) {
        newGironiVisibility.push(true);
        newNumEditDuello.push(-1);
      }
      setGironiVisibility(newGironiVisibility);
      setNumEditDuello(newNumEditDuello);
      setGironi([...arrayGironi]);
    });
    socket.emit('getGironi');
  }, [socket]);

  return (
    <>
      {
        gironi.map((girone, iGirone) => {
        return (
        <div key={iGirone}>
          <button className='button-girone' onClick={() => {
            const newGironiVisibility = [...gironiVisibility];
            newGironiVisibility[iGirone] = !gironiVisibility[iGirone];
            setGironiVisibility(newGironiVisibility);
          }}>{`Girone ${iGirone + 1}`}</button>
          { 
            gironiVisibility[iGirone] &&
            <div>
              <table className='table-girone'>
                <tbody>
                  { girone.map((duello, iDuello) => {
                    return (
                      <tr key={iDuello}
                        className={numEditDuello[iGirone] == iDuello ? 'tr-girone-active' : 'tr-girone'}
                        onClick={() => {
                          if(numEditDuello[iGirone] != -1) return;
                          const newNumEditDuello = [...numEditDuello];
                          newNumEditDuello[iGirone] = numEditDuello[iGirone] == -1 ? iDuello : -1;
                          setNumEditDuello(newNumEditDuello);
                        }}
                      >
                        <td>{duello.numeroDuello}</td>
                        <td>{duello.nomeUguale}</td>
                        <td className='cell-score'>
                          <input
                            className={numEditDuello[iGirone] == iDuello ? 'input-score-active' : 'input-score'}
                            defaultValue={duello.puntiUguale}
                            disabled={numEditDuello[iGirone] != iDuello}
                            onChange={e => setNewPunteggi({...newPunteggi, uguale: e.target.value})}
                            type='number'
                            min='0'
                          />
                        </td>
                        <td>{duello.nomeOpposto}</td>
                        <td className='cell-score'>
                          <input
                            className={numEditDuello[iGirone] == iDuello ? 'input-score-active' : 'input-score'}
                            defaultValue={duello.puntiOpposto}
                            disabled={numEditDuello[iGirone] != iDuello}
                            onChange={e => setNewPunteggi({...newPunteggi, opposto: e.target.value})}
                            type='number'
                            min='0'
                          />
                        </td>
                      </tr>
                    )
                  })}
                  { numEditDuello[iGirone] != -1 &&
                    <tr className='tr-button'>
                      <td></td>
                      <td className='cell-button' onClick={() => {
                        if(newPunteggi.uguale < 0 || newPunteggi.opposto < 0) {
                          alert('I punteggi devono essere maggiori di zero');
                          return;
                        } else if((newPunteggi.uguale > 10 || newPunteggi.opposto > 10) && Math.abs(newPunteggi.uguale - newPunteggi.opposto) > 2) {
                          alert('La differenza ai vantaggi non può essere maggiore di due');
                          return;
                        }
                        socket.emit('setPunteggi', {
                          girone: iGirone,
                          duello: numEditDuello[iGirone],
                          uguale: newPunteggi.uguale,
                          opposto: newPunteggi.opposto
                        });
                        const newNumEditDuello = [...numEditDuello];
                        newNumEditDuello[iGirone] = -1;
                        setNumEditDuello(newNumEditDuello);
                      }}>✔</td>
                      <td></td>
                      <td className='cell-button' onClick={() => {
                        const newNumEditDuello = [...numEditDuello];
                        newNumEditDuello[iGirone] = -1;
                        setNumEditDuello(newNumEditDuello);
                      }}>✖</td>
                      <td></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
        )
      })}
    </>
  )
}

export default Gironi;