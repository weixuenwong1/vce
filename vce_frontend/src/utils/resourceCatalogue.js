import { chapterOrders, topicOrders } from '../data/ListOrders';
import AxiosInstance from './AxiosInstance';

const CACHE_DURATION = 15 * 60 * 1000;
const memoryCache = new Map();
const pendingRequests = new Map();

function sortByOrder(items, order, field) {
  return [...items].sort((a, b) => {
    const indexA = order.indexOf(a[field]);
    const indexB = order.indexOf(b[field]);
    return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
  });
}

function normaliseCatalogue(subject, chapters) {
  return sortByOrder(chapters, chapterOrders[subject] || [], 'chapter_name').map((chapter) => ({
    ...chapter,
    topics: sortByOrder(
      chapter.topics || [],
      topicOrders[subject]?.[chapter.slug] || [],
      'topic_name',
    ),
  }));
}

function readSessionCache(subject) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(`chuba-catalogue-${subject}`));
    if (cached && Date.now() - cached.savedAt < CACHE_DURATION) return cached.data;
  } catch {
    // A network request remains available when storage is disabled or stale.
  }
  return null;
}

function writeSessionCache(subject, data) {
  try {
    sessionStorage.setItem(
      `chuba-catalogue-${subject}`,
      JSON.stringify({ savedAt: Date.now(), data }),
    );
  } catch {
    // The in-memory cache still speeds up navigation in this tab.
  }
}

async function getLegacyCatalogue(subject) {
  const { data: chapters } = await AxiosInstance.get('api/chapters/');
  const subjectChapters = chapters.filter(
    (chapter) => chapter.subject?.toLowerCase() === subject,
  );

  return Promise.all(subjectChapters.map(async (chapter) => {
    const { data: topics } = await AxiosInstance.get(`api/chapters/${chapter.slug}/topics/`);
    return { ...chapter, topics };
  }));
}

async function fetchCatalogue(subject) {
  try {
    const { data } = await AxiosInstance.get(`api/catalogue/${subject}/`);
    return data;
  } catch (error) {
    if (error.response?.status !== 404) throw error;
    return getLegacyCatalogue(subject);
  }
}

export async function getResourceCatalogue(subject, { force = false } = {}) {
  if (!force) {
    const cached = memoryCache.get(subject) || readSessionCache(subject);
    if (cached) {
      memoryCache.set(subject, cached);
      return cached;
    }
    if (pendingRequests.has(subject)) return pendingRequests.get(subject);
  }

  const request = fetchCatalogue(subject)
    .then((data) => {
      const catalogue = normaliseCatalogue(subject, data);
      memoryCache.set(subject, catalogue);
      writeSessionCache(subject, catalogue);
      return catalogue;
    })
    .finally(() => pendingRequests.delete(subject));

  pendingRequests.set(subject, request);
  return request;
}
