import { CircleAlert, RefreshCw, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import '../styles/ResourceCatalogueError.scss';

export default function ResourceCatalogueError({ onRetry }) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const updateConnection = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    return () => {
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
    };
  }, []);

  const StatusIcon = isOnline ? CircleAlert : WifiOff;

  return (
    <section className="catalogue-error" role="alert" aria-live="assertive">
      <div className="catalogue-error__icon" aria-hidden="true">
        <StatusIcon size={25} strokeWidth={1.8} />
      </div>
      <div className="catalogue-error__copy">
        <p className="catalogue-error__eyebrow">
          {isOnline ? 'Resource library unavailable' : 'You are offline'}
        </p>
        <h2>{isOnline ? 'We could not load these resources.' : 'Reconnect to keep studying.'}</h2>
        <p>
          {isOnline
            ? 'The library did not respond. Try again now, or return in a moment.'
            : 'Check your internet connection, then try loading the library again.'}
        </p>
      </div>
      <button type="button" onClick={onRetry}>
        <RefreshCw aria-hidden="true" size={17} />
        Try again
      </button>
    </section>
  );
}
