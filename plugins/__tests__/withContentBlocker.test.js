/* global describe, test, expect, __dirname */
const withContentBlocker = require('../withContentBlocker');

describe('ContentBlockerRequestHandler.swift generation', () => {
  test('should generate memory-efficient Swift code', () => {
    expect(typeof withContentBlocker.generateSwiftHandler).toBe('function');

    const swiftCode = withContentBlocker.generateSwiftHandler();

    // JSONSerialization.jsonObject (parsing) should NOT be present
    expect(swiftCode).not.toContain('JSONSerialization.jsonObject');

    // NSItemProvider(contentsOf: url) should be present — streaming approach
    expect(swiftCode).toContain('NSItemProvider(contentsOf: url)');

    // UserDefaults removed for simplicity
    expect(swiftCode).not.toContain('UserDefaults');

    // Fetch URL for blockerList.json from the bundle
    expect(swiftCode).toContain(
      'Bundle(for: ContentBlockerRequestHandler.self).url(forResource: "blockerList", withExtension: "json")'
    );
  });
});

describe('loadBlockedDomains', () => {
  test('parses ALL_BLOCKED_DOMAINS from constants/screenTime/blockedDomains.ts', () => {
    const projectRoot = require('path').resolve(__dirname, '../..');
    const domains = withContentBlocker.loadBlockedDomains(projectRoot);

    expect(Array.isArray(domains)).toBe(true);
    expect(domains.length).toBeGreaterThan(100);
    expect(domains).toContain('missav.ai');
    expect(domains).toContain('pornhub.com');
    // De-duplicated
    expect(new Set(domains).size).toBe(domains.length);
  });
});

describe('generateBlockerRules', () => {
  test('wraps each domain into a Safari content blocker rule', () => {
    const rules = withContentBlocker.generateBlockerRules([
      'example.com',
      'foo.bar',
    ]);

    expect(rules).toHaveLength(2);
    expect(rules[0]).toEqual({
      trigger: { 'url-filter': '.*', 'if-domain': ['*example.com'] },
      action: { type: 'block' },
    });
  });
});
