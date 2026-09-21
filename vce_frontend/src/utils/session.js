import { useSyncExternalStore } from 'react';

const event = 'chuba-session-changed';

export function getSessionToken() {
  const token = localStorage.getItem('Token');
  const expiry = Date.parse(localStorage.getItem('TokenExpiry'));
  return token && Number.isFinite(expiry) && Date.now() + 30000 < expiry ? token : null;
}

export function clearSession() {
  localStorage.removeItem('Token');
  localStorage.removeItem('TokenExpiry');
  window.dispatchEvent(new Event(event));
}

export function setSession(token, expiry) {
  localStorage.setItem('Token', token);
  localStorage.setItem('TokenExpiry', expiry);
  window.dispatchEvent(new Event(event));
}

function subscribe(onChange) {
  const check = () => {
    if (!getSessionToken() && localStorage.getItem('Token')) clearSession();
    onChange();
  };
  window.addEventListener(event, onChange);
  window.addEventListener('storage', check);
  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', check);
  const timer = window.setInterval(check, 30000);
  check();
  return () => {
    window.removeEventListener(event, onChange);
    window.removeEventListener('storage', check);
    window.removeEventListener('focus', check);
    document.removeEventListener('visibilitychange', check);
    window.clearInterval(timer);
  };
}

export function useSession() {
  return Boolean(useSyncExternalStore(subscribe, getSessionToken, () => null));
}
