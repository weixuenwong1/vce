import React from 'react';
import '../styles/UsingChuba.scss';

const HowToUseChuba = () => {
  return (
    <div className="how-to-use-chuba" style={{ padding: '1.5rem' }}>
      <div className="use-chuba-container">
        <h1>🚀 How to Use Chuba Effectively</h1>

        <p className="use-chuba-description">
          Chuba is built to help you study smarter. Each subject is divided into three sections:
        </p>

        <div className="use-chuba-section-heading">
          <div className="emoji-circle">📚</div>
          <h2>1. Summaries</h2>
        </div>
        <p>
          These are your go-to guides when you’re not feeling confident with a concept. They’re intentionally concise and designed to just explain the key ideas that actually matter in exams and the best approach to common exam-style questions.
        </p>
        <p>
          Don’t treat these like a full textbook though, they’re best used alongside your school resources. Use your textbook for the broader picture, then come back to Chuba’s summaries to zoom in on what’s frequently tested and worth mastering.
        </p>
        <p>
          Take your time to read through them, they might feel a little chunky at times but everything included is carefully condensed and genuinely important for building a strong understanding.
        </p>

        <span className="use-chuba-pill physics">🧲 Physics</span>
        <ul>
        <li>
          Focus on understanding how things work, not just memorising formulas. The toughest questions often ask you to explain or justify ideas, not just plug into equations. Practice breaking down devices and linking them to the physics behind them.
        </li>
        <li>
          Also, get good at transposing equations, understanding how one variable affects another is a super common theme in exams.
        </li>
        </ul>

        <span className="use-chuba-pill chemistry">🧪 Chemistry</span>
        <ul>
        <li>
          Build a strong mental model of how particles behave, how reactions shift, and how structure influences properties. Many questions require more than just knowing content — they want your reasoning. The summaries help you develop that.
        </li>
        </ul>

        <div className="use-chuba-section-heading">
          <div className="emoji-circle">✍️</div>
          <h2>2. Practice Questions</h2>
        </div>
        
        <p>
          Once you’ve reviewed a topic, jump into practice questions and don’t just check if your final answer is right, look at the full working out.
        </p>
        <p>
          It's crucial to look at the mark allocation as a guide, it gives you an indication of how much working out you have to show, and how detailed your explanations should be.
        </p>
        <span className="use-chuba-pill physics">🧲 Physics</span>
        <ul>
          <li>
          Questions and equations can get long. Break the calculation into steps, like numerator, denominator, then the final value instead of trying to fit everything in one line. 
          </li>
          <li>
          Use your calculator efficiently and double-check brackets and signs. 
          If you're confident you've entered everything correctly but still get the wrong answer, ask your teacher to help identify where it went wrong.
          </li>
        </ul>

        <div className="use-chuba-section-heading">
          <div className="emoji-circle">📝</div>
        <h2>3. Practice SACs</h2>
        </div>
        <p>
          When getting closer to SAC time, have a go at full Practice SACs. It covers a full area of study with a mix of question styles, giving you a realistic feel of the exam.
        </p>
        <p>
          ⌛ We recommend timing yourself — aim for 1.25 minutes per mark as a rough guide. It helps build pressure tolerance and exam focus.
        </p>
        <p>
          Note that your school structures SACs may be different, however, these are still great to test your understanding under real conditions.
        </p>
        <span className="use-chuba-pill physics">🧲 Physics</span>
        <ul>
          <li>
            Physics questions in SACs and even in your final exam, tend to have very similar questions, since there's only so much variation in how these concepts can be assessed.
          </li>
          <li>
            Most questions rely on the same key formulas and ideas, so your level of understanding on practice questions and SACs is a strong indicator of how you'll do in the real assessments.
          </li>
          <li>
            This is also a good time to practice using your cheat-sheet. 
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HowToUseChuba;
