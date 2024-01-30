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
          <table>
            <thead>
                <tr>
                <td></td>
                <td>Bacchiatore</td>
                <td>Wins (%)</td>
                <td>Avg</td>
              </tr>
            </thead>
            <tbody>
            { classifica.map((value, index) => { return (
                <tr key={index} className='classifica-table-row'>
                  <td>{index in podio ? `${podio[index]}` : `${index + 1}`}</td>
                  <td>{`${value.name}`}</td>
                  <td>{`${value.wins.toFixed(2)}`}</td>
                  <td>{`${value.score.toFixed(2)}`}</td>
                </tr>
              )})
            }
            </tbody>
          </table>
        }
      </div>
    </>
  );
}

export default Bacchiatori;

/*
<div key={index} className='classifica-riga'>
              <p>{`· ${index + 1}`}</p>
              <p>{`${value.name} ${value.wins} ${value.score}`}</p>
              <p>{`${index + 1} ·`}</p>
            </div>
            */