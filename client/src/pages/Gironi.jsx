import { useState, useEffect } from 'react';
import './Gironi.css';

const Gironi = ({socket}) => {

  const [gironi, setGironi] = useState([]);
  const [numEditDuello, setNumEditDuello] = useState([]);
  const [newPunteggi, setNewPunteggi] = useState({uguale: 0, opposto: 0});
  const [gironiVisibility, setGironiVisibility] = useState({});

  useEffect(() => {
    socket.on('serveGironi', data => {
      const arrayGironi = Object.values(data);
      const newNumEditDuello = [];
      for(let i = 0; i < arrayGironi.length; i++) {
        newNumEditDuello.push(-1);
      }
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
            const newGironeVisibility = !gironiVisibility[iGirone];
            setGironiVisibility({...gironiVisibility, [iGirone]: newGironeVisibility});
          }}>{`Girone ${iGirone + 1}`}</button>
          { 
            !gironiVisibility[iGirone] &&
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
                            placeholder={duello.puntiUguale}
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
                        const newNumEditDuello = [...numEditDuello];
                        newNumEditDuello[iGirone] = -1;
                        setNumEditDuello(newNumEditDuello);
                      }}>✖</td>
                      <td></td>
                      <td className='cell-button' onClick={() => {
                        if(newPunteggi.uguale === '' || newPunteggi.opposto === '') {
                          alert('Entrambi i punteggi devono avere un valore');
                          return;
                        } else if(newPunteggi.uguale < 0 || newPunteggi.opposto < 0) {
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