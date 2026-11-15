import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

const { sanitizeRichText: clean } = loadTs('lib/sanitize-html.ts');

test('removes executable elements and their contents', () => {
  for (const tag of ['script', 'style', 'iframe', 'object', 'form', 'button', 'textarea', 'select', 'svg', 'math', 'template']) {
    assert.equal(clean(`<p>Before</p><${tag} onload="alert(1)">BAD</${tag}><p>After</p>`), '<p>Before</p><p>After</p>', tag);
  }
  assert.equal(clean('<iframe srcdoc="<script>alert(1)</script>"></iframe>'), '');
  assert.equal(clean('<embed src="bad">'), ''); // embed is an HTML void element.
  assert.equal(clean('<input onfocus=alert(1)><base href="https://evil.test"><meta http-equiv=refresh><link rel=stylesheet href=x>'), '');
});

test('rejects dangerous URLs, event attributes and protocol tricks', () => {
  for (const url of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', 'java\nscript:alert(1)', '&#106;avascript:alert(1)', 'javascript&#58;alert(1)', 'vbscript:bad', 'data:text/html,bad']) {
    assert.equal(clean(`<a href="${url}" onclick="bad()">Link</a>`), '<a>Link</a>', url);
  }
  for (const src of ['x', '//evil.com/x', 'data:image/svg+xml,bad', 'http://evil.test/x', 'javascript:bad']) assert.equal(clean(`<img src="${src}" onerror="bad()">`), '');
  assert.equal(clean('<p id=x class=x style="color:red" data-x=y>Hello</p>'), '<p>Hello</p>');
});

test('keeps safe image and link attributes and hardens new tabs', () => {
  assert.equal(clean('<a href="https://example.com" target="_blank">Link</a>'), '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>');
  assert.equal(clean('<a href="/blog" target="_parent">Link</a>'), '<a href="/blog">Link</a>');
  assert.equal(clean('<img src="https://example.com/image.png" alt="صورة" width="50" height="60" onerror="bad()">'), '<img src="https://example.com/image.png" alt="صورة" width="50" height="60" />');
});

test('preserves benign StarterKit text and elements with documented HTML normalization', () => {
  const benign = '<h1>عنوان</h1><h2>Title</h2><h3>Heading</h3><p>Arabic العربية &amp; <strong>bold</strong> <em>italic</em> <s>strike</s><br />next</p><ul><li>Item</li></ul><ol><li>One</li></ol><blockquote><p>Quote</p></blockquote><pre><code>&lt;safe&gt;</code></pre><hr /><a href="mailto:mail@example.com">Mail</a>';
  assert.equal(clean(benign), benign);
  assert.equal(clean('<p>Text<br>Next &nbsp; &#1575;'), '<p>Text<br />Next   ا</p>');
});

test('repairs malformed nesting and never retains active malformed markup', () => {
  for (const html of ['<p><strong>Test', '<svg><g/onload=bad()>BAD</svg><p>OK', '<IMG SRC=x onerror=bad()>', '<a href="java&#x0a;script:bad"><b>x']) {
    const result = clean(html);
    assert(!/onerror|onload|javascript:|<svg|<script|<iframe/i.test(result), result);
    assert.equal(clean(result), result);
  }
});

test('empty, null and undefined values produce empty strings', () => {
  for (const input of ['', null, undefined]) assert.equal(clean(input), '');
});
