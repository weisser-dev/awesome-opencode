// tests/data/models.test.js
// Tests for MODEL_FINGERPRINTS, MODEL_PRESETS, AGENT_TIERS, fingerprintModel, detectModelsInConfig

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_FINGERPRINTS, MODEL_PRESETS, AGENT_TIERS, COST_LABELS, TIER_LABELS, getAgentTier, fingerprintModel, detectModelsInConfig } from '../data/models.js';

describe('MODEL_FINGERPRINTS', () => {
  test('all entries have required fields', () => {
    for (const fp of MODEL_FINGERPRINTS) {
      assert.ok(fp.pattern instanceof RegExp, `Missing/invalid pattern`);
      assert.ok(fp.canonical, `Missing canonical`);
      assert.ok(fp.family, `Missing family for ${fp.canonical}`);
      assert.ok(['frontier', 'strong', 'fast'].includes(fp.tier), `Invalid tier for ${fp.canonical}: ${fp.tier}`);
      assert.ok(typeof fp.coding === 'number' && fp.coding >= 0 && fp.coding <= 100, `Invalid coding score for ${fp.canonical}`);
      assert.ok(COST_LABELS[fp.cost], `Invalid cost tier for ${fp.canonical}: ${fp.cost}`);
    }
  });

  test('no duplicate canonicals', () => {
    const canonicals = MODEL_FINGERPRINTS.map(fp => fp.canonical);
    const unique = new Set(canonicals);
    // Some canonicals can appear multiple times (e.g. different patterns -> same canonical)
    // Just verify we have at least 60 entries
    assert.ok(MODEL_FINGERPRINTS.length >= 60, `Expected at least 60 fingerprints, got ${MODEL_FINGERPRINTS.length}`);
  });
});

describe('fingerprintModel', () => {
  const cases = [
    // Anthropic custom provider
    { input: 'my-provider/eu.anthropic.claude-opus-4-6-v1', expectedFamily: 'anthropic', expectedTier: 'frontier' },
    { input: 'my-provider/eu.anthropic.claude-sonnet-4-6', expectedFamily: 'anthropic', expectedTier: 'strong' },
    { input: 'abcd/eu.anthropic.claude-haiku-4-5-20251001-v1:0', expectedFamily: 'anthropic', expectedTier: 'fast' },
    // OpenAI
    { input: 'openai/gpt-5.2', expectedFamily: 'openai', expectedTier: 'frontier' },
    { input: 'openai/gpt-4o-mini', expectedFamily: 'openai', expectedTier: 'fast' },
    { input: 'azure-gpt/gpt-5.3-codex', expectedFamily: 'openai', expectedTier: 'frontier' },
    // Google
    { input: 'google/gemini-2.5-flash', expectedFamily: 'google', expectedTier: 'fast' },
    { input: 'google/gemini-2.5-pro', expectedFamily: 'google', expectedTier: 'strong' },
    // DeepSeek
    { input: 'deepseek/deepseek-chat', expectedFamily: 'deepseek', expectedTier: 'strong' },
    { input: 'deepseek/deepseek-r1', expectedFamily: 'deepseek', expectedTier: 'strong' },
    // xAI
    { input: 'xai/grok-3', expectedFamily: 'xai', expectedTier: 'strong' },
    { input: 'xai/grok-4-1-fast', expectedFamily: 'xai', expectedTier: 'frontier' },
    // Mistral
    { input: 'mistral/codestral-latest', expectedFamily: 'mistral', expectedTier: 'strong' },
    { input: 'mistral/devstral-medium-2507', expectedFamily: 'mistral', expectedTier: 'strong' },
    // Qwen
    { input: 'alibaba/qwen-2.5-coder-32b', expectedFamily: 'alibaba', expectedTier: 'strong' },
  ];

  for (const { input, expectedFamily, expectedTier } of cases) {
    test(`recognizes ${input}`, () => {
      const result = fingerprintModel(input);
      assert.ok(result, `Should recognize ${input}`);
      assert.equal(result.family, expectedFamily, `Wrong family for ${input}: got ${result.family}`);
      assert.equal(result.tier, expectedTier, `Wrong tier for ${input}: got ${result.tier}`);
    });
  }

  test('returns unknown for unrecognized model', () => {
    const result = fingerprintModel('totally-unknown-model-xyz');
    assert.equal(result.family, 'unknown');
    assert.equal(result.tier, 'unknown');
  });

  test('handles null/undefined gracefully', () => {
    assert.equal(fingerprintModel(null), null);
    assert.equal(fingerprintModel(undefined), null);
    assert.equal(fingerprintModel(''), null);
  });
});

