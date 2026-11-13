import { useEffect, useState } from 'react';
import AxiosInstance from './AxiosInstance';
import { useSession } from './session';

const REFERRAL_CODE_KEY = 'chuba-referral-code';

export function normalizeReferralCode(value) {
  return String(value || '').trim().toUpperCase();
}

export function getReferralCode() {
  return normalizeReferralCode(sessionStorage.getItem(REFERRAL_CODE_KEY));
}

export function rememberReferralCode(value) {
  const code = normalizeReferralCode(value);
  if (code) sessionStorage.setItem(REFERRAL_CODE_KEY, code);
  return code;
}

export function referralCodeFromSearch(search) {
  return normalizeReferralCode(new URLSearchParams(search).get('ref'));
}

export function useReferralOffer(search = '') {
  const isAuthenticated = useSession();
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    const queryCode = referralCodeFromSearch(search);
    const code = queryCode ? rememberReferralCode(queryCode) : getReferralCode();
    if (!code && !isAuthenticated) {
      setOffer(null);
      return undefined;
    }

    let cancelled = false;
    AxiosInstance.get('api/billing/referral-offer/', {
      params: code ? { code } : undefined,
      suppressGlobalError: true,
    })
      .then(({ data }) => {
        if (!cancelled) setOffer(data);
      })
      .catch(() => {
        if (!cancelled) setOffer(null);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, search]);

  return offer;
}
