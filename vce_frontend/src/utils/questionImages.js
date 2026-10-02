const pendingImages = new Map();

export function getWebpUrl(url) {
  if (typeof url !== 'string') return '';
  return url.replace(/\.png(?=($|[?#]))/i, '.webp');
}

export function getQuestionImageUrls(question, { includeSolutions = false } = {}) {
  if (!question) return [];

  const urls = [];
  for (const order of question.orders || []) {
    if (order.content_type === 'IMAGE' && order.image_content) {
      urls.push(getWebpUrl(order.image_content));
    }

    if (includeSolutions && order.solution?.solution_image) {
      urls.push(getWebpUrl(order.solution.solution_image));
    }
  }

  if (includeSolutions && question.general_solution?.solution_image) {
    urls.push(getWebpUrl(question.general_solution.solution_image));
  }

  return [...new Set(urls.filter(Boolean))];
}

export function preloadImage(url, { highPriority = false } = {}) {
  if (!url || typeof Image === 'undefined') return Promise.resolve();
  if (pendingImages.has(url)) return pendingImages.get(url);

  const request = new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = highPriority ? 'high' : 'auto';

    image.onload = async () => {
      try {
        await image.decode();
      } catch {
        // A loaded image can still render when explicit decoding is unavailable.
      }
      resolve();
    };
    image.onerror = resolve;
    image.src = url;
  });

  pendingImages.set(url, request);
  return request;
}

export function preloadImages(urls, options) {
  return Promise.allSettled(urls.map((url) => preloadImage(url, options)));
}

export async function waitForImages(urls, { timeoutMs = 800, highPriority = true } = {}) {
  if (urls.length === 0) return;

  await Promise.race([
    preloadImages(urls, { highPriority }),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}
