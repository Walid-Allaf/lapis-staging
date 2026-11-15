import assert from 'node:assert/strict';
import fs from 'node:fs';
export const legacyEvidence = JSON.parse(fs.readFileSync(new URL('./fixtures/legacy-content-shapes.json', import.meta.url), 'utf8'));

// Structural profiles are evidence of shapes, not invented historical payload values.
export function matchesShape(value, shape, allowExtras = []) {
  if (typeof shape === 'string') {
    if (shape === 'null') return value === null;
    if (shape.startsWith('string(date-time')) return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?$/.test(value);
    return typeof value === shape;
  }
  if (shape && Object.hasOwn(shape, 'array')) return Array.isArray(value) && value.every(item => shape.array.some(variant => matchesShape(item, variant, allowExtras)));
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.keys(shape).every(key => Object.hasOwn(value, key) && matchesShape(value[key], shape[key], allowExtras)) &&
    Object.keys(value).every(key => Object.hasOwn(shape, key) || allowExtras.includes(key));
}
export function assertLegacyProfile(label, value, allowExtras = []) {
  const profile = legacyEvidence.profiles.find(profile => profile.label === label);
  assert.ok(profile, 'A retained structural observation must exist');
  assert.ok(matchesShape(value, profile.shape, allowExtras), `Response does not match structural evidence: ${label}`);
}
