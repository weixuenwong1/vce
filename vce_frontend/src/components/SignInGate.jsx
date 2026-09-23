import { Link, useLocation } from 'react-router-dom';
import '../styles/SignInGate.scss';

export default function SignInGate({ resource = 'this resource' }) {
  const location = useLocation();

  return (
    <aside className="sign-in-gate" aria-labelledby="sign-in-gate-title">
      <p className="sign-in-gate__eyebrow">Free preview complete</p>
      <h2 id="sign-in-gate-title">Sign in to keep studying</h2>
      <p>Your free Chuba account unlocks the rest of {resource} and keeps your revision moving.</p>
      <Link
        className="sign-in-gate__button"
        to="/login"
        state={{ reason: 'auth-required', from: location }}
      >
        Sign in to continue
      </Link>
      <p className="sign-in-gate__register">
        New to Chuba? <Link to="/register">Create an account</Link>
      </p>
    </aside>
  );
}
