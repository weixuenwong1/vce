import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Atom,
  BookOpenText,
  ChevronDown,
  ClipboardCheck,
  Dna,
  FlaskConical,
  PencilLine,
} from 'lucide-react';
import AxiosInstance from '../utils/AxiosInstance'
import '../styles/NavBar.scss';
import { prefetchAuth } from '../utils/prefetchAuth';
import { clearSession, useSession } from '../utils/session';

const subjects = [
  {
    slug: 'physics',
    name: 'Physics',
    description: 'Motion, fields, electricity, waves and relativity',
    Icon: Atom,
  },
  {
    slug: 'chemistry',
    name: 'Chemistry',
    description: 'Reactions, organic chemistry and analysis',
    Icon: FlaskConical,
  },
  {
    slug: 'biology',
    name: 'Biology',
    description: 'Cells, immunity, evolution and biotechnology',
    Icon: Dna,
  },
];

const resourceMenus = [
  {
    id: 'summary',
    label: 'Summaries',
    path: 'summaries',
    activePath: '/summaries',
    eyebrow: 'Learn the content',
    title: 'Topic summaries',
    Icon: BookOpenText,
  },
  {
    id: 'practice',
    label: 'Practice',
    path: 'practice',
    activePath: '/practice/',
    eyebrow: 'Apply each concept',
    title: 'Practice questions',
    Icon: PencilLine,
  },
  {
    id: 'practice-sac',
    label: 'Practice SACs',
    path: 'practice-sac',
    activePath: '/practice-sac',
    eyebrow: 'Prepare for assessment',
    title: 'Practice SACs',
    Icon: ClipboardCheck,
  },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const isLoggedIn = useSession();

  const [openMenu, setOpenMenu] = useState(null);
  const navbarRef = useRef(null);

  const logoutUser = () => {
    AxiosInstance.post(`logout/`).then(() => {
      clearSession();
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


  const logoUrl = "https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/LogoTransparent.webp";

  const isInSection = (section) => location.pathname.includes(section);

  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  const openResource = (path, subject) => {
    navigate(`/${path}/${subject}`);
    setOpenMenu(null);
  };

  return (
    <nav className="navbar" ref={navbarRef}>
      <div className="navbar-left">
        <img
          src={logoUrl}
          alt="Chuba Logo"
          className="navbar-logo"
          onClick={() => navigate('/')}
          width = "100" height="100"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />

        <ul className="navbar-menu">
          {resourceMenus.map((menu) => {
            const MenuIcon = menu.Icon;
            const isOpen = openMenu === menu.id;

            return (
              <li
                className={`navbar-item ${isInSection(menu.activePath) ? 'active' : ''} ${isOpen ? 'open' : ''}`}
                key={menu.id}
              >
                <button
                  className="navbar-trigger"
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  onClick={() => setOpenMenu(isOpen ? null : menu.id)}
                >
                  <MenuIcon className="navbar-trigger-icon" aria-hidden="true" size={18} />
                  <span className="navbar-trigger-label">{menu.label}</span>
                  <ChevronDown className="navbar-trigger-chevron" aria-hidden="true" size={15} />
                </button>

                {isOpen && (
                  <div className="navbar-submenu" role="menu">
                    <div className="navbar-submenu-header">
                      <span>{menu.eyebrow}</span>
                      <strong>{menu.title}</strong>
                    </div>

                    <div className="navbar-submenu-links">
                      {subjects.map((subject) => {
                        const SubjectIcon = subject.Icon;
                        return (
                          <button
                            className={`navbar-subitem navbar-subitem--${subject.slug}`}
                            key={subject.slug}
                            type="button"
                            role="menuitem"
                            onClick={() => openResource(menu.path, subject.slug)}
                          >
                            <span className="navbar-subitem-icon">
                              <SubjectIcon aria-hidden="true" size={20} strokeWidth={1.9} />
                            </span>
                            <span className="navbar-subitem-copy">
                              <strong>{subject.name}</strong>
                              <small>{subject.description}</small>
                            </span>
                            <ArrowRight className="navbar-subitem-arrow" aria-hidden="true" size={17} />
                          </button>
                        );
                      })}
                    </div>

                    <button
                      className="navbar-submenu-footer"
                      type="button"
                      onClick={() => {
                        navigate('/free-vce-resources');
                        setOpenMenu(null);
                      }}
                    >
                      Browse all free VCE resources
                      <ArrowRight aria-hidden="true" size={16} />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="navbar-right">
        {!isLoggedIn ? (
          <button
            className="navbar-button"
            onClick={() => navigate('/login')}
            onMouseEnter={() => prefetchAuth('login')}
            onFocus={() => prefetchAuth('login')}
            onTouchStart={() => prefetchAuth('login')}
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
