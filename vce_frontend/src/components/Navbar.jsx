import { useState, useEffect, useRef, React} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AxiosInstance from '../utils/AxiosInstance'
import '../styles/NavBar.scss';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const isLoggedIn = Boolean(localStorage.getItem('Token'));

  const [openMenu, setOpenMenu] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  const navbarRef = useRef(null);

  const logoutUser = () => {
    AxiosInstance.post(`logout/`).then(() => {
      localStorage.removeItem('Token');
      navigate('/login');
    });
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target)
      ) {
        setOpenMenu(null); 
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const logoUrl = "https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/LogoTransparent.webp";
  const subjects = ['physics', 'chemistry', 'biology'];


  const isInSection = (section) => location.pathname.includes(section);

  return (
    <nav className="navbar" ref={navbarRef}>
      <div className="navbar-left">
        <img
          src={logoUrl}
          alt="Chuba Logo"
          className="navbar-logo"
          onClick={() => navigate('/')}
          width = "100" height="100"
        />

        <ul className="navbar-menu">
          <li 
            className={`navbar-item ${isInSection('/summaries') ? 'active' : ''}`}
            onClick={() =>
              setOpenMenu(openMenu === 'summary' ? null : 'summary')
            }
          >
            {isMobile ? <span style={{ fontSize: '1.0rem' }}>📚</span> : 'Summary'}
            {openMenu === 'summary' && (
              <ul className="navbar-submenu">
                {subjects.map((sub) => (
                  <li
                    key={sub}
                    className="navbar-subitem"
                    onClick={() => {
                      navigate(`/summaries/${sub}`);
                      setOpenMenu(null);
                    }}
                  >
                    {sub[0].toUpperCase() + sub.slice(1)}
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li 
            className={`navbar-item ${isInSection('/practice/') ? 'active' : ''}`}
            onClick={() =>
              setOpenMenu(openMenu === 'practice' ? null : 'practice')
            }
          >
            {isMobile ? <span style={{ fontSize: '1.0rem' }}>✍🏻</span> : 'Practice'}
           {openMenu === 'practice' && (
              <ul className="navbar-submenu">
                {subjects.map((sub) => (
                  <li
                    key={sub}
                    className="navbar-subitem"
                    onClick={() => {
                      navigate(`/practice/${sub}`);
                      setOpenMenu(null);
                    }}
                  >
                    {sub[0].toUpperCase() + sub.slice(1)}
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li 
            className={`navbar-item ${isInSection('/practice-sac') ? 'active' : ''}`}
            onClick={() =>
              setOpenMenu(openMenu === 'practice-sac' ? null : 'practice-sac')
            }
          >
            {isMobile ? <span style={{ fontSize: '1.0rem' }}>📝</span> : 'Practice SAC'}
            {openMenu === 'practice-sac' && (
              <ul className="navbar-submenu">
                {subjects.map((sub) => (
                  <li
                    key={sub}
                    className="navbar-subitem"
                    onClick={() => {
                      navigate(`/practice-sac/${sub}`);
                      setOpenMenu(null);
                    }}
                  >
                    {sub[0].toUpperCase() + sub.slice(1)}
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </div>

      <div className="navbar-right">
        {!isLoggedIn ? (
          <button
            className="navbar-button"
            onClick={() => navigate('/login')}
          >
            Sign in
          </button>
        ) : (
          <button
            className="navbar-button"
            onClick={logoutUser}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
