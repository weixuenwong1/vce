const CONSENT_KEY = 'chuba-google-ads-consent';

export const GOOGLE_ADS_CONSENT_EVENT = 'chuba:google-ads-consent';
export const GOOGLE_ADS_PREFERENCES_EVENT = 'chuba:open-google-ads-preferences';

const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID?.trim();
const purchaseLabel = import.meta.env.VITE_GOOGLE_ADS_PURCHASE_LABEL?.trim();

export const googleAdsIsConfigured = Boolean(googleAdsId && purchaseLabel);

export const getGoogleAdsConsent = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(CONSENT_KEY);
};

const consentParameters = (state) => ({
  ad_storage: state,
  analytics_storage: state,
  ad_user_data: state,
  ad_personalization: 'denied',
});

const ensureDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
};

export const setGoogleAdsConsent = (consent) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CONSENT_KEY, consent);
  if (window.gtag) {
    window.gtag('consent', 'update', consentParameters(
      consent === 'granted' ? 'granted' : 'denied',
    ));
  }
  window.dispatchEvent(new CustomEvent(GOOGLE_ADS_CONSENT_EVENT, {
    detail: consent,
  }));
};

export const initialiseGoogleAds = () => {
  if (
    typeof window === 'undefined'
    || !googleAdsIsConfigured
    || getGoogleAdsConsent() !== 'granted'
  ) return false;

  ensureDataLayer();
  if (!window.__chubaGoogleAdsInitialised) {
    window.gtag('consent', 'default', consentParameters('granted'));
    window.gtag('js', new Date());
    window.gtag('config', googleAdsId);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAdsId)}`;
    script.dataset.chubaGoogleAds = 'true';
    document.head.appendChild(script);
    window.__chubaGoogleAdsInitialised = true;
  }
  return true;
};

export const trackGoogleAdsPurchase = ({ transaction_id, value, currency }) => {
  if (!transaction_id || !Number.isFinite(Number(value)) || !currency) return false;
  if (!initialiseGoogleAds()) return false;

  window.gtag('event', 'conversion', {
    send_to: `${googleAdsId}/${purchaseLabel}`,
    value: Number(value),
    currency: String(currency).toUpperCase(),
    transaction_id: String(transaction_id),
  });
  return true;
};
