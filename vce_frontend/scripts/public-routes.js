import {
  chapterOrders,
  slugifyResourceName,
  topicOrders,
} from '../src/data/resourceCatalog.js';
import {
  getRouteMetadata,
  sectionNames,
  subjectNames,
} from '../src/data/routeMetadata.js';
import { resourceSectionContent, subjectHubContent } from '../src/data/subjectHubContent.js';

const subjectSlugs = Object.keys(subjectNames);

const topicEntries = Object.entries(topicOrders).flatMap(([subject, chapters]) =>
  Object.entries(chapters).flatMap(([chapterSlug, topics]) =>
    topics.flatMap((topic) => {
      const topicSlug = slugifyResourceName(topic);
      return [
        { path: `/summaries/${subject}/${chapterSlug}/${topicSlug}`, changefreq: 'monthly', priority: 0.7 },
        { path: `/practice/${subject}/${chapterSlug}/${topicSlug}`, changefreq: 'weekly', priority: 0.8 },
      ];
    })
  )
);

export const publicRouteEntries = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/free-vce-resources', changefreq: 'weekly', priority: 0.9 },
  ...subjectSlugs.flatMap((subject) => [
    { path: `/summaries/${subject}`, changefreq: 'weekly', priority: 0.8 },
    { path: `/practice/${subject}`, changefreq: 'weekly', priority: 0.9 },
    { path: `/practice-sac/${subject}`, changefreq: 'weekly', priority: 0.7 },
  ]),
  { path: '/how-to-use-chuba', changefreq: 'monthly', priority: 0.6 },
  ...topicEntries,
];

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const resourceLinks = (subject) => `
  <ul class="prerender-links">
    <li><a href="/summaries/${subject}">VCE ${subjectNames[subject]} summaries</a></li>
    <li><a href="/practice/${subject}">VCE ${subjectNames[subject]} practice questions</a></li>
    <li><a href="/practice-sac/${subject}">VCE ${subjectNames[subject]} practice SACs</a></li>
  </ul>`;

function homeContent() {
  return `
    <main class="prerender-shell">
      <h1>Free VCE Resources</h1>
      <p>Study VCE Physics, Chemistry and Biology Units 3 and 4 with free topic summaries, practice questions, worked solutions and practice SACs.</p>
      <p><a href="/free-vce-resources">Browse all free VCE resources</a></p>
      <nav aria-label="VCE subject resources">
        ${subjectSlugs.map((subject) => `
          <section>
            <h2>VCE ${subjectNames[subject]} Units 3 and 4</h2>
            ${resourceLinks(subject)}
          </section>`).join('')}
      </nav>
      <p><a href="/how-to-use-chuba">Learn how to use Chuba's VCE resources</a></p>
    </main>`;
}

function freeResourcesContent() {
  return `
    <main class="prerender-shell">
      <h1>Free VCE Resources for Units 3 and 4</h1>
      <p>Browse free VCE Physics, Chemistry and Biology summaries, practice questions with worked solutions and practice SACs organised by subject.</p>
      ${subjectSlugs.map((subject) => `
        <section>
          <h2>Free VCE ${subjectNames[subject]} Resources</h2>
          <p>Revise VCE ${subjectNames[subject]} Units 3 and 4 by chapter and topic.</p>
          ${resourceLinks(subject)}
        </section>`).join('')}
      <p><a href="/how-to-use-chuba">Learn how to build a VCE revision routine with Chuba</a></p>
    </main>`;
}

