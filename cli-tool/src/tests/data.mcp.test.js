// tests/data/mcp.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { AVAILABLE_MCP } from '../data/mcp.js';

describe('AVAILABLE_MCP', () => {
  test('has at least 18 servers', () => {
    assert.ok(AVAILABLE_MCP.length >= 18, `Expected >= 18 MCP servers, got ${AVAILABLE_MCP.length}`);
  });

  test('all servers have required fields', () => {
    for (const mcp of AVAILABLE_MCP) {
      assert.ok(mcp.name, `mcp missing name`);
      assert.ok(mcp.value, `mcp missing value`);
      assert.ok(mcp.description, `mcp ${mcp.value} missing description`);
      assert.ok(mcp.category, `mcp ${mcp.value} missing category`);
      assert.ok(Array.isArray(mcp.relevance), `mcp ${mcp.value} missing relevance array`);
      assert.ok(mcp.config, `mcp ${mcp.value} missing config`);
      assert.ok(['local', 'remote'].includes(mcp.config.type), `mcp ${mcp.value} invalid config type`);
    }
  });

  test('all values are unique', () => {
    const values = AVAILABLE_MCP.map(m => m.value);
    assert.equal(new Set(values).size, values.length, 'Duplicate MCP values');
  });

  test('context7 is universal', () => {
    const ctx7 = AVAILABLE_MCP.find(m => m.value === 'context7');
    assert.ok(ctx7, 'context7 must exist');
    assert.ok(ctx7.relevance.includes('*'), 'context7 should be universal (*)');
  });

  test('postgres is language-specific', () => {
    const pg = AVAILABLE_MCP.find(m => m.value === 'postgres');
    assert.ok(pg, 'postgres must exist');
    assert.ok(!pg.relevance.includes('*'), 'postgres should not be universal');
    assert.ok(pg.relevance.includes('node') || pg.relevance.includes('python') || pg.relevance.includes('java'), 'postgres should be relevant for common backend langs');
  });

  test('local servers have command array', () => {
    for (const mcp of AVAILABLE_MCP.filter(m => m.config.type === 'local')) {
      assert.ok(Array.isArray(mcp.config.command) && mcp.config.command.length > 0, `local mcp ${mcp.value} must have command array`);
    }
  });

  test('remote servers have url', () => {
    for (const mcp of AVAILABLE_MCP.filter(m => m.config.type === 'remote')) {
      assert.ok(typeof mcp.config.url === 'string' && mcp.config.url.startsWith('https://'), `remote mcp ${mcp.value} must have https url`);
    }
  });
});
