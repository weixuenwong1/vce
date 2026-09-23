import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteMetadata } from '../data/routeMetadata';

export default function PageMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const { path, title, description, indexable } = getRouteMetadata(pathname);

    const setMeta = (attribute, key, content) => {
      let node = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!node) {
        node = document.createElement('meta');
        node.setAttribute(attribute, key);
        document.head.appendChild(node);
      }
      node.content = content;
    };
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', `https://chuba.io${path}`);
    setMeta('property', 'og:type', 'website');
    setMeta('name', 'robots', indexable ? 'index, follow' : 'noindex, follow');
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://chuba.io${path}`;
  }, [pathname]);

  return null;
}
