// tests/data/docker.test.js
// Tests for DEV_ENVIRONMENTS, PROVIDER_ENV_CONFIGS, getRecommendedEnvironments

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DEV_ENVIRONMENTS, PROVIDER_ENV_CONFIGS, PROXY_CONFIGS, ARTIFACT_REGISTRY_CONFIGS, getRecommendedEnvironments } from '../data/docker.js';

describe('DEV_ENVIRONMENTS', () => {
  test('all entries have required fields', () => {
    for (const env of DEV_ENVIRONMENTS) {
      assert.ok(env.id, `env missing id: ${JSON.stringify(env)}`);
      assert.ok(env.image, `env ${env.id} missing image`);
      assert.ok(env.label, `env ${env.id} missing label`);
      assert.ok(env.install, `env ${env.id} missing install`);
      assert.ok(Array.isArray(env.languages), `env ${env.id} languages must be array`);
    }
  });

  test('all ids are unique', () => {
    const ids = DEV_ENVIRONMENTS.map(e => e.id);
    const unique = new Set(ids);
    assert.equal(unique.size, ids.length, 'Duplicate env IDs found');
  });

  test('all images use official names (no latest for critical images)', () => {
    const officialPrefixes = ['node:', 'python:', 'maven:', 'gradle:', 'golang:', 'rust:', 'ruby:', 'php:', 'swift:', 'dart:', 'elixir:', 'gcc:', 'openjdk:', 'ubuntu:', 'hashicorp/', 'mcr.microsoft.com/', 'oven/', 'ghcr.io/', 'cytopia/'];
    for (const env of DEV_ENVIRONMENTS) {
      const hasKnownPrefix = officialPrefixes.some(p => env.image.startsWith(p));
      assert.ok(hasKnownPrefix, `env ${env.id} uses unknown image prefix: ${env.image}`);
    }
  });

  test('generic and ubuntu environments exist', () => {
    const ids = DEV_ENVIRONMENTS.map(e => e.id);
    assert.ok(ids.includes('generic'), 'Missing generic environment');
    assert.ok(ids.includes('ubuntu'), 'Missing ubuntu environment');
  });

  test('covers all major language groups', () => {
    const allLangs = new Set(DEV_ENVIRONMENTS.flatMap(e => e.languages));
    for (const lang of ['node', 'python', 'java', 'go', 'rust', 'ruby', 'php', 'csharp', 'swift', 'dart', 'elixir', 'terraform']) {
      assert.ok(allLangs.has(lang) || allLangs.has('*'), `No environment for language: ${lang}`);
    }
  });
});

describe('getRecommendedEnvironments', () => {
  test('returns matched envs for node project', () => {
    const { matched, rest, generals } = getRecommendedEnvironments(['node']);
    assert.ok(matched.length > 0, 'Should have matches for node');
    assert.ok(matched.some(e => e.id === 'node'), 'Should include node env');
    assert.ok(matched.some(e => e.id === 'node-bun'), 'Should include node-bun env');
    assert.ok(generals.length > 0, 'Should have general envs');
  });

  test('returns matched envs for python project', () => {
    const { matched } = getRecommendedEnvironments(['python']);
    assert.ok(matched.some(e => e.id === 'python'), 'Should include python env');
    assert.ok(matched.some(e => e.id === 'python-uv'), 'Should include python-uv env');
  });

  test('returns matched envs for java project', () => {
    const { matched } = getRecommendedEnvironments(['java']);
    assert.ok(matched.some(e => e.id === 'java-maven'), 'Should include java-maven env');
    assert.ok(matched.some(e => e.id === 'java-gradle'), 'Should include java-gradle env');
  });

  test('generals are excluded from matched/rest', () => {
    const { matched, rest, generals } = getRecommendedEnvironments(['node']);
    const allMainIds = [...matched, ...rest].map(e => e.id);
    for (const g of generals) {
      assert.ok(!allMainIds.includes(g.id), `General env ${g.id} should not appear in matched/rest`);
    }
  });

  test('returns all non-general envs in rest for empty languages', () => {
    const { matched, rest } = getRecommendedEnvironments([]);
    assert.equal(matched.length, 0, 'No matches for empty languages');
    assert.ok(rest.length > 0, 'Should have envs in rest');
  });
});

describe('PROVIDER_ENV_CONFIGS', () => {
  test('all providers have name, value, envVars', () => {
    for (const p of PROVIDER_ENV_CONFIGS) {
      assert.ok(p.name, `provider missing name`);
      assert.ok(p.value, `provider missing value`);
      assert.ok(Array.isArray(p.envVars), `provider ${p.value} envVars must be array`);
    }
  });

  test('bedrock provider has AWS_REGION as required', () => {
    const bedrock = PROVIDER_ENV_CONFIGS.find(p => p.value === 'bedrock');
    assert.ok(bedrock, 'Bedrock provider must exist');
    const region = bedrock.envVars.find(v => v.key === 'AWS_REGION');
    assert.ok(region, 'Bedrock must have AWS_REGION');
    assert.equal(region.required, true, 'AWS_REGION must be required');
  });
});

describe('PROXY_CONFIGS', () => {
  test('http-proxy config exists with correct vars', () => {
    const proxy = PROXY_CONFIGS.find(p => p.id === 'http-proxy');
    assert.ok(proxy, 'http-proxy config must exist');
    const keys = proxy.envVars.map(v => v.key);
    assert.ok(keys.includes('HTTP_PROXY'), 'Must have HTTP_PROXY');
    assert.ok(keys.includes('HTTPS_PROXY'), 'Must have HTTPS_PROXY');
    assert.ok(keys.includes('NO_PROXY'), 'Must have NO_PROXY');
  });
});

describe('ARTIFACT_REGISTRY_CONFIGS', () => {
  test('all registries have id, label, envVars', () => {
    for (const r of ARTIFACT_REGISTRY_CONFIGS) {
      assert.ok(r.id, `registry missing id`);
      assert.ok(r.label, `registry ${r.id} missing label`);
      assert.ok(Array.isArray(r.envVars), `registry ${r.id} envVars must be array`);
    }
  });

  test('nexus-npm has NPM_REGISTRY', () => {
    const nexus = ARTIFACT_REGISTRY_CONFIGS.find(r => r.id === 'nexus-npm');
    assert.ok(nexus, 'nexus-npm must exist');
    assert.ok(nexus.envVars.some(v => v.key === 'NPM_REGISTRY'), 'Must have NPM_REGISTRY');
  });

  test('pypi-mirror has PIP_INDEX_URL', () => {
    const pypi = ARTIFACT_REGISTRY_CONFIGS.find(r => r.id === 'pypi-mirror');
    assert.ok(pypi, 'pypi-mirror must exist');
    assert.ok(pypi.envVars.some(v => v.key === 'PIP_INDEX_URL'), 'Must have PIP_INDEX_URL');
  });
});
