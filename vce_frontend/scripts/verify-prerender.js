import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'parse5';
import { getRouteMetadata } from '../src/data/routeMetadata.js';
import { publicRouteEntries } from './public-routes.js';

const distDirectory = path.resolve('dist');

function findAll(node, predicate, matches = []) {
  if (predicate(node)) matches.push(node);
  for (const child of node.childNodes || []) findAll(child, predicate, matches);
  return matches;
}

const getAttribute = (node, name) => node.attrs?.find((attribute) => attribute.name === name)?.value;

function textContent(node) {
  if (node.nodeName === '#text') return node.value;
  return (node.childNodes || []).map(textContent).join('');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(publicRouteEntries.length === 98, `Expected 98 public routes, found ${publicRouteEntries.length}.`);

for (const { path: routePath } of publicRouteEntries) {
  const metadata = getRouteMetadata(routePath);
  const outputDirectory = routePath === '/'
    ? distDirectory
    : path.join(distDirectory, ...routePath.slice(1).split('/'));
  const outputFile = path.join(outputDirectory, 'index.html');
  const html = await readFile(outputFile, 'utf8');
  const document = parse(html);
  const context = `Route ${routePath}`;
  const titles = findAll(document, (node) => node.tagName === 'title');
  const descriptions = findAll(document, (node) =>
    node.tagName === 'meta' && getAttribute(node, 'name') === 'description'
  );
  const robots = findAll(document, (node) =>
    node.tagName === 'meta' && getAttribute(node, 'name') === 'robots'
  );
  const canonicals = findAll(document, (node) =>
    node.tagName === 'link' && getAttribute(node, 'rel') === 'canonical'
  );
  const roots = findAll(document, (node) =>
    node.tagName === 'div' && getAttribute(node, 'id') === 'root'
  );
  const headings = findAll(document, (node) => node.tagName === 'h1');
  const internalLinks = findAll(document, (node) =>
    node.tagName === 'a' && getAttribute(node, 'href')?.startsWith('/')
  );
  const moduleScripts = findAll(document, (node) =>
    node.tagName === 'script' && getAttribute(node, 'type') === 'module'
  );

  assert(titles.length === 1 && textContent(titles[0]) === metadata.title, `${context}: incorrect title.`);
  assert(descriptions.length === 1 && getAttribute(descriptions[0], 'content') === metadata.description, `${context}: incorrect description.`);
  assert(robots.length === 1 && getAttribute(robots[0], 'content') === 'index, follow', `${context}: incorrect robots directive.`);
  assert(canonicals.length === 1 && getAttribute(canonicals[0], 'href') === `https://chuba.io${metadata.path}`, `${context}: incorrect canonical URL.`);
  assert(roots.length === 1 && textContent(roots[0]).trim().length > 100, `${context}: missing static page content.`);
  assert(headings.length === 1, `${context}: expected one H1.`);
  assert(internalLinks.length > 0, `${context}: missing internal links.`);
  assert(moduleScripts.length > 0, `${context}: missing application script.`);

  await Promise.all([
    access(`${outputFile}.gz`),
    access(`${outputFile}.br`),
  ]);
}

console.log(`Verified ${publicRouteEntries.length} pre-rendered public routes.`);
