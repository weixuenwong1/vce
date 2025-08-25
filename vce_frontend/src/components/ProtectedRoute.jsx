import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function isTokenValid() {
  const token = localStorage.getItem("Token");
  const expiry = localStorage.getItem("TokenExpiry");
  if (!token || !expiry) return false;

  const now = Date.now();
  const expMs = Date.parse(expiry);
  const LEEWAY_MS = 30_000;
  const valid = Number.isFinite(expMs) && (now + LEEWAY_MS) < expMs;

  if (!valid) {
    localStorage.removeItem("Token");
    localStorage.removeItem("TokenExpiry");
  }
  return valid;
}

export default function ProtectedRoute() {
  const location = useLocation();
  const navigate = useNavigate();

  const authed = isTokenValid();

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