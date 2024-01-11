import './Bacchiatori.css';

const Bacchiatori = ({socket, bacchiatori}) => {
  
  const addFighter = e => {
    e.preventDefault();
    socket?.emit('addFighter', {
      name: e.target.elements.name.value,
      level: e.target.elements.level.value
    });
  }

  return (
    <>
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
      <div>
      {Object.entries(bacchiatori).map(([key, value]) => {
          return (
            <div key={key} className='fighter-row'>
              <p>{`${key}: ${value}`}</p>
              <button onClick={() => {
                if(confirm('Vuoi cancellare questo bacchiatore?')) socket?.emit('deleteFighter', key);
              }}>X</button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Bacchiatori;