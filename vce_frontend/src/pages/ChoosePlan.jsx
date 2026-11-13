import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  LockKeyhole,
  MessagesSquare,
} from 'lucide-react';
import { useSession } from '../utils/session';
import AxiosInstance from '../utils/AxiosInstance';
import {
  getAnnualSaving,
  getMembershipPrice,
  membershipPlans,
  membershipSubjects,
} from '../data/membershipPlans';
import '../styles/ChoosePlan.scss';
import { getReferralCode, useReferralOffer } from '../utils/referrals';

const PENDING_PLAN_KEY = 'chuba-pending-plan';

const getSavedSelection = (planId) => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(PENDING_PLAN_KEY));
    return saved?.planId === planId ? saved : null;
  } catch {
    return null;
  }
};

const ChoosePlan = () => {
  const { planId } = useParams();
  const plan = membershipPlans[planId];
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSession();
  const referralOffer = useReferralOffer(location.search);
  const savedSelection = useMemo(() => getSavedSelection(planId), [planId]);
  const [subject, setSubject] = useState(savedSelection?.subject || 'physics');
  const [billingCycle, setBillingCycle] = useState(savedSelection?.billingCycle || 'annual');
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    if (!plan) return;
    sessionStorage.setItem(PENDING_PLAN_KEY, JSON.stringify({
      planId,
      subject,
      billingCycle,
    }));
  }, [billingCycle, plan, planId, subject]);

  if (!plan) return <Navigate to="/go-pro#plans" replace />;

  const selectedSubject = membershipSubjects.find((item) => item.id === subject);
  const price = getMembershipPrice(plan, billingCycle);
  const referralDiscount = billingCycle === 'annual' && referralOffer?.eligible
    ? Number(referralOffer.discounts?.[planId] || 0)
    : 0;
  const referralApplied = referralDiscount > 0;
  const checkoutPrice = Math.max(price - referralDiscount, 0);
  const annualSaving = getAnnualSaving(plan);
  const alternatePlan = planId === 'self-study' ? membershipPlans.supported : membershipPlans['self-study'];
  const PlanIcon = planId === 'self-study' ? BookOpenCheck : MessagesSquare;

  const handleContinue = async () => {
    if (!isAuthenticated) {
      navigate('/register', {
        state: {
          from: { pathname: location.pathname },
        },
      });
      return;
    }

    setCheckoutPending(true);
    setCheckoutError('');
    try {
      const { data } = await AxiosInstance.post('api/billing/checkout/', {
        plan: planId,
        subject,
        billing_cycle: billingCycle,
        referral_code: referralOffer?.eligible === false ? '' : getReferralCode(),
      }, { suppressGlobalError: true });
      window.location.assign(data.checkout_url);
    } catch (error) {
      setCheckoutError(
        error.response?.data?.detail
          || 'Secure checkout could not be opened. Please try again.',
      );
      setCheckoutPending(false);
    }
  };

  return (
    <div className="choose-plan-page">
      <header className="choose-plan-header">
        <div className="choose-plan-shell">
          <Link to="/go-pro#plans" className="choose-plan-back">
            <ArrowLeft size={17} aria-hidden="true" />
            View all plans
          </Link>

        </div>
      </header>

      <main className="choose-plan-main">
        <div className="choose-plan-shell choose-plan-layout">
          <section className="choose-plan-config" aria-labelledby="choose-plan-title">
            <p className="choose-plan-kicker">BUILD YOUR PLAN</p>
            <h1 id="choose-plan-title">Choose how you want to study.</h1>
            <p className="choose-plan-intro">
              Select one VCE science subject and the billing option that works for you.
              You can add another subject later.
            </p>

            {referralApplied && (
              <p className="choose-plan-referral-status">
                Referral offer applied. Your annual discount will also appear at Stripe checkout.
              </p>
            )}
            {referralOffer?.message && !referralOffer.eligible && (
              <p className="choose-plan-referral-status choose-plan-referral-status--error">
                {referralOffer.message}
              </p>
            )}

            <fieldset className="choose-plan-fieldset">
              <legend>1. Choose your level of support</legend>
              <div className="choose-plan-plan-options">
                {Object.values(membershipPlans).map((option) => {
                  const Icon = option.id === 'self-study' ? BookOpenCheck : MessagesSquare;
                  const selected = option.id === planId;

                  return (
                    <Link
                      to={`/choose-plan/${option.id}`}
                      className={`choose-plan-plan-option${selected ? ' is-selected' : ''}`}
                      aria-current={selected ? 'page' : undefined}
                      key={option.id}
                    >
                      <Icon size={21} aria-hidden="true" />
                      <span>
                        <strong>{option.shortName}</strong>
                        <small>From A${option.monthlyPrice}/month</small>
                      </span>
                      {selected && <Check size={18} aria-hidden="true" />}
                    </Link>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="choose-plan-fieldset">
              <legend>2. Choose your subject</legend>
              <div className="choose-plan-subjects">
                {membershipSubjects.map((option) => (
                  <label className={`choose-plan-subject choose-plan-subject--${option.id}`} key={option.id}>
                    <input
                      type="radio"
                      name="subject"
                      value={option.id}
                      checked={subject === option.id}
                      onChange={() => setSubject(option.id)}
                    />
                    <span className="choose-plan-subject-swatch" aria-hidden="true" />
                    <span>{option.name}</span>
                    <Check size={17} aria-hidden="true" />
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="choose-plan-fieldset">
              <legend>3. Choose how you pay</legend>
              <div className="choose-plan-billing" role="radiogroup" aria-label="Billing frequency">
                <label>
                  <input
                    type="radio"
                    name="billing-cycle"
                    checked={billingCycle === 'monthly'}
                    onChange={() => setBillingCycle('monthly')}
                  />
                  <span>
                    <strong>Monthly</strong>
                    <small>A${plan.monthlyPrice}/month, billed monthly</small>
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="billing-cycle"
                    checked={billingCycle === 'annual'}
                    onChange={() => setBillingCycle('annual')}
                  />
                  <span>
                    <strong>Annual</strong>
                    <small>
                      {referralOffer?.eligible ? (
                        <><s>A${plan.annualPrice}</s> A${plan.annualPrice - Number(referralOffer.discounts?.[planId] || 0)} for 12 months</>
                      ) : (
                        <>A${plan.annualPrice} for 12 months</>
                      )}
                    </small>
                  </span>
                  <em>
                    {referralOffer?.eligible
                      ? `Referral saves A$${Number(referralOffer.discounts?.[planId] || 0)}`
                      : `Save A$${annualSaving}`}
                  </em>
                </label>
              </div>
            </fieldset>
          </section>

          <aside className="choose-plan-summary" aria-labelledby="plan-summary-title">
            <div className="choose-plan-summary-heading">
              <span><PlanIcon size={23} aria-hidden="true" /></span>
              <div>
                <p>{plan.eyebrow}</p>
                <h2 id="plan-summary-title">{plan.name}</h2>
              </div>
            </div>

            <div className="choose-plan-summary-price">
              {referralApplied && <s>A${price}</s>}
              <strong>A${checkoutPrice}</strong>
              <span>{billingCycle === 'annual' ? 'for 12 months' : 'per month'}</span>
            </div>
            <p className="choose-plan-summary-subject">{selectedSubject.name} · one subject</p>

            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Check size={16} aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="choose-plan-total">
              <span>Due at checkout</span>
              <strong>
                {referralApplied && <s>A${price}</s>}
                A${checkoutPrice}
              </strong>
            </div>

            <button
              type="button"
              className="choose-plan-continue"
              onClick={handleContinue}
              disabled={checkoutPending}
              aria-busy={checkoutPending}
            >
              {checkoutPending
                ? 'Opening secure checkout...'
                : (isAuthenticated ? 'Start now' : 'Create account to continue')}
              <ArrowRight size={18} aria-hidden="true" />
            </button>

            {checkoutError && (
              <p className="choose-plan-checkout-error" role="alert">{checkoutError}</p>
            )}

            {!isAuthenticated && (
              <p className="choose-plan-sign-in">
                Already have an account?{' '}
                <Link to="/login" state={{ from: { pathname: location.pathname } }}>Sign in</Link>
              </p>
            )}

            <p className="choose-plan-secure-note">
              <LockKeyhole size={15} aria-hidden="true" />
              Secure payment handled by Stripe. Payments are non-refundable for change of mind.
            </p>

            <Link className="choose-plan-switch" to={`/choose-plan/${alternatePlan.id}`}>
              Compare with {alternatePlan.shortName}
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ChoosePlan;
