const Home = ({setAdmin}) => {
  return (
    <>
      <input onBlur={e => {
        if(e.target.value == 'password') localStorage.setItem('admin', true);
        else localStorage.setItem('admin', false);
        
        setAdmin(localStorage.getItem('admin') === 'true');
      }}></input>
      <button>Enter!</button>
    </>
  )
}

export default Home;