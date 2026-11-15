import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Mail, Quote, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import AxiosInstance from '../utils/AxiosInstance';
import '../styles/Tutoring.scss';

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  subject: 'physics',
  year_level: 'Year 12',
  preferred_format: 'small_group',
  goals: '',
  availability: '',
  website: '',
};

const studentResults = [
  {
    name: 'Kevin J',
    scores: [{ score: '46', subject: 'Physics' }],
    quote: 'Chuba and Wayne were honestly a massive help throughout Year 12. He explained difficult concepts in a way that was much easier to understand than what I was used to in class. The lessons were always really helpful, especially leading up to SACs. Would definitely recommend!',
  },
  {
    name: 'X. W',
    scores: [
      { score: '50', subject: 'Physics' },
      { score: '47', subject: 'Chemistry' },
    ],
    quote: 'Really happy with my experience with Chuba tutoring! They knew exactly what to focus on for SACs and exams, and we went through heaps of relevant practice questions together without wasting time or effort. The feedback was always detailed and definitely helped boost my confidence going into exams.',
  },
  {
    name: 'Emily C',
    scores: [
      { score: '50', subject: 'Biology' },
      { score: '50', subject: 'Chemistry' },
    ],
    quote: "What I liked most about Chuba was how patient and supportive my tutor was. They always made sure I properly understood something before moving on and were happy to explain things multiple times. What helped most was the guidance on which areas to focus on, as there were so many areas in Chemistry 3/4 and I wasn't sure which were most important.",
  },
  {
    name: 'Emma',
    scores: [{ score: '44', subject: 'Biology' }],
    quote: "Chuba tutoring helped me improve so much throughout the year. My tutor was really knowledgeable about the VCE study design and gave me lots of useful tips for answering exam-style questions. I went from struggling with certain topics to feeling much more confident in my SACs. Couldn't recommend them enough!",
  },
];

