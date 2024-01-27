import { useState, useEffect } from 'react';
import './Eliminazione.css';


const Eliminazione = ({admin, socket}) => {

  const [table, setTable] = useState([[]]);
  const [minPage, setMinPage] = useState(0);
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem('pageEliminatorie');
    if(saved) return saved * 1;
    else return 0;
  });
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

  const handlePage = i => {
    localStorage.setItem('pageEliminatorie', i);
    setPage(i);
  }

  function fillTable() {

    let totalBacchiatori = 0;
    if(eliminatorie.length > 0) {
      for(const el of eliminatorie[0]) {
        if(el.name != '') totalBacchiatori++;
      }
    }
    if(totalBacchiatori == 0) return;

    const colNumber = Math.ceil(Math.log2(totalBacchiatori)) + 1;
    const tempMinPage = 6 - colNumber;

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
          const bacchiatore = eliminatorie[i][bacNumber[i]];
          const sfidNumber = i != 5 ? bacNumber[i] % 2 == 0 ? bacNumber[i] + 1 : bacNumber[i] - 1 : bacNumber[i];
          const sfidante = eliminatorie[i][sfidNumber];
          const isNamed = bacchiatore.name && bacchiatore.name != '?';
          const sfidanteIsNamed = sfidante.name && sfidante.name != '?';      

          cell.visible = true;
          cell.text = bacchiatore.name ? bacchiatore.name : '---';
          cell.score = bacchiatore.score;
          cell.color = colorMatrix[i] % 2 == 0 ? '#FAFAFA' : '#FF9999';
          cell.coords = {fase: i, bacchiatore: bacNumber[i]};
          cell.inputVisible = i != 5 && isNamed && sfidanteIsNamed;
          
          colorMatrix[i]++;
          bacNumber[i] += 1;
        } else {
          cell.text = '';
          cell.visible = false;
          cell.color = fillMatrix[i][j] ? 'var(--filler-color)' : 'var(--bg-color)';
          cell.inputVisible = false;
        }
        row.push(cell);
      }
      rows.push(row);
    }
    
    setMinPage(tempMinPage);
    if(page < tempMinPage) setPage(tempMinPage);
    setTable(rows);
  }

  return (
    <>
      <button className='page-arrow arrow-prev-eliminazione' onClick={() => handlePage(Math.max(minPage, page - 1))}></button>
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
                      {cell.inputVisible &&
                      <input className='input-eliminazione-score'
                        style={{backgroundColor: cell.color}}
                        placeholder={cell.score ?? 0}
                        disabled={!admin}
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
    <button className='page-arrow arrow-next-eliminazione' onClick={() => handlePage(Math.min(5, page + 1))}></button>
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