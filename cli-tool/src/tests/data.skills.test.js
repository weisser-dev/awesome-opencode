// tests/data/skills.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { AVAILABLE_SKILLS, DEFAULT_SKILLS } from '../data/skills.js';

describe('AVAILABLE_SKILLS', () => {
  test('has at least 15 skills', () => {
    assert.ok(AVAILABLE_SKILLS.length >= 15, `Expected >= 15 skills, got ${AVAILABLE_SKILLS.length}`);
  });

  test('all skills have required fields', () => {
    for (const skill of AVAILABLE_SKILLS) {
      assert.ok(skill.name, `skill missing name`);
      assert.ok(skill.value, `skill missing value`);
      assert.ok(skill.description, `skill ${skill.value} missing description`);
    }
  });

  test('all values are unique', () => {
    const values = AVAILABLE_SKILLS.map(s => s.value);
    assert.equal(new Set(values).size, values.length, 'Duplicate skill values');
  });

  test('all values match skill name format', () => {
    const regex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    for (const skill of AVAILABLE_SKILLS) {
      assert.ok(regex.test(skill.value), `skill ${skill.value} does not match naming convention`);
    }
  });

  test('known skills exist', () => {
    const values = new Set(AVAILABLE_SKILLS.map(s => s.value));
    for (const v of ['git-release', 'ci-pipeline', 'dependency-audit', 'adr-write', 'pr-review']) {
      assert.ok(values.has(v), `Missing skill: ${v}`);
    }
  });
});

describe('DEFAULT_SKILLS', () => {
  test('is a Set', () => {
    assert.ok(DEFAULT_SKILLS instanceof Set);
  });

  test('all defaults exist in AVAILABLE_SKILLS', () => {
    const values = new Set(AVAILABLE_SKILLS.map(s => s.value));
    for (const d of DEFAULT_SKILLS) {
      assert.ok(values.has(d), `Default skill ${d} not in AVAILABLE_SKILLS`);
    }
  });
});
