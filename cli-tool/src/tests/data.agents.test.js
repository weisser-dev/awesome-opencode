// tests/data/agents.test.js
// Tests for AVAILABLE_AGENTS, DEFAULT_AGENTS, LANGUAGE_AGENT_MAP

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { AVAILABLE_AGENTS, DEFAULT_AGENTS, LANGUAGE_AGENT_MAP } from '../data/agents.js';

describe('AVAILABLE_AGENTS', () => {
  test('has at least 108 agents', () => {
    assert.ok(AVAILABLE_AGENTS.length >= 108, `Expected >= 108 agents, got ${AVAILABLE_AGENTS.length}`);
  });

  test('all agents have required fields', () => {
    for (const agent of AVAILABLE_AGENTS) {
      assert.ok(agent.name, `agent missing name`);
      assert.ok(agent.value, `agent missing value`);
      assert.ok(agent.description, `agent ${agent.value} missing description`);
      assert.ok(agent.category, `agent ${agent.value} missing category`);
    }
  });

  test('all values are unique', () => {
    const values = AVAILABLE_AGENTS.map(a => a.value);
    const unique = new Set(values);
    assert.equal(unique.size, values.length, 'Duplicate agent values found');
  });

  test('all expected categories present', () => {
    const categories = new Set(AVAILABLE_AGENTS.map(a => a.category));
    const expected = ['Core Development', 'Language Specialists', 'Infrastructure', 'Quality & Security', 'Data & AI', 'Developer Experience', 'Specialized Domains', 'Business & Product', 'Meta & Orchestration', 'Research & Analysis'];
    for (const cat of expected) {
      assert.ok(categories.has(cat), `Missing category: ${cat}`);
    }
  });

  test('known agents exist', () => {
    const values = new Set(AVAILABLE_AGENTS.map(a => a.value));
    const required = ['code-reviewer', 'typescript-pro', 'devops-engineer', 'llm-architect', 'workflow-orchestrator'];
    for (const v of required) {
      assert.ok(values.has(v), `Missing required agent: ${v}`);
    }
  });
});

describe('DEFAULT_AGENTS', () => {
  test('is a Set', () => {
    assert.ok(DEFAULT_AGENTS instanceof Set, 'DEFAULT_AGENTS must be a Set');
  });

  test('all defaults exist in AVAILABLE_AGENTS', () => {
    const values = new Set(AVAILABLE_AGENTS.map(a => a.value));
    for (const d of DEFAULT_AGENTS) {
      assert.ok(values.has(d), `Default agent ${d} not in AVAILABLE_AGENTS`);
    }
  });

  test('contains essential defaults', () => {
    assert.ok(DEFAULT_AGENTS.has('code-reviewer'), 'Must include code-reviewer');
    assert.ok(DEFAULT_AGENTS.has('test-writer'), 'Must include test-writer');
  });
});

describe('LANGUAGE_AGENT_MAP', () => {
  test('all languages have at least one agent', () => {
    for (const [lang, agents] of Object.entries(LANGUAGE_AGENT_MAP)) {
      assert.ok(Array.isArray(agents) && agents.length > 0, `${lang} has no agents`);
    }
  });

  test('all mapped agents exist in AVAILABLE_AGENTS', () => {
    const values = new Set(AVAILABLE_AGENTS.map(a => a.value));
    for (const [lang, agents] of Object.entries(LANGUAGE_AGENT_MAP)) {
      for (const a of agents) {
        assert.ok(values.has(a), `Agent ${a} for language ${lang} not in AVAILABLE_AGENTS`);
      }
    }
  });

  test('covers major languages', () => {
    const langs = Object.keys(LANGUAGE_AGENT_MAP);
    for (const l of ['node', 'python', 'java', 'go', 'rust', 'terraform', 'docker', 'kubernetes']) {
      assert.ok(langs.includes(l), `Missing language mapping: ${l}`);
    }
  });

  test('terraform maps to terraform-engineer', () => {
    assert.ok(LANGUAGE_AGENT_MAP['terraform'].includes('terraform-engineer'), 'terraform should map to terraform-engineer');
  });
});
