import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.scss';

const Fallback = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-wrapper">
      <h1 className="error-code">500</h1>
      <h2 className="error-title">Woops!</h2>
      <hr className="divider2" />
      <p className="error-message">
        Something went wrong on our end.<br />
        Please try again later.
      </p>
      <button onClick={() => navigate('/')} className="home-button">
        Take me home
      </button>
    </div>
  );
};

export default Fallback;
