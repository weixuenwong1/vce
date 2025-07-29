import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.scss';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-wrapper">
      <h1 className="error-code">404</h1>
      <h2 className="error-title">Page Not Found</h2>
      <hr className="divider2" />
      <p className="error-message">
        Looks like you've wandered off the syllabus 📚
      </p>
      <button onClick={() => navigate('/')} className="home-button">
        Take me home
      </button>
    </div>
  );
};

export default NotFound;
