import { useState, useEffect } from 'react';

const App = () => {

  const [database, setDatabase] = useState();

  useEffect(() => {
    fetch('/api/getDatabase',
    {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      }
    })
    .then(response => {
      response.json()
      .then(data => {
        console.log(data);
        setDatabase(JSON.stringify(data));
      })
    })
  }, []);
  
  return (
    <>{database}</>
  );
}

export default App;