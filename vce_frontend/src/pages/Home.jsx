import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  PenLine,
  Quote,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import '../styles/Home.scss';
import SubjectSection from "../components/SubjectSelection";
import SubjectData from "../data/SubjectData";
import resourceReviews from '../data/resourceReviews';
import { Link } from 'react-router-dom';
import AxiosInstance from '../utils/AxiosInstance';

const numberFormatter = new Intl.NumberFormat('en-AU');

const AnimatedCounter = ({ value }) => {
  const counterRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const node = counterRef.current;
    if (!node) return undefined;

    let frameId;
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setDisplayValue(value);
        return;
      }

      const startedAt = performance.now();
      const duration = 1600;
      const animate = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - ((1 - progress) ** 3);
        setDisplayValue(Math.round(value * eased));
        if (progress < 1) frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
    }, { threshold: 0.35 });

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [value]);

  return <strong ref={counterRef}>{numberFormatter.format(displayValue)}</strong>;
};

const Home = () => {
  const [impactStats, setImpactStats] = useState({
    questions_attempted: 10000,
    summaries_opened: 1500,
    practice_sacs_attempted: 400,
  });

  useEffect(() => {
    let cancelled = false;
    AxiosInstance.get('api/home-stats/', { suppressGlobalError: true })
      .then(({ data }) => {
        if (!cancelled) {
          setImpactStats({
            questions_attempted: Number(data.questions_attempted) || 10000,
            summaries_opened: Number(data.summaries_opened) || 1500,
            practice_sacs_attempted: Number(data.practice_sacs_attempted) || 400,
          });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="homepage-container">
      <div className="hero-section">
        <div className="hero-left">
          <h1>Chuba</h1>
          <div className="hero-resource-intro">
            <span className="hero-resource-kicker">VCE Units 3 &amp; 4</span>
            <h2>VCE Science Resources</h2>
            <p>
              Topic summaries, practice questions and practice SACs
              for 3/4 Physics, Chemistry and Biology.
            </p>
            <div className="hero-resource-subjects" aria-label="Available VCE subjects">
              <span className="hero-resource-subject hero-resource-subject--physics">Physics</span>
              <span className="hero-resource-subject hero-resource-subject--chemistry">Chemistry</span>
              <span className="hero-resource-subject hero-resource-subject--biology">Biology</span>
            </div>
            <Link className="free-resources-hero-link" to="/free-vce-resources">
              Browse resources
              <ArrowRight aria-hidden="true" size={20} strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <picture>
            <source
              type="image/webp"
              srcSet="
                https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/ChubaHeroImage-320.webp 320w,
                https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/ChubaHeroImage-640.webp 640w,
                https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/ChubaHeroImage-960.webp 960w,
                https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/ChubaHeroImage-1280.webp 1280w,
                https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/ChubaHeroImage-1920.webp 1920w
              "
              sizes="(max-width: 600px) 100vw, (max-width: 1200px) 80vw, 50vw"
            />
            <img
              src="https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/ChubaHeroImage-640.png"
              srcSet="
                https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/ChubaHeroImage-320.png 320w,
                https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/ChubaHeroImage-640.png 640w,
                https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/ChubaHeroImage-960.png 960w,
                https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/ChubaHeroImage-1280.png 1280w,
                https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/ChubaHeroImage-1920.png 1920w
              "
              sizes="(max-width: 600px) 100vw, (max-width: 1200px) 80vw, 50vw"
              alt="Chuba Normal Distribution"
              width="1920"
              height="1080"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
      </div>

      <section className="subject-library" aria-label="VCE science resources by subject">
        <div className="section-intro">
          <span className="section-kicker">Choose a subject</span>
          <h2>Learn at your own pace.</h2>
          <p>
            Review a concise topic summary or practise with exam-style questions,
            then practise SACs when you are ready.
          </p>
        </div>
        <div className="home-impact__metrics" aria-label="Chuba activity totals">
          <article>
            <AnimatedCounter value={impactStats.questions_attempted} />
            <span>Questions attempted</span>
          </article>
          <article>
            <AnimatedCounter value={impactStats.summaries_opened} />
            <span>Summaries opened</span>
          </article>
          <article>
            <AnimatedCounter value={impactStats.practice_sacs_attempted} />
            <span>Practice SACs attempted</span>
          </article>
        </div>
        {SubjectData.map((subject, index) => (
          <SubjectSection
            key={index}
            subject={subject.subject}
            emoji={subject.emoji}
            title={subject.title} 
            cards={subject.cards}
          />
        ))}
      </section>

      <section className="study-system" aria-labelledby="study-system-title">
        <div className="study-system__header">
          <div>
            <span className="section-kicker">A practical study system</span>
            <h2 id="study-system-title">Learn it. Apply it. Prepare with confidence.</h2>
          </div>
          <p>
            Move from topic review to exam-style practice questions with a clear next step
            at every stage.
          </p>
        </div>
        <div className="study-system__steps">
          <article className="study-step">
            <span className="study-step__number">01</span>
            <BookOpenCheck aria-hidden="true" size={27} />
            <h3>Review</h3>
            <p>Build the foundation with concise, topic-by-topic summaries.</p>
          </article>
          <article className="study-step">
            <span className="study-step__number">02</span>
            <PenLine aria-hidden="true" size={27} />
            <h3>Practise</h3>
            <p>Apply each concept with exam-style questions and worked solutions.</p>
          </article>
          <article className="study-step">
            <span className="study-step__number">03</span>
            <ClipboardCheck aria-hidden="true" size={27} />
            <h3>Prepare</h3>
            <p>Bring topics together under realistic practice SAC conditions.</p>
          </article>
        </div>
        <Link className="text-link" to="/how-to-use-chuba">
          See the recommended study approach
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>

      <section className="home-reviews" aria-labelledby="home-reviews-title">
        <div className="home-reviews__header">
          <div>
            <span className="section-kicker">Student reviews</span>
            <h2 id="home-reviews-title">Built for the way VCE students actually study.</h2>
          </div>
          <p>
            Thousands of students use Chuba to revise difficult topics, practise exam-style questions
            and prepare for SACs with more confidence.
          </p>
        </div>

        <div className="home-reviews__grid">
          {resourceReviews.map((review) => (
            <figure
              className={`home-review${review.featured ? ' home-review--featured' : ''}`}
              key={review.name}
            >
              <Quote size={25} aria-hidden="true" />
              <blockquote>{review.quote}</blockquote>
              <figcaption>
                <strong>{review.name}</strong>
                <span>Chuba student</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="about-chuba" aria-labelledby="about-chuba-title">
        <div className="about-chuba__copy">
          <span className="section-kicker">Why Chuba exists</span>
          <h2 id="about-chuba-title">Good VCE resources should be easier to access.</h2>
          <p>
            Chuba gives VCE students one focused place to revise 3/4 Physics,
            Chemistry and Biology, with clear explanations, realistic practice
            and useful worked solutions organised around the course.
          </p>
        </div>
        <div className="about-chuba__facts" aria-label="About Chuba facts">
          <div><CheckCircle2 aria-hidden="true" /><span>Built for VCE Units 3 &amp; 4</span></div>
          <div><CheckCircle2 aria-hidden="true" /><span>Physics, Chemistry and Biology</span></div>
          <div><CheckCircle2 aria-hidden="true" /><span>Organised by chapter and topic</span></div>
          <Link className="about-chuba__link" to="/free-vce-resources">
            Browse the full resource library
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