function subjectContent(metadata) {
  const { section, subject } = metadata;
  const subjectName = subjectNames[subject];
  const sectionName = sectionNames[section];
  const details = subjectHubContent[subject];
  const sectionDetails = resourceSectionContent[section];

  const guide = `
    <section>
      <h2>${escapeHtml(sectionDetails.heading)}</h2>
      <p>${escapeHtml(sectionDetails.description)} This collection covers ${escapeHtml(details.coverage)} for VCE ${subjectName} Units 3 and 4.</p>
      <h3>${subjectName} study tip</h3>
      <p>${escapeHtml(details.studyTip)}</p>
    </section>`;

  if (section === 'practice-sac') {
    return `
      <main class="prerender-shell">
        <h1>Free VCE ${subjectName} Units 3/4 Practice SACs</h1>
        <p>Prepare for VCE ${subjectName} Units 3 and 4 SACs with chapter-based practice questions and worked solutions.</p>
        ${guide}
        <section>
          <h2>${subjectName} chapters</h2>
          <ul>${chapterOrders[subject].map((chapter) => `<li>${escapeHtml(chapter)}</li>`).join('')}</ul>
        </section>
        ${resourceLinks(subject)}
        <p><a href="/free-vce-resources">Browse all free VCE resources</a></p>
      </main>`;
  }

  const chapters = Object.entries(topicOrders[subject]);
  return `
    <main class="prerender-shell">
      <h1>Free VCE ${subjectName} Units 3/4 ${sectionName}</h1>
      <p>${escapeHtml(metadata.description)}</p>
      ${guide}
      ${chapters.map(([chapterSlug, topics], index) => `
        <section>
          <h2>${escapeHtml(chapterOrders[subject][index] || chapterSlug.replaceAll('-', ' '))}</h2>
          <ul class="prerender-links">
            ${topics.map((topic) => {
              const topicSlug = slugifyResourceName(topic);
              return `<li><a href="/${section}/${subject}/${chapterSlug}/${topicSlug}">${escapeHtml(topic)} ${section === 'summaries' ? 'summary' : 'practice questions'}</a></li>`;
            }).join('')}
          </ul>
        </section>`).join('')}
      ${resourceLinks(subject)}
      <p><a href="/free-vce-resources">Browse all free VCE resources</a></p>
    </main>`;
}

function topicContent(metadata) {
  const { section, subject, chapterSlug, topicSlug, topicName } = metadata;
  const subjectName = subjectNames[subject];
  const heading = section === 'summaries'
    ? `VCE ${subjectName} ${topicName} Summary`
    : `VCE ${subjectName} ${topicName} Practice Questions`;
  const companionPath = section === 'summaries'
    ? `/practice/${subject}/${chapterSlug}/${topicSlug}`
    : `/summaries/${subject}/${chapterSlug}/${topicSlug}`;
  const companionText = section === 'summaries'
    ? `${topicName} practice questions`
    : `${topicName} summary`;

  return `
    <main class="prerender-shell">
      <article>
        <h1>${escapeHtml(heading)}</h1>
        <p>${escapeHtml(metadata.description)}</p>
        <p>This public preview introduces the VCE Units 3 and 4 topic before students sign in to continue with the complete Chuba resource.</p>
      </article>
      <nav aria-label="Related VCE resources">
        <ul class="prerender-links">
          <li><a href="/${section}/${subject}">All VCE ${subjectName} ${section === 'summaries' ? 'summaries' : 'practice questions'}</a></li>
          <li><a href="${companionPath}">${escapeHtml(companionText)}</a></li>
          <li><a href="/how-to-use-chuba">How to use Chuba's VCE resources</a></li>
        </ul>
      </nav>
    </main>`;
}

function guideContent() {
  return `
    <main class="prerender-shell">
      <h1>How to Use Chuba's VCE Resources</h1>
      <p>Plan your VCE Physics, Chemistry and Biology Units 3 and 4 revision with summaries, topic practice questions and practice SACs.</p>
      ${subjectSlugs.map((subject) => `
        <section>
          <h2>VCE ${subjectNames[subject]} resources</h2>
          ${resourceLinks(subject)}
        </section>`).join('')}
    </main>`;
}

export function getPrerenderContent(pathname) {
  const metadata = getRouteMetadata(pathname);
  if (metadata.path === '/') return homeContent();
  if (metadata.path === '/free-vce-resources') return freeResourcesContent();
  if (metadata.path === '/how-to-use-chuba') return guideContent();
  if (metadata.publicTopic) return topicContent(metadata);
  if (metadata.publicSubject) return subjectContent(metadata);
  return '';
}
