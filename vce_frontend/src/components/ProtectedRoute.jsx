import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSession } from '../utils/session';


export default function ProtectedRoute() {
  const location = useLocation();
  const navigate = useNavigate();

  const authed = useSession();

  useEffect(() => {
    if (!authed) {
      navigate("/login", {
        state: { reason: "auth-required", from: location },
        replace: true,
      });
    }
  }, [authed, location, navigate]);

  return authed ? <Outlet /> : null;
}
