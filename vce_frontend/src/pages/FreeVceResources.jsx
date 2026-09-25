import { BookOpen, ClipboardCheck, PencilLine } from 'lucide-react';
import { createElement } from 'react';
import { Link } from 'react-router-dom';
import '../styles/FreeVceResources.scss';

const subjects = [
  {
    slug: 'physics',
    name: 'Physics',
    className: 'physics',
    description: 'Revise motion, fields, electricity, waves, special relativity and scientific investigations for VCE Physics Units 3 and 4.',
  },
  {
    slug: 'chemistry',
    name: 'Chemistry',
    className: 'chemistry',
    description: 'Study fuels, reaction rates and equilibrium, electrolysis, organic chemistry and instrumental analysis for VCE Chemistry Units 3 and 4.',
  },
  {
    slug: 'biology',
    name: 'Biology',
    className: 'biology',
    description: 'Review nucleic acids, proteins, biochemical pathways, immunity and evolution for VCE Biology Units 3 and 4.',
  },
];

const resourceTypes = [
  {
    path: 'summaries',
    label: 'Topic summaries',
    detail: 'Review key concepts and exam-relevant explanations.',
    Icon: BookOpen,
  },
  {
    path: 'practice',
    label: 'Practice questions',
    detail: 'Apply each topic with questions and worked solutions.',
    Icon: PencilLine,
  },
  {
    path: 'practice-sac',
    label: 'Practice SACs',
    detail: 'Bring chapter concepts together before an assessment.',
    Icon: ClipboardCheck,
  },
];

export default function FreeVceResources() {
  return (
    <div className="free-resources-page">
      <header className="free-resources-intro">
        <p className="free-resources-kicker">Chuba study library</p>
        <h1>Free VCE Resources for Units 3 and 4</h1>
        <p>
          Explore free VCE Physics, Chemistry and Biology resources organised by subject,
          chapter and topic. Use concise summaries to revise, practice questions to apply
          your knowledge, and practice SACs to prepare for assessments.
        </p>
        <nav className="free-resources-jump" aria-label="Jump to a VCE subject">
          {subjects.map((subject) => (
            <a key={subject.slug} href={`#${subject.slug}`}>{subject.name}</a>
          ))}
        </nav>
      </header>

      <main className="free-resources-directory">
        {subjects.map((subject) => (
          <section
            className={`free-subject-section free-subject-section--${subject.className}`}
            id={subject.slug}
            key={subject.slug}
          >
            <div className="free-subject-heading">
              <p>VCE Units 3 and 4</p>
              <h2>Free VCE {subject.name} Resources</h2>
              <span>{subject.description}</span>
            </div>

            <div className="free-resource-links">
              {resourceTypes.map((resource) => (
                <Link to={`/${resource.path}/${subject.slug}`} key={resource.path}>
                  {createElement(resource.Icon, { 'aria-hidden': true, size: 25, strokeWidth: 2 })}
                  <span>
                    <strong>{subject.name} {resource.label}</strong>
                    <small>{resource.detail}</small>
                  </span>
                  <span className="free-resource-arrow" aria-hidden="true">&#8594;</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="free-resources-next-step">
          <h2>Build a VCE revision routine</h2>
          <p>
            Start with the topic being covered at school, review its summary, attempt the
            matching questions without looking at the solution, and then use a practice SAC
            when you are ready to combine several concepts.
          </p>
          <Link to="/how-to-use-chuba">See how to use Chuba effectively</Link>
        </section>
      </main>
    </div>
  );
}
