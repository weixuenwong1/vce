import { Link, useLocation } from 'react-router-dom';
import { useSession } from '../utils/session';
import '../styles/SignInGate.scss';

export default function SignInGate({ resource = 'this resource' }) {
  const location = useLocation();
  const isAuthenticated = useSession();

  if (isAuthenticated) {
    return (
      <aside className="sign-in-gate" aria-labelledby="sign-in-gate-title">
        <p className="sign-in-gate__eyebrow">Membership required</p>
        <h2 id="sign-in-gate-title">Unlock this subject</h2>
        <p>Choose Self Study or Supported to access the complete {resource}.</p>
        <Link className="sign-in-gate__button" to="/go-pro#plans">
          Compare plans
        </Link>
      </aside>
    );
  }

  return (
    <aside className="sign-in-gate" aria-labelledby="sign-in-gate-title">
      <p className="sign-in-gate__eyebrow">Free preview complete</p>
      <h2 id="sign-in-gate-title">Continue with Chuba</h2>
      <p>Sign in to access your membership, or compare plans to unlock the complete {resource}.</p>
      <Link
        className="sign-in-gate__button"
        to="/login"
        state={{ reason: 'auth-required', from: location }}
      >
        Sign in to continue
      </Link>
      <p className="sign-in-gate__register">
        New to Chuba? <Link to="/go-pro#plans">Compare plans</Link>
      </p>
    </aside>
  );
}
