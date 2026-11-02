import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Library,
  PencilLine,
} from 'lucide-react';
import {
  getSubjectSectionHeading,
  resourceSectionContent,
  subjectHubContent,
} from '../data/subjectHubContent';
import '../styles/SubjectHubGuide.scss';

const resourceLinks = {
  summaries: { path: 'summaries', label: 'Topic summaries', Icon: BookOpen },
  practice: { path: 'practice', label: 'Practice questions', Icon: PencilLine },
  'practice-sac': { path: 'practice-sac', label: 'Practice SACs', Icon: ClipboardCheck },
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
        <h2>{getSubjectSectionHeading(subject, section)}</h2>
        <p>
          {sectionContent.description} This collection covers {subjectContent.coverage} for
          VCE {subjectContent.name} Units 3/4.
        </p>
      </div>

      <aside className="subject-hub-guide__tip">
        <h3>{subjectContent.name} study tip</h3>
        <p>{subjectContent.studyTip}</p>
      </aside>

      <details className="subject-hub-guide__mobile-tip">
        <summary>
          <span>{subjectContent.name} study tip</span>
          <ChevronDown aria-hidden="true" size={18} />
        </summary>
        <p>{subjectContent.studyTip}</p>
      </details>

      <nav className="subject-hub-guide__links" aria-label={`Related VCE ${subjectContent.name} resources`}>
        <span>Continue studying</span>
        <div>
          {relatedResources.map(([, resource]) => {
            const Icon = resource.Icon;
            return (
              <Link to={`/${resource.path}/${subject}`} key={resource.path}>
                <Icon aria-hidden="true" size={19} />
                <strong>{subjectContent.name} {resource.label}</strong>
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
            );
          })}
          <Link to="/free-vce-resources">
            <Library aria-hidden="true" size={19} />
            <strong>All VCE resources</strong>
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </nav>
    </section>
  );
}