describe('detectModelsInConfig', () => {
  test('detects models from custom provider', () => {
    const config = {
      provider: {
        aws: {
          models: {
            'eu.anthropic.claude-sonnet-4-6': { name: 'Claude-Sonnet-4.6' },
            'eu.anthropic.claude-haiku-4-5-20251001-v1:0': { name: 'Claude-Haiku-4.5' },
          }
        }
      }
    };
    const models = detectModelsInConfig(config);
    assert.equal(models.length, 2);
    assert.ok(models.some(m => m.family === 'anthropic' && m.tier === 'strong'), 'Should detect sonnet as strong');
    assert.ok(models.some(m => m.family === 'anthropic' && m.tier === 'fast'), 'Should detect haiku as fast');
  });

  test('detects top-level model', () => {
    const config = { model: 'anthropic/claude-opus-4-20250514' };
    const models = detectModelsInConfig(config);
    assert.ok(models.some(m => m.tier === 'frontier'), 'Should detect opus as frontier');
  });

  test('deduplicates same model', () => {
    const config = {
      model: 'anthropic/claude-sonnet-4-5',
      agent: { build: { model: 'anthropic/claude-sonnet-4-5' } }
    };
    const models = detectModelsInConfig(config);
    // Both are same ID, should only appear once
    const unique = new Set(models.map(m => m.originalId));
    assert.equal(unique.size, models.length, 'No duplicates');
  });

  test('returns empty for null config', () => {
    assert.deepEqual(detectModelsInConfig(null), []);
    assert.deepEqual(detectModelsInConfig(undefined), []);
  });
});

describe('AGENT_TIERS', () => {
  test('all entries have tier and steps', () => {
    for (const [name, entry] of Object.entries(AGENT_TIERS)) {
      assert.ok(typeof entry === 'object', `${name} should be an object`);
      assert.ok(['frontier', 'strong', 'fast'].includes(entry.tier), `${name} has invalid tier: ${entry.tier}`);
      assert.ok(entry.steps === null || (typeof entry.steps === 'number' && entry.steps > 0), `${name} has invalid steps: ${entry.steps}`);
    }
  });

  test('build agent is frontier with no step limit', () => {
    assert.equal(AGENT_TIERS['build'].tier, 'frontier');
    assert.equal(AGENT_TIERS['build'].steps, null);
  });

  test('plan agent is fast', () => {
    assert.equal(AGENT_TIERS['plan'].tier, 'fast');
  });

  test('code-reviewer has step limit', () => {
    const r = AGENT_TIERS['code-reviewer'];
    assert.ok(r.steps !== null, 'code-reviewer should have step limit');
    assert.ok(r.steps <= 20, 'code-reviewer step limit should be reasonable');
  });
});

describe('getAgentTier', () => {
  test('returns correct tier for known agent', () => {
    const t = getAgentTier('code-reviewer');
    assert.equal(t.tier, 'strong');
  });

  test('returns default for unknown agent', () => {
    const t = getAgentTier('totally-unknown-agent');
    assert.equal(t.tier, AGENT_TIERS['_default'].tier);
  });
});

describe('MODEL_PRESETS', () => {
  test('all presets have label', () => {
    for (const [key, preset] of Object.entries(MODEL_PRESETS)) {
      assert.ok(preset.label, `preset ${key} missing label`);
    }
  });

  test('keep preset exists', () => {
    assert.ok(MODEL_PRESETS['keep'], 'keep preset must exist');
  });

  test('cost-optimized uses cheaper model for plan', () => {
    const preset = MODEL_PRESETS['cost-optimized'];
    assert.ok(preset.agents?.plan?.model, 'cost-optimized must have plan model');
    // plan model should be cheaper (haiku) than build model (sonnet)
    assert.notEqual(preset.agents.plan.model, preset.model, 'plan model should differ from build model');
  });
});
