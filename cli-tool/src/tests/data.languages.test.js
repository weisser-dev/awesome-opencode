// tests/data/languages.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EXTENSION_HINTS, LANGUAGE_OPTIONS, detectFromExtensions } from '../data/languages.js';

describe('EXTENSION_HINTS', () => {
  test('all entries have exts and language or detect', () => {
    for (const hint of EXTENSION_HINTS) {
      assert.ok(Array.isArray(hint.exts) && hint.exts.length > 0, `hint missing exts`);
      assert.ok(hint.language || hint.detect, `hint with exts ${hint.exts} needs language or detect`);
    }
  });

  test('.tf files map to terraform', () => {
    const tfHint = EXTENSION_HINTS.find(h => h.exts.includes('.tf'));
    assert.ok(tfHint, '.tf should have a hint');
    assert.equal(tfHint.language, 'terraform');
  });

  test('.py files map to python', () => {
    const hint = EXTENSION_HINTS.find(h => h.exts.includes('.py'));
    assert.ok(hint, '.py should have a hint');
    assert.equal(hint.language, 'python');
  });

  test('.sol files map to solidity', () => {
    const hint = EXTENSION_HINTS.find(h => h.exts.includes('.sol'));
    assert.ok(hint, '.sol should have a hint');
    assert.equal(hint.language, 'solidity');
  });
});

describe('LANGUAGE_OPTIONS', () => {
  test('has at least 27 options', () => {
    assert.ok(LANGUAGE_OPTIONS.length >= 27, `Expected >= 27 languages, got ${LANGUAGE_OPTIONS.length}`);
  });

  test('all have value and label', () => {
    for (const opt of LANGUAGE_OPTIONS) {
      assert.ok(opt.value, `option missing value`);
      assert.ok(opt.label, `option ${opt.value} missing label`);
    }
  });

  test('all values are unique', () => {
    const values = LANGUAGE_OPTIONS.map(o => o.value);
    assert.equal(new Set(values).size, values.length, 'Duplicate language values');
  });
});

describe('detectFromExtensions', () => {
  test('detects terraform from .tf files', () => {
    const files = ['main.tf', 'variables.tf', 'outputs.tf', 'terraform.tfvars'];
    const results = detectFromExtensions(files);
    assert.ok(results.some(r => r.language === 'terraform'), 'Should detect terraform');
  });

  test('detects node from .ts files', () => {
    const files = ['src/app.ts', 'src/index.ts', 'package.json'];
    const results = detectFromExtensions(files);
    assert.ok(results.some(r => r.language === 'node'), 'Should detect node from .ts');
  });

  test('detects python from .py files', () => {
    const files = ['main.py', 'utils.py', 'requirements.txt'];
    const results = detectFromExtensions(files);
    assert.ok(results.some(r => r.language === 'python'), 'Should detect python');
  });

  test('detects multiple languages', () => {
    const files = ['main.tf', 'script.py', 'app.ts'];
    const results = detectFromExtensions(files);
    assert.ok(results.length >= 2, 'Should detect multiple languages');
  });

  test('returns sorted by count descending', () => {
    const files = ['a.tf', 'b.tf', 'c.tf', 'd.py'];
    const results = detectFromExtensions(files);
    if (results.length >= 2) {
      assert.ok(results[0].count >= results[1].count, 'Should be sorted by count descending');
    }
  });

  test('returns empty for empty file list', () => {
    const results = detectFromExtensions([]);
    assert.deepEqual(results, []);
  });
});
