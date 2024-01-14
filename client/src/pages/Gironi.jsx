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
  const [gironiVisibility, setGironiVisibility] = useState([]);

  useEffect(() => {
    socket.on('serveGironi', data => {
      const arrayGironi = Object.values(data);
      const newGironiVisibility = [];
      for(let i = 0; i < arrayGironi.length; i++) {
        newGironiVisibility.push(false);
      }
      setGironiVisibility(newGironiVisibility);
      setGironi([...arrayGironi]);
    });
    socket.on('serveGironi', data => {

    })
    socket.emit('getGironi');
  }, [socket]);

  const calcGironi = () => {
    const number = Object.entries(bacchiatori).length;
    
    return number;
  }

  return (
    <>
      {
        gironi.map((girone, index) => {
        return (
        <div key={index}>
          <button className='button-girone' onClick={() => {
            const newGironiVisibility = [...gironiVisibility];
            newGironiVisibility[index] = !gironiVisibility[index];
            setGironiVisibility(newGironiVisibility);
          }}>{`Girone ${index + 1}`}</button>
          {gironiVisibility[index] && <div>
            {null && <table style={{marginTop: '10px', marginBottom: '10px'}} key={index}>
              <thead>
                <tr>
                  <th></th>
                  { girone.map((bacchiatore, index) => <td key={index}>{bacchiatore}</td>) }
                </tr>
              </thead>
              <tbody>
                {
                  girone.map((bacchiatore, index) => {
                    return (
                      <tr key={index}>
                        <td>{bacchiatore}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>}
            <table className='table-girone'>
              <tbody>
              {ordineDuelli[girone.length].map((ordine, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{girone[ordine[0] - 1]}</td>
                    <td className='cell-score'></td>
                    <td>{girone[ordine[1] - 1]}</td>
                    <td className='cell-score'></td>
                    { index == 3 &&
                      <td className='cell-button'>✔</td>
                    }
                  </tr>
                )
              })}

            </tbody>
            </table>
          </div>}
        </div>
        )
      })}
    </>
  )
}

export default Gironi;