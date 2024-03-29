import { useRef, useEffect } from 'react';
import './Admin.css';

const Admin = ({socket, bacchiatori, admin, setAdmin}) => {

  const pwdRef = useRef();
  const selectRef = useRef();

  const addFighter = e => {
    e.preventDefault();
    socket?.emit('addFighter', {
      name: e.target.elements.name.value,
      level: e.target.elements.level.value
    });
  }

  useEffect(() => {
    socket.on('savedAll', () => alert('Torneo salvato!'));
  }, [socket]);

  return (
    <>
      { admin && 
        <>
          <div className='options-container'>
            <h1>Aggiunta Bacchiatori:</h1>
            <form className='form' onSubmit={addFighter}>
              <div className='form-item'>
                <p>Nome:</p>
                <input required={true} name="name" />
              </div>
              <div className='form-item'>
                <p>Livello:</p>
                <input type='number' required={true} min={0} max={10} name="level" />
              </div>
              <div className='form-item'>
                <button className='submit-button' type="submit">Aggiungi</button>
              </div>
            </form>
            <hr />
            <p>{'Numero bacchiatori: ' + Object.entries(bacchiatori).length}</p>
            <hr />
            <div className='fighter-container'>{Object.entries(bacchiatori).map(([key, value]) => {
              return (
                <div key={key} className='fighter-row'>
                  <p>{`${key}: ${value}`}</p>
                  <button onClick={() => {
                    if(confirm('Vuoi cancellare questo bacchiatore?')) socket?.emit('deleteFighter', key);
                  }}>X</button>
                </div>
              );
            })
            }</div>
            <hr />
            <p>Genera duelli:</p>
            <button className='calc-button' onClick={() => {
              if(!confirm('Questa operazione sovrascrive tutti i gironi.\nContinuare?')) return;
              if(!confirm('Verranno eliminati tutti i punteggi già inseriti nei gironi.\nContinuare?')) return;
              if(!confirm('ULTIMO AVVERTIMENTO\nE se poi te ne penti?\nSicuro?')) return;
              socket?.emit('calcGironi');
            }}>Calcola gironi</button>
            <div className='select-container'>
              <p>Dimensione eliminatorie:</p>
              <select ref={selectRef}>
                <option value='32'>32</option>
                <option value='16'>16</option>
                <option value='8'>8</option>
              </select>
            </div>
            <button className='calc-button' onClick={() => {
              if(!confirm('Questa operazione sovrascrive l\'albero delle eliminatorie.\nContinuare?')) return;
              if(!confirm('Verranno eliminati tutti i punteggi già inseriti nelle eliminatorie.\nContinuare?')) return;
              if(!confirm('ULTIMO AVVERTIMENTO\nNon c\'è modo di recuperare i vecchi punteggi.\nSicuro?')) return;
              socket?.emit('calcEliminatorie', selectRef?.current?.value);
            }}>Calcola eliminatorie</button>
            <hr />
            <p>Genera classifica:</p>
            <button className='calc-button' onClick={() => {
              if(!confirm('Questa operazione sovrascrive l\'attuale classifica.\nContinuare?')) return;
              socket?.emit('calcClassifica', 'gironi');
            }}>Classifica gironi</button>
            <button className='calc-button' onClick={() => {
              if(!confirm('Questa operazione sovrascrive l\'attuale classifica.\nContinuare?')) return;
              socket?.emit('calcClassifica', 'eliminatorie');
            }}>Classifica eliminatorie</button>
            <button className='calc-button' onClick={() => {
              if(!confirm('Questa operazione sovrascrive l\'attuale classifica.\nContinuare?')) return;
              socket?.emit('calcClassifica', 'reset');
            }}>Reset Classifica</button>
            <hr />
            <button className='calc-button' onClick={() => {
              socket?.emit('saveAll');
            }}>Salva Torneo</button>
            <hr />
          </div>
        </>
      }
      <div className='password-container'>
        <h1>Password admin:</h1>
        <input ref={pwdRef}></input>
        <button onClick={() => {
          if(!pwdRef?.current?.value) return;
          if(pwdRef.current.value == 'slartibartfast') localStorage.setItem('admin', true);
          else localStorage.setItem('admin', false);
          setAdmin(localStorage.getItem('admin') === 'true');
          pwdRef.current.value = null;
        }}>Enter!</button>
      </div>
    </>
  )
}

export default Admin;