import { SitemapStream, streamToPromise } from 'sitemap'
import { createWriteStream } from 'fs'

const hostname = 'https://chuba.io'

// ---- Add your app’s routes here ----
const links = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/login', changefreq: 'monthly', priority: 0.5 },
  { url: '/register', changefreq: 'monthly', priority: 0.5 },

  // core Chuba pages:
  { url: '/summaries/physics', changefreq: 'weekly', priority: 0.8 },
  { url: '/summaries/chemistry', changefreq: 'weekly', priority: 0.8 },
//   { url: '/summaries/biology', changefreq: 'weekly', priority: 0.8 },

  { url: '/practice/physics', changefreq: 'weekly', priority: 0.9 },
  { url: '/practice/chemistry', changefreq: 'weekly', priority: 0.9 },
//   { url: '/practice/biology', changefreq: 'weekly', priority: 0.9 },

  { url: '/practice-sac/physics', changefreq: 'weekly', priority: 0.7 },
  { url: '/practice-sac/chemistry', changefreq: 'weekly', priority: 0.7 },
//   { url: '/practice-sac/biology', changefreq: 'weekly', priority: 0.7 },
]

// ------------------------------------

const sitemap = new SitemapStream({ hostname })

streamToPromise(
  sitemap.pipe(createWriteStream('./dist/sitemap.xml'))
).then(() => console.log('✅ Sitemap created at dist/sitemap.xml'))

links.forEach(link => sitemap.write(link))
sitemap.end()
