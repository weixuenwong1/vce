import { HelpCircle } from 'lucide-react';
import '../styles/Home.scss';
import SubjectSection from "../components/SubjectSelection";
import SubjectData from "../data/SubjectData";
import FeaturesData from "../data/FeaturesData";
import FeatureCard from "../components/FeatureCard";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <div className="hero-section">
        <div className="hero-left">
          <h1>Chuba</h1>
          <h2>Simplify your SAC and exam preparation</h2>
          <p>The ultimate resource-platform for VCE success.</p>
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
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      </div>

      <section className="features-section">
        <h3>Everything You Need to Succeed</h3>
        <div className="why-chuba">
          <h4>
            Thousands of exam-style questions with visuals and detailed solutions.
          </h4>
          <div className="pill-container">
            <span className="pill">Concise Summaries</span>
            <span className="pill">Practice Questions</span>
            <span className="pill">Practice SACs</span>
          </div>
        </div>
      </section>

      <section>
        {SubjectData.map((subject, index) => (
          <SubjectSection
            key={index}
            emoji={subject.emoji}
            title={subject.title} 
            cards={subject.cards}
          />
        ))}

        <div className="card-section">
          <h3 className="subject-heading">🧬 Biology 3/4 </h3>
          <p className="coming-soon">Great things take time ⏳ Coming soon!</p>
        </div>
      </section>

      <section className="features">
        <h3>The Essentials In One Place</h3>
        <div className="features-grid">
          {FeaturesData.map((feature, index) => (
            <FeatureCard
              key={index}
              Icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
        <button className="using-chuba" onClick={() => navigate('/how-to-use-chuba')}>
          How to Use Chuba Effectively
        </button>
      </section>

      <hr className="divider" />

      <section className="about-section">
        <span className="question-circle">
          <HelpCircle size={24} />
        </span>
        <h3>About Chuba</h3>
        <p>
          Chuba's mission is to help all students master their subjects by providing the best resources all in one place.
        </p>
        <p>
          I started Chuba to make <strong>high-quality resources free and accessible</strong> for all students. With rising costs of tutoring and study materials, I wanted to bridge that gap and help everyone succeed.
        </p>
      </section>

      <section className="domain-section">
        <p className="decorative-domains">Inspired by vcetextbooks.xyz &nbsp;|&nbsp; vce.rocks</p>
        <p>Thank you for providing amazing resources over the years.</p>
      </section>
    </div>
  );
};

export default Home;
