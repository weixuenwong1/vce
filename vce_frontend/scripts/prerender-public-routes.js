import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { brotliCompress, constants, gzip } from 'node:zlib';
import { parse, parseFragment, serialize } from 'parse5';
import { getRouteMetadata } from '../src/data/routeMetadata.js';
import { getPrerenderContent, publicRouteEntries } from './public-routes.js';

const distDirectory = path.resolve('dist');
const template = await readFile(path.join(distDirectory, 'index.html'), 'utf8');
const gzipAsync = promisify(gzip);
const brotliCompressAsync = promisify(brotliCompress);

const prerenderStyles = `
  <style id="prerender-styles">
    .prerender-shell{box-sizing:border-box;min-height:100vh;padding:3rem max(1.25rem,8vw);background:#2e2e2e;color:#fff;font-family:Arial,sans-serif;line-height:1.65}
    .prerender-shell>*{max-width:1050px;margin-left:auto;margin-right:auto}
    .prerender-shell h1,.prerender-shell h2{color:#ffd180;line-height:1.25}
    .prerender-shell section{margin:2rem auto}
    .prerender-links{padding-left:1.25rem}
    .prerender-shell a{color:#8bd9ee}
  </style>`;

function findElement(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.childNodes || []) {
    const match = findElement(child, predicate);
    if (match) return match;
  }
  return null;
}

const getAttribute = (node, name) => node.attrs?.find((attribute) => attribute.name === name)?.value;

function setAttribute(node, name, value) {
  const attribute = node.attrs?.find((item) => item.name === name);
  if (attribute) {
    attribute.value = value;
  } else {
    node.attrs = [...(node.attrs || []), { name, value }];
  }
}

function appendFragment(parent, html) {
  const fragment = parseFragment(html);
  for (const child of fragment.childNodes) child.parentNode = parent;
  parent.childNodes.push(...fragment.childNodes);
}

function setMeta(document, attributeName, attributeValue, content) {
  let element = findElement(document, (node) =>
    node.tagName === 'meta' && getAttribute(node, attributeName) === attributeValue
  );
  if (!element) {
    const head = findElement(document, (node) => node.tagName === 'head');
    appendFragment(head, `<meta ${attributeName}="${attributeValue}">`);
    element = head.childNodes.at(-1);
  }
  setAttribute(element, 'content', content);
}

function renderRoute(pathname) {
  const metadata = getRouteMetadata(pathname);
  const document = parse(template);
  const head = findElement(document, (node) => node.tagName === 'head');
  const title = findElement(document, (node) => node.tagName === 'title');
  const root = findElement(document, (node) => node.tagName === 'div' && getAttribute(node, 'id') === 'root');

  title.childNodes = [{ nodeName: '#text', value: metadata.title, parentNode: title }];
  setMeta(document, 'name', 'description', metadata.description);
  setMeta(document, 'name', 'robots', metadata.indexable ? 'index, follow' : 'noindex, follow');
  setMeta(document, 'property', 'og:title', metadata.title);
  setMeta(document, 'property', 'og:description', metadata.description);
  setMeta(document, 'property', 'og:url', `https://chuba.io${metadata.path}`);

  appendFragment(head, `<link rel="canonical" href="https://chuba.io${metadata.path}">`);
  appendFragment(head, prerenderStyles);

  const content = parseFragment(getPrerenderContent(metadata.path));
  for (const child of content.childNodes) child.parentNode = root;
  root.childNodes = content.childNodes;

  return serialize(document);
}

for (const { path: routePath } of publicRouteEntries) {
  const outputDirectory = routePath === '/'
    ? distDirectory
    : path.join(distDirectory, ...routePath.slice(1).split('/'));
  const outputFile = path.join(outputDirectory, 'index.html');
  const html = renderRoute(routePath);
  const [gzipHtml, brotliHtml] = await Promise.all([
    gzipAsync(html),
    brotliCompressAsync(html, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    }),
  ]);

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(outputFile, html),
    writeFile(`${outputFile}.gz`, gzipHtml),
    writeFile(`${outputFile}.br`, brotliHtml),
  ]);
}

console.log(`Pre-rendered ${publicRouteEntries.length} public routes.`);
