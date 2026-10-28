import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = path.join(root, 'src/app');

async function filesIn(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const groups = await Promise.all(entries.map(entry => entry.isDirectory()
      ? filesIn(path.join(directory, entry.name)) : [path.join(directory, entry.name)]));
    return groups.flat();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function pageRoute(file) {
  return '/' + path.relative(app, path.dirname(file)).split(path.sep)
    .filter(part => part && !part.startsWith('(') && !part.startsWith('@')).join('/');
}

const pages = (await filesIn(app)).filter(file => /[/\\]page\.[jt]sx?$/.test(file));
const routes = new Set(pages.map(pageRoute));
const sources = [...await filesIn(path.join(root, 'src/components/shared')),
  ...await filesIn(path.join(root, 'src/components/landing')),
  ...await filesIn(path.join(app, '(public)')),
  path.join(root, 'src/lib/public-navigation.ts')];
const links = new Map();

for (const file of sources.filter(file => /\.[jt]sx?$/.test(file))) {
  let content;
  try { content = await readFile(file, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  function add(node) {
    if (!node || !ts.isStringLiteral(node) || !node.text.startsWith('/') || node.text.startsWith('//')) return;
    const destination = new URL(node.text, 'http://navigation.local').pathname;
    const location = `${path.relative(root, file)}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}`;
    links.set(destination, [...(links.get(destination) ?? []), location]);
  }
  function visit(node) {
    if (ts.isJsxAttribute(node) && node.name.getText(source) === 'href') add(node.initializer);
    if (ts.isPropertyAssignment(node) && node.name.getText(source) === 'href') add(node.initializer);
    if (ts.isArrayLiteralExpression(node) && node.elements.length === 2) add(node.elements[1]);
    ts.forEachChild(node, visit);
  }
  visit(source);
}

let failures = 0;
for (const [destination, locations] of links) {
  if (!routes.has(destination)) {
    failures++;
    console.error(`Missing page: ${destination}\n  ${locations.join('\n  ')}`);
  }
}

const flag = process.argv.indexOf('--base-url');
if (!failures && flag !== -1) {
  const base = process.argv[flag + 1];
  if (!base) throw new Error('Provide a running website URL after --base-url.');
  for (const destination of [...links.keys()].sort()) {
    try {
      const response = await fetch(new URL(destination, base), { signal: AbortSignal.timeout(30000) });
      const html = await response.text();
      if (!response.ok || !/<(?:html|body)\b/i.test(html)) throw new Error(`HTTP ${response.status}, page content unavailable`);
      console.log(`${destination}: HTTP ${response.status}${new URL(response.url).pathname !== destination ? ` -> ${new URL(response.url).pathname}` : ''}`);
    } catch (error) {
      failures++;
      console.error(`${destination}: ${error.message}`);
    }
  }
}

if (failures) {
  console.error(`Public navigation check failed: ${failures} broken destination(s).`);
  process.exitCode = 1;
} else {
  console.log(`Public navigation check passed: ${links.size} destinations have matching pages${flag !== -1 ? ' and respond successfully' : ''}.`);
}
