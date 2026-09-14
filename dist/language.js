import german from './language-data.js?v=9fa5f4a45c02';

const normalize = text => text.replace(/\s+/g, ' ').trim();
const reverse = new Map(Object.entries(german).map(([en, de]) => [de, en]));
let language = 'en';
try { language = localStorage.getItem('course-language') === 'de' ? 'de' : 'en'; } catch {}
const requested = new URL(location.href).searchParams.get('lang');
if (requested === 'de' || requested === 'en') language = requested;
const originals = new WeakMap();
const attributes = ['aria-label', 'title', 'alt', 'placeholder'];
const excluded = 'script, style, code, pre, [translate="no"], .language-toggle';

function translate(text) {
  if (german[text]) return german[text];
  let match;
  if ((match = text.match(/^Part 2 \/ (.+)$/))) return `Teil 2 / ${translate(match[1])}`;
  if ((match = text.match(/^Step (\d+) of (\d+)$/))) return `Schritt ${match[1]} von ${match[2]}`;
  if ((match = text.match(/^Show step (\d+)$/))) return `Schritt ${match[1]} anzeigen`;
  if ((match = text.match(/^by (.+)$/))) return 'von ' + match[1].replace(' for ', ' für ');
  if (text.startsWith('REFERENCE: ')) return 'REFERENZ: ' + text.slice(11);
  if ((match = text.match(/^Watch (.+): (.+)$/))) return `${translate(match[1])}: ${translate(match[2])} ansehen`;
  if (text.startsWith('Play reference film: ')) return 'Referenzfilm abspielen: ' + text.slice(21);
  if (text.startsWith('Yes. ')) return 'Ja. ' + translate(text.slice(5));
  if (text.startsWith('Look again. ')) return 'Schau noch einmal hin. ' + translate(text.slice(12));
  return text;
}

function updateValue(node, key, current, write) {
  const stored = originals.get(node) || {};
  let entry = stored[key];
  // Application code may replace text after a mode/step change. Capture that
  // new source; never interpret our own last translation as a new original.
  if (!entry || current !== entry.rendered) {
    const source = reverse.get(normalize(current)) || normalize(current);
    entry = { source, original: current.replace(normalize(current), source) };
    stored[key] = entry;
    originals.set(node, stored);
  }
  const result = language === 'de'
    ? entry.original.replace(entry.source, translate(entry.source)) : entry.original;
  entry.rendered = result;
  if (current !== result) write(result);
}

function visit(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    if (root.parentElement?.closest(excluded) || !normalize(root.data)) return;
    updateValue(root, 'text', root.data, value => { root.data = value; });
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE || root.matches(excluded)) return;
  for (const name of attributes) if (root.hasAttribute(name)) {
    updateValue(root, name, root.getAttribute(name), value => root.setAttribute(name, value));
  }
  for (const child of root.childNodes) visit(child);
}

const button = document.createElement('button');
button.type = 'button';
button.className = 'language-toggle';
button.innerHTML = '<span lang="en">EN</span><span aria-hidden="true">/</span><span lang="de">DE</span>';
document.querySelector('.header-actions')?.prepend(button);

const options = {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:attributes};
const observer = new MutationObserver(records => {
  observer.disconnect();
  const roots = new Set();
  for (const record of records) {
    if (record.type === 'childList') record.addedNodes.forEach(node => roots.add(node));
    else roots.add(record.target);
  }
  for (const root of roots) if (root.isConnected) visit(root);
  observer.observe(document.documentElement, options);
});

function apply() {
  observer.disconnect();
  document.documentElement.lang = language;
  visit(document.documentElement);
  button.dataset.language = language;
  button.setAttribute('aria-label', language === 'en' ? 'Switch to German' : 'Auf Englisch wechseln');
  button.title = language === 'en' ? 'Deutsch' : 'English';
  observer.observe(document.documentElement, options);
}
button.addEventListener('click', () => {
  language = language === 'en' ? 'de' : 'en';
  try { localStorage.setItem('course-language', language); } catch {}
  const url = new URL(location.href);url.searchParams.set('lang', language);
  history.replaceState(history.state, '', url);
  apply();
});
// Preserve the choice between parts even when an embedded page cannot use storage.
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || link.getAttribute('href').startsWith('#')) return;
  const url = new URL(link.href);
  if (url.origin === location.origin && /\/(?:index|foundation)\.html$/.test(url.pathname)) {
    url.searchParams.set('lang', language);link.href = url.href;
  }
});
apply();
