import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  CircleHelp,
  Gift,
  MessagesSquare,
  Users,
} from 'lucide-react';
import '../styles/GoPro.scss';
import { useReferralOffer } from '../utils/referrals';

const referralsEnabled = import.meta.env.VITE_REFERRALS_ENABLED === 'true';

const plans = [
  {
    id: 'complete',
    eyebrow: 'Independent study',
    name: 'Chuba Self Study',
    description: 'Every Chuba resource for students who want to study at their own pace.',
    price: '$19',
    cadence: 'per month',
    alternativePrice: '$149 per year',
    annualPrice: 149,
    priceDetail: 'for one VCE science subject',
    icon: BookOpenCheck,
    features: [
      'All resources for your chosen VCE science subject',
      'Access to thousands of practice questions and worked solutions',
      'Access to every topic summary and practice SAC written by tutors who achieved raw 50 study scores',
    ],
    cta: 'Choose Self Study',
  },
  {
    id: 'supported',
    eyebrow: 'Guided study',
    name: 'Chuba Supported',
    description: 'Resources plus personal help when a question or explanation does not click.',
    price: '$35',
    cadence: 'per month',
    alternativePrice: '$279 per year',
    annualPrice: 279,
    priceDetail: 'for one VCE science subject',
    icon: MessagesSquare,
    features: [
      'Everything included in Chuba Self Study',
      'Unlimited support from Chuba tutors',
      'Detailed written guidance tailored to your questions',
      'A two-business-day response target',
    ],
    cta: 'Choose Supported',
  },
  {
    id: 'tutoring',
    eyebrow: 'Live learning',
    name: 'Chuba Tutoring',
    description: 'Focused live teaching with complete resources and support between lessons.',
    price: '$50',
    cadence: 'per lesson',
    priceDetail: 'resources and unlimited support included',
    icon: Users,
    features: [
      'All Self Study resources for your enrolled subject',
      'Unlimited support between lessons',
      'Live tutoring in small groups',
      'SAC preparation and exam revision sessions',
    ],
    cta: 'Ask about tutoring',
  },
];

const GoPro = () => {
  const location = useLocation();
  const referralOffer = useReferralOffer(location.search);

  return (
    <div className="membership-page">
    <header className="membership-hero">
      <div className="membership-shell">
        <p className="membership-kicker">CHUBA 2027 PLANS</p>
        <h1>Everything you need to prepare for VCE science.</h1>
        <p className="membership-hero-copy">
          Build confidence in VCE Physics, Chemistry and Biology 3/4 with complete resources,
          personal question support or structured small-group tutoring.
        </p>

        <div className="membership-subjects" aria-label="Subjects included">
          <span className="membership-subject membership-subject--physics">Physics</span>
          <span className="membership-subject membership-subject--chemistry">Chemistry</span>
          <span className="membership-subject membership-subject--biology">Biology</span>
        </div>

        <a className="membership-hero-link" href="#plans">
          Compare plans
          <ArrowRight size={18} aria-hidden="true" />
        </a>
        {referralOffer?.eligible && (
          <p className="membership-referral-applied">
            Referral offer applied to 12 months of Self Study or Supported access.
          </p>
        )}
      </div>
    </header>

    <main>
      <section className="membership-plans" id="plans" aria-labelledby="plans-title">
        <div className="membership-shell">
          <div className="membership-section-heading">
            <div>
              <p className="membership-kicker">FIND YOUR FIT</p>
              <h2 id="plans-title">Find the Chuba plan that fits your study</h2>
            </div>
            <p>
              Start with independent study, add direct support, or build a weekly routine
              with a small group.
            </p>
          </div>

          <div className="membership-plan-grid">
            {plans.map((plan) => {
              const Icon = plan.icon;

              return (
                <article
                  className={`membership-plan${plan.featured ? ' membership-plan--featured' : ''}`}
                  key={plan.id}
                >
                  {plan.featured && <span className="membership-plan-badge">Most popular</span>}
                  <div className="membership-plan-heading">
                    <span className="membership-plan-icon" aria-hidden="true">
                      <Icon size={24} />
                    </span>
                    <p>{plan.eyebrow}</p>
                    <h3>{plan.name}</h3>
                    <span>{plan.description}</span>
                  </div>

                  <div className="membership-plan-price">
                    <div className="membership-plan-price-primary">
                      <strong>{plan.price}</strong>
                      <span>{plan.cadence}</span>
                    </div>
                    {plan.alternativePrice && (
                      <p>
                        <span>or</span>{' '}
                        {referralOffer?.eligible ? (
                          <><s>${plan.annualPrice}</s> <b>${plan.annualPrice - Number(referralOffer.discounts?.[plan.id === 'complete' ? 'self-study' : plan.id] || 0)} per year</b></>
                        ) : plan.alternativePrice}
                      </p>
                    )}
                    <small>{plan.priceDetail}</small>
                  </div>

                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Check size={17} aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.id === 'tutoring' ? (
                    <Link className="membership-plan-cta" to="/tutoring">
                      {plan.cta}
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  ) : (
                    <Link
                      className="membership-plan-cta"
                      to={`/choose-plan/${plan.id === 'complete' ? 'self-study' : plan.id}`}
                    >
                      {plan.cta}
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  )}
                </article>
              );
            })}
          </div>

          <p className="membership-pricing-note">
            Prices are in AUD and apply per subject. Annual plans include 12 months of access.
            Tutoring is billed per lesson. Registering interest does not require payment.
          </p>
        </div>
      </section>

      {referralsEnabled && (
        <section className="membership-referral" aria-labelledby="referral-title">
          <div className="membership-shell membership-referral-layout">
            <span className="membership-referral-icon" aria-hidden="true">
              <Gift size={26} />
            </span>
            <div>
              <p className="membership-kicker">REFER A FRIEND</p>
              <h2 id="referral-title">Refer a friend. You both benefit.</h2>
              <p>
                Refer a new Chuba user to 12 months of resource access or tutoring.
                Resource members receive a plan-based reward, while tutoring referrals
                receive one free lesson each.
              </p>
            </div>
            <Link to="/refer-friends" className="membership-secondary-cta">
              See referral offer
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}

      <section className="membership-decision" aria-labelledby="decision-title">
        <div className="membership-shell membership-decision-layout">
          <div>
            <p className="membership-kicker">A SIMPLE DECISION</p>
            <h2 id="decision-title">Choose based on how you learn.</h2>
          </div>

          <div className="membership-decision-list">
            <div>
              <BookOpenCheck size={22} aria-hidden="true" />
              <p><strong>Self Study</strong> if you are comfortable studying independently.</p>
            </div>
            <div>
              <CircleHelp size={22} aria-hidden="true" />
              <p><strong>Supported</strong> if you sometimes need a clear explanation.</p>
            </div>
            <div>
              <Users size={22} aria-hidden="true" />
              <p><strong>Tutoring</strong> if structure and live teaching keep you moving.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="membership-final-cta">
        <div className="membership-shell membership-final-cta-layout">
          <div>
            <p className="membership-kicker">NOT READY TO CHOOSE?</p>
            <h2>Explore Chuba before deciding.</h2>
            <p>
              Use the free subject resources first and see how Chuba fits into your study routine.
            </p>
          </div>
          <Link to="/free-vce-resources" className="membership-secondary-cta">
            Browse free resources
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
    </div>
  );
};

export default GoPro;
