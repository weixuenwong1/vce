import { SitemapStream, streamToPromise } from 'sitemap'
import { createWriteStream } from 'fs'
import process from 'node:process'
import { publicRouteEntries } from './public-routes.js'

const hostname = 'https://chuba.io'


const links = publicRouteEntries.map(({ path, ...options }) => ({ url: path, ...options }))

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
