import AxiosInstance from "./AxiosInstance"
import {React, useEffect, useState} from 'react'
import Card from "./Card";
import { HelpCircle } from 'lucide-react';

const Home = () => {

    const PhysicsSummaryUrl = "https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/PhysicsSummaryCard.png" 
    const PhysicsPracticeUrl = "https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/PhysicsPracticeCard.png" 
    const PhysicsSACUrl = "https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/PhysicsSacCard.png" 
    const HeroImage = "https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/ChubaNormalDistCurve1.2.png"
    return(
      <div className="homepage-container">

      <div className="hero-section">
        <div className="hero-left">
          <h1>Chuba</h1>
          <h2>
            Simplify your SAC and exam preparation
          </h2>
          <p>Your all-in-one platform for VCE success.</p>
        </div>
        <div className="hero-right">
          <img src={HeroImage} alt="hero-visual" />
        </div>
      </div>

      <section className="features-section">
        <h3>Everything You Need to Succeed</h3>
        <div className="why-chuba"> 
          <h4>
            Access thousands of exam-style questions with realistic mark allocations and detailed solutions.
          </h4>
          <div className="pill-container">
            <span className="pill">Visual Explanations</span>
            <span className="pill">Curated Summaries</span>
            <span className="pill">All in One Place</span>
          </div>
        </div>
      </section>

      <section>
        <div className="card-section">
          <h3 className = "subject-heading">🧪 Chemistry 3/4 </h3>
          <div className="card-container">
            <Card
              image={PhysicsSummaryUrl}
              title="Physics Summaries"
              description="Master concepts with curated summaries 
                           and step-by-step explanations of exam-style 
                           questions."
              link="/chapters/physics"
            />
            <Card
              image={PhysicsPracticeUrl}
              title="Physics Practice"
              description="Practice from beginner-friendly questions
                           to exam-style problems with full model solutions."
              link="/practice/physics"
            />
            <Card
              image={PhysicsSACUrl}
              title="Physics Practice SACs"
              description="Experience realistic SAC simulations to test your
                           understanding under exam conditions."
              link="/practice-sac/physics"
            />
          </div>
        </div>
      
        <div className="card-section">
          <h3 className = "subject-heading">🚀 Physics 3/4</h3>
          <div className="card-container">
            <Card
              image={PhysicsSummaryUrl}
              title="Physics Summaries"
              description="Master concepts with curated summaries 
                           and step-by-step explanations of exam-style 
                           questions."
              link="/chapters/physics"
            />
            <Card
              image={PhysicsPracticeUrl}
              title="Physics Practice"
              description="Practice from beginner-friendly questions
                           to exam-style problems with full model solutions."
              link="/practice/physics"
            />
            <Card
              image={PhysicsSACUrl}
              title="Physics Practice SACs"
              description="Experience realistic SAC simulations to test your
                           understanding under exam conditions."
              link="/practice-sac/physics"
            />
          </div>
        </div>

        <div className="card-section">
          <h3 className = "subject-heading">🧬 Biology 3/4 </h3>
           <p className="coming-soon">Great things take time ⏳ Coming soon!</p>
        </div>
      </section>
      
      <section className="features">
        <h3>The Essentials In One Place</h3>
        <div className="features-grid">
          <div className="feature-card"> 
            <p><strong>Practice Questions</strong><br /> Step-by-step, exam-style questions.</p>
          </div>
          <div className="feature-card">
            <p><strong>Topic Summaries</strong><br /> Concise guides reinforcing key concepts.</p>
          </div>
          <div className="feature-card">
            <p><strong>Practice SACs</strong><br /> Simulate school-assessed coursework.</p>
          </div>
          <div className="feature-card">
            <p><strong>Worked Examples</strong><br /> Explanations for tricky problems.</p>
          </div>
          <div className="feature-card">
            <p><strong>Exam-like Marks</strong><br /> Mimic real SAC and exam conditions.</p>
          </div>
          <div className="feature-card">
            <p><strong>Images & Diagrams</strong><br /> High-quality visuals for clarity.</p>
          </div>
        </div>
        <a href="how-to-use-chuba">
          <button className="using-chuba">How to Use Chuba Effectively</button>
      </a>
      </section>
      

      <hr className="divider" />

      {/* About Chuba */}
      <section className="about-section">
        <span className="question-circle">
          <HelpCircle size={24} />
        </span>
        <h3>About Chuba</h3>
        <p>
          Chuba's mission is to help all students master their subjects by providing the best resources in one place — making studying easier, more structured and more effective.        </p>
        <p>
            I started Chuba to make <strong>high-quality resources free and accessible</strong> for all students. With rising costs of tutoring and study materials, I wanted to bridge that gap and help everyone succeed.        </p>
        </section>

    </div>
    )
}

export default Home