import { useState, useEffect } from 'react';
import './Gironi.css';

const Gironi = ({admin, socket}) => {

  const [gironi, setGironi] = useState([]);
  const [gironiVisibility, setGironiVisibility] = useState(() => {
    const saved = localStorage.getItem('gironiVisibility');
    if(saved) return saved * 1;
    else return 0;
  });
  const [target, setTarget] = useState('')

  useEffect(() => {
    socket.on('serveGironi', data => {
      const arrayGironi = Object.values(data);
      setGironi([...arrayGironi]);
    });
    socket.emit('getGironi');
  }, [socket]);

  const handleGironiVisibility = i => {
    localStorage.setItem('gironiVisibility', i);
    setGironiVisibility(i);
  }

  return (
    <>
      <div className='selector-bacchiatore'>
        <p>Cerca Bacchiatore:</p>
        <input onChange={e => {
          const name = e.target.value;
          if(name == '') {
            setTarget('')
            return;
          }
          let found = false;
          for(const key in gironi) {
            for(const duello of gironi[key]) {
              if(duello.nomeUguale.toLowerCase().search(name.toLowerCase()) != -1) {
                handleGironiVisibility(key);
                setTarget(duello.nomeUguale)
                break;
              }
              if(duello.nomeOpposto.toLowerCase().search(name.toLowerCase()) != -1) {
                handleGironiVisibility(key);
                setTarget(duello.nomeOpposto)
                break;
              }
            }
            if(found) break;
          }
        }} />
      </div>
      <div className='selector-girone'>{
        gironi.map((girone, iGirone) => {
          return <button key={iGirone}
            className={gironiVisibility == iGirone ? 'button-girone-active' : 'button-girone'}
            onClick={() => handleGironiVisibility(iGirone)}
          >
            {`G${iGirone + 1}`}
          </button>
        })
      }</div>
      <div>{ gironi.map((girone, iGirone) => { return (
        <div key={iGirone}>{
          gironiVisibility == iGirone &&
          <table className='table-girone'>
            <tbody>{
              girone.map((duello, iDuello) => { return (
              <tr key={iDuello} className='tr-girone'>
                <td className='td-indice-duello cell-score'>{duello.numeroDuello}</td>
                <td className={
                  'cell-name'
                  + (duello.winner == 'uguale' ? ' cell-winner' : duello.winner == 'opposto' ? ' cell-loser' : '')
                  + (target == duello.nomeUguale ? ' cell-name-active' : '')}>
                  {duello.nomeUguale}
                </td>
                <td className='cell-score'>
                  <input
                    className={'input-score'}
                    placeholder={duello.puntiUguale}
                    disabled={!admin}
                    onBlur={e => {
                      updateGirone(socket, iGirone, iDuello, e.target.value, duello.puntiOpposto, true)
                      e.target.value = null;
                    }}
                    type='number'
                    min='0'
                  />
                </td>
                <td className={
                  'cell-name'
                  + (duello.winner == 'uguale' ? ' cell-loser' : duello.winner == 'opposto' ? ' cell-winner' : '')
                  + (target == duello.nomeOpposto ? ' cell-name-active' : '')}>
                  {duello.nomeOpposto}
                </td>
                <td className='cell-score'>
                  <input
                    className={'input-score'}
                    placeholder={duello.puntiOpposto}
                    disabled={!admin}
                    onBlur={e => {
                      updateGirone(socket, iGirone, iDuello, e.target.value, duello.puntiUguale, false)
                      e.target.value = null;
                    }}
                    type='number'
                    min='0'
                  />
                </td>
              </tr>
              )})}</tbody>
          </table>
        }</div>
      )})}</div>
    </>
  )
}

const updateGirone = (socket, iGirone, iDuello, puntiBacchiatore, puntiSfidante, isUguale) => {

  if(isNaN(puntiBacchiatore) || !puntiBacchiatore || puntiBacchiatore == null) return null;

  if(puntiBacchiatore < 0) {
    alert('I punteggi devono essere maggiori di zero');
    return null;
  }

  //console.log(puntiBacchiatore, puntiSfidante)

  /*if((puntiBacchiatore > 10 || puntiSfidante > 10) && Math.abs(puntiBacchiatore - puntiSfidante) > 2) {
    alert('La differenza ai vantaggi non può essere maggiore di due');
    return null;
  }*/

  socket.emit('setPunteggi', {
    girone: iGirone,
    duello: iDuello,
    uguale: isUguale ? puntiBacchiatore : puntiSfidante,
    opposto: isUguale ? puntiSfidante : puntiBacchiatore
  });

}

export default Gironi;