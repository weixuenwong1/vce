import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  PenLine,
} from 'lucide-react';
import '../styles/Home.scss';
import SubjectSection from "../components/SubjectSelection";
import SubjectData from "../data/SubjectData";
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="homepage-container">
      <div className="hero-section">
        <div className="hero-left">
          <h1>Chuba</h1>
          <div className="hero-resource-intro">
            <span className="hero-resource-kicker">VCE Units 3 &amp; 4</span>
            <h2>Free VCE Science Resources</h2>
            <p>
              Exam-focused summaries, practice questions and practice SACs
              for Physics, Chemistry and Biology.
            </p>
            <div className="hero-resource-subjects" aria-label="Available VCE subjects">
              <span className="hero-resource-subject hero-resource-subject--physics">Physics</span>
              <span className="hero-resource-subject hero-resource-subject--chemistry">Chemistry</span>
              <span className="hero-resource-subject hero-resource-subject--biology">Biology</span>
            </div>
            <Link className="free-resources-hero-link" to="/free-vce-resources">
              Browse free resources
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
            Choose a subject, review a concise summary, then practise with
            targeted questions and SACs when you are ready.
          </p>
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
            Move from topic review to SAC-style practice with a clear next step
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

      <section className="about-chuba" aria-labelledby="about-chuba-title">
        <div className="about-chuba__copy">
          <span className="section-kicker">Why Chuba exists</span>
          <h2 id="about-chuba-title">VCE science resources should be easier to access.</h2>
          <p>
            Chuba gives VCE students one focused place to revise Physics,
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
