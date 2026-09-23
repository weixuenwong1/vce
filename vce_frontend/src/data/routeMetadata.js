import { getTopicName } from './resourceCatalog.js';

export const homeTitle = 'VCE Science Resources | Physics, Chemistry & Biology | Chuba';
export const homeDescription = 'Explore VCE Physics, Chemistry and Biology Units 3 and 4 resources: topic summaries, practice questions with solutions and practice SACs on Chuba.';

export const subjectNames = {
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
};

export const sectionNames = {
  summaries: 'Summaries',
  practice: 'Practice Questions',
  'practice-sac': 'Practice SACs',
};

const namedPages = {
  '/how-to-use-chuba': 'How to Use Chuba',
  '/go-pro': 'Go Pro',
  '/refer-friends': 'Refer Friends',
  '/login': 'Sign In',
  '/register': 'Register',
  '/privacy-policy': 'Privacy Policy',
  '/terms-of-service': 'Terms of Service',
};

export function normalisePath(pathname) {
  return pathname.replace(/\/+$/, '') || '/';
}

export function getRouteMetadata(pathname) {
  const path = normalisePath(pathname);
  const [, section, subject, chapterSlug, topicSlug] = path.split('/');
  const publicSubject = Boolean(subjectNames[subject] && sectionNames[section] && !chapterSlug);
  const topicName = getTopicName(subject, chapterSlug, topicSlug);
  const publicTopic = Boolean(
    subjectNames[subject]
    && topicName
    && ['summaries', 'practice'].includes(section)
  );

  let title = homeTitle;
  let description = homeDescription;

  if (publicTopic) {
    if (section === 'summaries') {
      title = `VCE ${subjectNames[subject]} ${topicName} Summary | Chuba`;
      description = `Preview a VCE ${subjectNames[subject]} Units 3 and 4 summary of ${topicName}. Review key concepts, then sign in to continue studying on Chuba.`;
    } else {
      title = `VCE ${subjectNames[subject]} ${topicName} Practice Questions | Chuba`;
      description = `Try free VCE ${subjectNames[subject]} Units 3 and 4 ${topicName} practice questions with worked solutions, then sign in to continue.`;
    }
  } else if (publicSubject) {
    title = `VCE ${subjectNames[subject]} Units 3/4 ${sectionNames[section]} | Chuba`;
    const descriptions = {
      summaries: `Revise VCE ${subjectNames[subject]} Units 3 and 4 with chapter and topic summaries. Review key concepts and explanations for your SAC and exam preparation.`,
      practice: `Explore VCE ${subjectNames[subject]} Units 3 and 4 practice questions with worked solutions. Practise by topic and build your confidence for SACs and exams.`,
      'practice-sac': `Prepare with VCE ${subjectNames[subject]} Units 3 and 4 practice SACs. Work through chapter-based questions and review your understanding before assessments.`,
    };
    description = descriptions[section];
  } else if (path === '/how-to-use-chuba') {
    title = 'How to Use Chuba VCE Resources | Science Study Guide';
    description = 'Plan your VCE Physics, Chemistry and Biology revision with Chuba. Explore Units 3 and 4 summaries, practice questions and practice SACs by subject.';
  } else if (path !== '/') {
    const name = namedPages[path];
    title = `${name || 'Chuba Resources'} | Chuba`;
    description = name ? `${name} on Chuba, the VCE science resource platform.` : homeDescription;
  }

  const indexable = path === '/'
    || publicSubject
    || publicTopic
    || ['/how-to-use-chuba', '/privacy-policy', '/terms-of-service'].includes(path);

  return {
    path,
    title,
    description,
    indexable,
    publicSubject,
    publicTopic,
    section,
    subject,
    chapterSlug,
    topicSlug,
    topicName,
  };
}
