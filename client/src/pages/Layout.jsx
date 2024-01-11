import { Outlet, useNavigate } from "react-router-dom";
import './Layout.css';

const Layout = () => {

  const navigate = useNavigate();

  return (
    <div className='outlet-container'>
      <nav>
        <ul className='navigator'>
          <div onClick={() => navigate('/')}>
            <div>Home</div>
          </div>
          <div onClick={() => navigate('/bacchiatori')}>
            <div>Bacchiatori</div>
          </div>
          <div onClick={() => navigate('/gironi')}>
            <div>Gironi</div>
          </div>
          <div onClick={() => navigate('/eliminazione')}>
            <div>Eliminazione</div>
          </div>
        </ul>
      </nav>

      <div className='main-grid'>     
        <div className='main-column'>
          <Outlet />
        </div>
      </div>
    </div>
  )
};

export default Layout;