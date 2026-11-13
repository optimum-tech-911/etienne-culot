import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// dist is the hand-edited website source. This validator only reads it.
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(project, 'dist');
const errors = [];
const files = [];
const relative = file => path.relative(project, file).split(path.sep).join('/');
const privateName = /^(?:\.env(?:\..*)?|\.dev\.vars(?:\..*)?|id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?|credentials(?:\.json)?|service-account(?:[-.].*)?)$/i;
const privateExtension = /\.(?:pem|key|p12|pfx|crt|cer|jks|keystore)$/i;

function inspectTree(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      errors.push(`${relative(file)}: symlinks must not be published.`);
    } else if (entry.name.startsWith('.') || entry.name === 'node_modules' || privateName.test(entry.name) || privateExtension.test(entry.name)) {
      errors.push(`${relative(file)}: local, hidden, or credential files must not be published.`);
    } else if (entry.isDirectory()) {
      inspectTree(file);
    } else if (entry.isFile()) {
      files.push(file);
    } else {
      errors.push(`${relative(file)}: unsupported public file type.`);
    }
  }
}

function checkReference(source, raw, line) {
  const reference = raw.trim();
  if (!reference || reference.startsWith('#') || reference.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(reference)) return;
  let pathname;
  try {
    pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  } catch {
    errors.push(`${relative(source)}:${line}: invalid URL encoding in local reference.`);
    return;
  }
  const target = pathname.startsWith('/')
    ? path.resolve(publicRoot, '.' + pathname)
    : path.resolve(path.dirname(source), pathname);
  const inside = path.relative(publicRoot, target);
  if (inside === '..' || inside.startsWith('..' + path.sep) || path.isAbsolute(inside)) {
    errors.push(`${relative(source)}:${line}: local reference points outside dist.`);
  } else if (!fs.existsSync(target)) {
    errors.push(`${relative(source)}:${line}: missing local target ${relative(target)}.`);
  }
}

function checkMatches(file, expression) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(expression)) {
    const line = source.slice(0, match.index).split('\n').length;
    checkReference(file, match[1] ?? match[2] ?? match[3], line);
  }
}

try {
  const rootStat = fs.lstatSync(publicRoot);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    errors.push('dist: expected a real directory, not a symlink or file.');
  } else {
    inspectTree(publicRoot);
  }
} catch (error) {
  if (error.code === 'ENOENT') errors.push('dist: public website directory is missing.');
  else throw error;
}

for (const name of ['index.html', 'style.css', 'app.js', 'content.js']) {
  if (!files.includes(path.join(publicRoot, name))) errors.push(`dist/${name}: required website file is missing or unsafe.`);
}

// Intentionally scoped to this site's quoted HTML attributes, CSS url() values,
// and literal JS asset paths; these expressions are not full language parsers.
for (const file of files) {
  if (file.endsWith('.html')) checkMatches(file, /\b(?:src|href)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi);
  if (file.endsWith('.css')) checkMatches(file, /url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)'";]+))\s*\)/gi);
  if (['app.js', 'content.js'].includes(path.basename(file))) checkMatches(file, /["'](assets\/[^"']+)["']/g);
}

if (errors.length) {
  console.error('Static website validation failed:\n' + errors.map(error => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Static website validated: ${files.length} public files; local references and publish exclusions checked.`);
}
