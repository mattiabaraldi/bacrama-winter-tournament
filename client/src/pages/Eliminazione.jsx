import { useState, useEffect } from 'react';
import './Eliminazione.css';


const Eliminazione = ({socket}) => {

  const [table, setTable] = useState([[]]);
  const [page, setPage] = useState(0);
  const [editBacchiatore, setEditBacchiatore] = useState();
  const [eliminatorie, setEliminatorie] = useState([]);

  useEffect(() => {
    socket.on('serveEliminatorie', data => {
      setEliminatorie([...data]);
    });
    socket.emit('getEliminatorie');
  }, [socket]);

  useEffect(() => {
    fillTable();
  }, [eliminatorie]);

  function fillTable() {
    const fillMatrix = [];
    const visibleMatrix = [];
    const bacNumber = [];
    for(let i = 0; i < 6; i++) {
      visibleMatrix.push([]);
      fillMatrix.push([]);
      bacNumber[i] = 0;
    }
    for(let i = 0; i < 6; i++) {
      for(let j = 0; j < 63; j++) {
        visibleMatrix[i].push(false);
        fillMatrix[i].push(false);
      }
    }
    
    const colorMatrix = [];
    for(let i = 0; i < 63; i++) {
      visibleMatrix[0][i] = (i % 2 == 0);
      colorMatrix[i] = 0;
    }

    for(let i = 0; i < 5; i++) {
      let firstPosition = -1;
      for(let j = 0; j < 63; j++) {
        if(firstPosition > -1) fillMatrix[i][j] = true;
        if(!visibleMatrix[i][j]) continue;
        if(firstPosition < 0) {
          firstPosition = j;
        } else {
          const nextPosition = firstPosition + (j - firstPosition) / 2;
          visibleMatrix[(i + 1)][nextPosition] = true;
          firstPosition = -1;
        }
      }
    }

    const rows = [];
    for(let j = 0; j < 63; j++) {
      const row = [];
      for(let i = 0; i < 6; i++) {
        const cell = {};
        if(visibleMatrix[i][j]) {
          if(eliminatorie.length != 0) {
            cell.text = eliminatorie[i][bacNumber[i]].name;
            cell.score = eliminatorie[i][bacNumber[i]].score;
          }
          if(cell.text === '') cell.text = '---';
          cell.visible = true;
          cell.color = colorMatrix[i] % 2 == 0 ? '#FAFAFA' : '#FF9999';
          cell.coords = {fase: i, bacchiatore: bacNumber[i]};
          colorMatrix[i]++;
          bacNumber[i] += 1;
        } else {
          cell.text = '';
          cell.visible = false;
          cell.color = fillMatrix[i][j] ? 'var(--filler-color)' : 'var(--bg-color)';
        }
        row.push(cell);
      }
      rows.push(row);
    }
    setTable(rows);
  }

  return (
    <>
      <button className='page-arrow arrow-prev-eliminazione' onClick={() => setPage(Math.max(0, page - 1))}></button>
      <div className='container-eliminazione'>
        <table className='table-eliminazione' style={{transform: `translateX(${-page*100/6}%)`}}>
          <tbody>{
            table.map((row, index) => {return (
              <tr key={index} className='row-eliminazione'>{
                row.map((cell, index) => {return (
                  <td
                    className={cell.visible ? 'cell-visible' : 'cell-filler'}
                    style={{backgroundColor: cell.color}}
                    key={index}
                  >
                    <div className='cell-visible-organization'>
                      {cell.text}
                      {cell.visible && cell.coords.fase != 5 && cell.text && cell.text != '---' && cell.text != '?' &&
                      <input className='input-eliminazione-score'
                        style={{backgroundColor: cell.color}}
                        placeholder={cell.score ?? 0}
                        type='number'
                        onFocus={e => e.target.select()}
                        onBlur={e => {
                          updateTree(socket, eliminatorie, cell.coords, e.target.value);
                          e.target.value = null;
                        }}
                      ></input>}
                    </div>
                  </td>
                )})
              }</tr>
            )})
          }</tbody>
        </table>
      </div>
    <button className='page-arrow arrow-next-eliminazione' onClick={() => setPage(Math.min(5, page + 1))}></button>
    </>
  )
}

export default Eliminazione;

const updateTree = (socket, tree, coords, score) => {
  const {fase, bacchiatore} = coords;

  if(isNaN(score) || !score || score == null) return null;

  if(score < 0) {
    alert('I punteggi devono essere maggiori di zero');
    return null;
  }
  const sfidante = tree[fase][bacchiatore + (bacchiatore % 2 == 0 ? 1 : -1)];

  if((score > 10 || sfidante.score > 10) && Math.abs(score - sfidante.score) > 2) {
    alert('La differenza ai vantaggi non può essere maggiore di due');
    return null;
  }

  socket.emit('editScore', {fase, bacchiatore, score});

}