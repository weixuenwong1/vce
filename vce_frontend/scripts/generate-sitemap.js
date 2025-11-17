import { SitemapStream, streamToPromise } from 'sitemap'
import { createWriteStream } from 'fs'

const hostname = 'https://chuba.io'


const links = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/login', changefreq: 'monthly', priority: 0.5 },
  { url: '/register', changefreq: 'monthly', priority: 0.5 },

  { url: '/summaries/physics', changefreq: 'weekly', priority: 0.8 },
  { url: '/summaries/chemistry', changefreq: 'weekly', priority: 0.8 },
//   { url: '/summaries/biology', changefreq: 'weekly', priority: 0.8 },

  { url: '/practice/physics', changefreq: 'weekly', priority: 0.9 },
  { url: '/practice/chemistry', changefreq: 'weekly', priority: 0.9 },
//   { url: '/practice/biology', changefreq: 'weekly', priority: 0.9 },

  { url: '/practice-sac/physics', changefreq: 'weekly', priority: 0.7 },
  { url: '/practice-sac/chemistry', changefreq: 'weekly', priority: 0.7 },
//   { url: '/practice-sac/biology', changefreq: 'weekly', priority: 0.7 },

  { url: '/how-to-use-chuba', changefreq: 'monthly', priority: 0.6 }
]

// ------------------------------------

async function generate() {
  const sitemapStream = new SitemapStream({ hostname })
  const writeStream = createWriteStream('./dist/sitemap.xml')

  sitemapStream.pipe(writeStream)

  links.forEach(link => sitemapStream.write(link))
  sitemapStream.end()

  await streamToPromise(sitemapStream)
  console.log('✅ Sitemap created at dist/sitemap.xml')
}

generate().catch(err => {
  console.error('❌ Failed to generate sitemap:', err)
  process.exit(1)
})
