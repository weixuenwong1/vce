import { Link } from 'react-router-dom';
import { resourceSectionContent, subjectHubContent } from '../data/subjectHubContent';
import '../styles/SubjectHubGuide.scss';

const resourceLinks = {
  summaries: { path: 'summaries', label: 'summaries' },
  practice: { path: 'practice', label: 'practice questions' },
  'practice-sac': { path: 'practice-sac', label: 'practice SACs' },
};

export default function SubjectHubGuide({ subject, section }) {
  const subjectContent = subjectHubContent[subject];
  const sectionContent = resourceSectionContent[section];

  if (!subjectContent || !sectionContent) return null;

  const relatedResources = Object.entries(resourceLinks)
    .filter(([key]) => key !== section);

  return (
    <section className={`subject-hub-guide subject-hub-guide--${subject}`}>
      <div className="subject-hub-guide__overview">
        <p className="subject-hub-guide__eyebrow">Free VCE {subjectContent.name} resources</p>
        <h2>{sectionContent.heading}</h2>
        <p>
          {sectionContent.description} This collection covers {subjectContent.coverage} for
          VCE {subjectContent.name} Units 3 and 4.
        </p>
      </div>

      <aside className="subject-hub-guide__tip">
        <h3>{subjectContent.name} study tip</h3>
        <p>{subjectContent.studyTip}</p>
      </aside>

      <nav className="subject-hub-guide__links" aria-label={`Related VCE ${subjectContent.name} resources`}>
        <span>Continue with:</span>
        {relatedResources.map(([, resource]) => (
          <Link to={`/${resource.path}/${subject}`} key={resource.path}>
            {subjectContent.name} {resource.label}
          </Link>
        ))}
        <Link to="/free-vce-resources">All free VCE resources</Link>
      </nav>
    </section>
  );
}