const Tutoring = () => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const submitInterest = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { first_name, last_name, ...enquiry } = form;
      await AxiosInstance.post(
        'api/tutoring-interest/',
        {
          ...enquiry,
          student_name: `${first_name} ${last_name}`.trim(),
        },
        {
          timeout: 45000,
          suppressGlobalError: true,
        },
      );
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (requestError) {
      const responseData = requestError?.response?.data;
      const firstMessage = responseData && typeof responseData === 'object'
        ? Object.values(responseData).flat().find(Boolean)
        : null;
      const timedOut = requestError?.code === 'ECONNABORTED';
      setError(timedOut
        ? 'Your enquiry is taking longer than expected. Check your email before submitting again, or email support@chuba.io.'
        : (typeof firstMessage === 'string'
          ? firstMessage
          : 'We could not send your enquiry. Please try again or email support@chuba.io.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="tutoring-page tutoring-page--confirmation">
        <main className="tutoring-confirmation">
          <span className="tutoring-confirmation-icon" aria-hidden="true">
            <Check size={34} />
          </span>
          <p className="tutoring-kicker">ENQUIRY RECEIVED</p>
          <h1>Thanks, {form.first_name}.</h1>
          <p>
            Your enquiry is confirmed. We will review your goals and availability, then
            reply to <strong>{form.email}</strong> within two business days.
          </p>
          <div className="tutoring-confirmation-next">
            <span>What happens next</span>
            <ol>
              <li>We check availability for your subject.</li>
              <li>We contact you to confirm the best tutoring format.</li>
              <li>If it is a good fit, we organise your first lesson.</li>
            </ol>
          </div>
          <Link to="/go-pro" className="tutoring-outline-button">
            <ArrowLeft size={17} aria-hidden="true" />
            Back to plans
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="tutoring-page">
      <header className="tutoring-hero">
        <div className="tutoring-shell tutoring-hero-nav">
          <Link to="/go-pro#plans" className="tutoring-back-button">
            <ArrowLeft size={17} aria-hidden="true" />
            View all plans
          </Link>
        </div>
        <div className="tutoring-shell tutoring-hero-layout">
          <div>
            <p className="tutoring-kicker">CHUBA TUTORING</p>
            <h1>Tell us where you need support.</h1>
            <p className="tutoring-hero-copy">
              Share what you are studying and where you are getting stuck. We will review
              your enquiry and help you find the right next step.
            </p>
          </div>
          <aside className="tutoring-offer" aria-label="Tutoring offer">
            <span><Users size={24} aria-hidden="true" /></span>
            <div>
              <strong>$50</strong>
              <small>per lesson</small>
            </div>
            <ul>
              <li><Check size={16} /> Live tutoring in small groups</li>
              <li><Check size={16} /> All Chuba resources included</li>
              <li><Check size={16} /> Unlimited support between lessons</li>
            </ul>
          </aside>
        </div>
      </header>

      <main className="tutoring-main">
        <div className="tutoring-shell tutoring-form-layout">
          <section className="tutoring-form-intro">
            <p className="tutoring-kicker">REGISTER YOUR INTEREST</p>
            <h2>Help us understand what would be useful.</h2>
            <p>
              This is an enquiry, not a booking. No payment is taken and you are not
              committing to lessons.
            </p>
            <div className="tutoring-response-note">
              <Mail size={20} aria-hidden="true" />
              <p><strong>Email first.</strong> We aim to respond within two business days.</p>
            </div>
          </section>

          <form className="tutoring-form" onSubmit={submitInterest}>
            <fieldset>
              <legend>1. About you</legend>
              <div className="tutoring-field-grid">
                <label>
                  <span>First name</span>
                  <input name="first_name" value={form.first_name} onChange={updateField} required maxLength="75" autoComplete="given-name" />
                </label>
                <label>
                  <span>Last name</span>
                  <input name="last_name" value={form.last_name} onChange={updateField} required maxLength="75" autoComplete="family-name" />
                </label>
                <label>
                  <span>Year level</span>
                  <select name="year_level" value={form.year_level} onChange={updateField}>
                    <option>Year 11</option>
                    <option>Year 12</option>
                  </select>
                </label>
                <label>
                  <span>Subject</span>
                  <select name="subject" value={form.subject} onChange={updateField}>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="biology">Biology</option>
                  </select>
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>2. What you need</legend>
              <div className="tutoring-field-grid">
                <label>
                  <span>Preferred format</span>
                  <select name="preferred_format" value={form.preferred_format} onChange={updateField}>
                    <option value="small_group">Small group</option>
                    <option value="individual">Individual</option>
                    <option value="unsure">Not sure yet</option>
                  </select>
                </label>
                <label>
                  <span>General availability</span>
                  <input name="availability" value={form.availability} onChange={updateField} required maxLength="500" placeholder="e.g. Weekdays after 5 pm" />
                </label>
              </div>
              <label className="tutoring-field-wide">
                <span>What would you like help with?</span>
                <textarea name="goals" value={form.goals} onChange={updateField} required maxLength="1500" rows="5" placeholder="Tell us the topics, assessments or study habits you would like to work on." />
                <small>{form.goals.length}/1500</small>
              </label>
            </fieldset>

            <fieldset>
              <legend>3. Contact details</legend>
              <div className="tutoring-field-grid">
                <label>
                  <span>Phone</span>
                  <input type="tel" name="phone" value={form.phone} onChange={updateField} required maxLength="40" autoComplete="tel" />
                </label>
                <label>
                  <span>Email</span>
                  <input type="email" name="email" value={form.email} onChange={updateField} required autoComplete="email" />
                </label>
              </div>
              <label className="tutoring-honeypot" aria-hidden="true">
                Website
                <input name="website" value={form.website} onChange={updateField} tabIndex="-1" autoComplete="off" />
              </label>
            </fieldset>

            {error && <p className="tutoring-error" role="alert">{error}</p>}

            <button className="tutoring-submit" type="submit" disabled={submitting}>
              {submitting ? 'Sending enquiry...' : 'Send tutoring enquiry'}
              {!submitting && <ArrowRight size={18} aria-hidden="true" />}
            </button>
            <p className="tutoring-privacy">
              We use these details only to respond to your tutoring enquiry. See our{' '}
              <Link to="/privacy-policy">privacy policy</Link>.
            </p>
          </form>
        </div>
      </main>

      <section className="tutoring-results" aria-labelledby="tutoring-results-title">
        <div className="tutoring-shell">
          <div className="tutoring-results-heading">
            <div>
              <p className="tutoring-kicker">STUDENT RESULTS</p>
              <h2 id="tutoring-results-title">Verified Student Results</h2>
            </div>
            <p>
              Study scores and reflections from students supported through Chuba tutoring.
              Individual outcomes vary.
            </p>
          </div>

          <div className="tutoring-results-grid">
            {studentResults.map((student) => (
              <article className="tutoring-result" key={student.name}>
                <div className="tutoring-result-header">
                  <h3>{student.name}</h3>
                  <div className="tutoring-result-scores">
                    {student.scores.map((result) => (
                      <div key={`${result.score}-${result.subject}`}>
                        <strong>{result.score}</strong>
                        <span>{result.subject}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Quote size={23} aria-hidden="true" />
                <blockquote>{student.quote}</blockquote>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tutoring;
