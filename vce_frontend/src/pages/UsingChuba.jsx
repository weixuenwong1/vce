import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/UsingChuba.scss';

const HowToUseChuba = () => {
  return (
    <div className="how-to-use-chuba" style={{ padding: '1.5rem' }}>
      <div className="use-chuba-container">
        <h1>How to Use Chuba's VCE Resources</h1>

        <p className="use-chuba-description">
          Explore Chuba's VCE science resources for Physics, Chemistry and Biology Units 3 and 4.
          Use topic summaries to review a concept, practice questions to apply it, and practice SACs
          to bring your revision together before an assessment.
        </p>
        <p>
          Start with the topic you are studying at school. Work through the resources below alongside
          your textbook and your teacher's guidance, then return to any ideas you find difficult.
        </p>

        <div className="use-chuba-section-heading">
          <div className="emoji-circle">📚</div>
          <h2>1. Review with VCE Subject Summaries</h2>
        </div>
        <p className="resource-links">
          Choose your subject: <Link to="/summaries/physics">VCE Physics summaries</Link>,{' '}
          <Link to="/summaries/chemistry">VCE Chemistry summaries</Link> or{' '}
          <Link to="/summaries/biology">VCE Biology summaries</Link>.
          {' '}Find the chapter you are revising and use its topic explanations to check your understanding.
        </p>
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
          Unlike Physics, where a cheat sheet is allowed, Chemistry 3/4 requires a fair amount of memorisation like the processes, definitions, and tiny little details. The examinable content is also much broader than Physics, so while some concepts naturally stick through practice, you won’t always have the luxury of reinforcing everything through repeated questions. So, you’ll need a balance of both understanding and memorising.
        </li>
        </ul>

        <span className="use-chuba-pill biology">🧬 Biology</span>
        <ul>
        <li>
          When using summaries, avoid just rereading. Convert dot points into simple diagrams (even rough sketches). Then redraw them later without looking. If you can recreate a diagram from memory, you understand the idea rather than just memorising it.

          Use colour with a purpose. Assign colours to specific structures, molecules, or components and keep that colour-coding consistent across topics.
        </li>

        <li>
          If two things interact (for example receptor–ligand, enzyme–substrate, antigen–antibody), make them visually match using similar colours, shapes, or lock-and-key style drawings. This makes relationships clearer at a glance.

          Sometimes learning slightly beyond the VCE level can make ideas feel more logical, as long as you can still translate that understanding back into VCE-style wording for exams.
        </li>
        </ul>

        <div className="use-chuba-section-heading">
          <div className="emoji-circle">✍️</div>
          <h2>2. Apply Your Knowledge with VCE Practice Questions</h2>
        </div>
        <p className="resource-links">
          Put your revision into practice with <Link to="/practice/physics">VCE Physics practice questions</Link>,{' '}
          <Link to="/practice/chemistry">VCE Chemistry practice questions</Link> or{' '}
          <Link to="/practice/biology">VCE Biology practice questions</Link>.
          {' '}Attempt each question before reading the solution, then compare your reasoning and working.
        </p>
        
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
        <span className="use-chuba-pill chemistry">🧪 Chemistry</span>
        <ul>
        <li>
          Calculation questions are generally a bit simpler than written explanation questions. They can get a little tedious at times, but focus on pulling out key ideas from sample responses that help build the components of your own response.
        </li>

        <li>
          Make sure you’re comfortable with the data book, know what information is provided, what isn’t and which details you’ll need to memorise.
        </li>
        </ul>

        <div className="use-chuba-section-heading">
          <div className="emoji-circle">📝</div>
        <h2>3. Prepare with VCE Practice SACs</h2>
        </div>
        <p className="resource-links">
          Ready to combine several ideas? Browse <Link to="/practice-sac/physics">VCE Physics practice SACs</Link>,{' '}
          <Link to="/practice-sac/chemistry">VCE Chemistry practice SACs</Link> or{' '}
          <Link to="/practice-sac/biology">VCE Biology practice SACs</Link>.
          {' '}Choose a chapter that matches your current revision and review your answers afterwards.
        </p>
        <p>
          When getting closer to SAC time, try a chapter-based practice SAC with a mix of questions.
          Use it to identify which concepts you can apply independently and which need more revision.
        </p>
        <p>
          Try a timed attempt using the duration and mark allocation your teacher recommends for your assessment.
          Leave time to check calculations and written explanations.
        </p>
        <p>
          Your school's SAC structure may differ. Chuba's practice SACs are revision resources,
          not replicas of your school's assessments or official VCAA papers.
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
        <span className="use-chuba-pill chemistry">🧪 Chemistry</span>
        <ul>
        <li>
          Although most SACs will contain questions that will test main ideas of the topic, many of them will also include some niche questions which can be approached by generalising similar / simpler problems that you've seen before.
        </li>
        <li>
          So although there can be a few questions very specific to the context, you should try and generalise the observation / processes of pervious problems instead of trying to remember every single individual component as being separate and independent. 
        </li>
        </ul>
      </div>
    </div>
  );
};

export default HowToUseChuba;
