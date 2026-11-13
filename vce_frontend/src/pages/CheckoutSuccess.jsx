import { useEffect, useState } from 'react';
import { Check, Clock3 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import AxiosInstance from '../utils/AxiosInstance';
import {
  GOOGLE_ADS_CONSENT_EVENT,
  trackGoogleAdsPurchase,
} from '../utils/googleAds';
import '../styles/CheckoutSuccess.scss';

const referralsEnabled = import.meta.env.VITE_REFERRALS_ENABLED === 'true';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState({ status: 'loading' });

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setResult({ status: 'error' });
      return;
    }

    AxiosInstance.get('api/billing/checkout-status/', {
      params: { session_id: sessionId },
      suppressGlobalError: true,
    })
      .then(({ data }) => setResult(data))
      .catch(() => setResult({ status: 'error' }));
  }, [searchParams]);

  useEffect(() => {
    if (!result.conversion) return undefined;
    const sendPurchase = () => trackGoogleAdsPurchase(result.conversion);
    sendPurchase();
    window.addEventListener(GOOGLE_ADS_CONSENT_EVENT, sendPurchase);
    return () => window.removeEventListener(GOOGLE_ADS_CONSENT_EVENT, sendPurchase);
  }, [result.conversion]);

  const isActive = result.status === 'active';
  const isProcessing = result.status === 'processing' || result.status === 'loading';

  return (
    <div className="checkout-result-page">
      <main className="checkout-result-panel" aria-live="polite">
        <span className={`checkout-result-icon${isActive ? ' is-active' : ''}`}>
          {isActive ? <Check aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
        </span>
        <p className="checkout-result-kicker">CHUBA MEMBERSHIP</p>
        <h1>
          {isActive && 'You are ready to study.'}
          {isProcessing && 'Confirming your membership.'}
          {result.status === 'error' && 'We could not verify this checkout.'}
        </h1>
        <p>
          {isActive
            ? 'Your payment was confirmed and your Chuba membership is now active.'
            : 'Stripe may still be finalising the payment. Your access will update automatically once it is confirmed.'}
        </p>
        <div className="checkout-result-actions">
          <Link to="/">Go home</Link>
          {isActive && referralsEnabled && (
            <Link className="is-secondary" to="/refer-friends">Refer a friend</Link>
          )}
        </div>
      </main>
    </div>
  );
};

export default CheckoutSuccess;
