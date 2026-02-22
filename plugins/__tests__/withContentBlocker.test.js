const withContentBlocker = require('../withContentBlocker');

// Note: We will need to modify withContentBlocker.js to export the generator function
// or we can test the file writing if we mock fs.
// For TDD, let's assume we will refactor to export a generator function.

describe('ContentBlockerRequestHandler.swift generation', () => {
  test('should generate memory-efficient Swift code', () => {
    // Check if the function exists (it won't initially)
    if (typeof withContentBlocker.generateSwiftHandler !== 'function') {
      throw new Error('generateSwiftHandler is not defined');
    }

    const swiftCode = withContentBlocker.generateSwiftHandler();
    
    // 1. JSONSerialization.jsonObject (parsing) should NOT be present
    // This causes memory spike by loading all JSON into memory dictionaries
    expect(swiftCode).not.toContain('JSONSerialization.jsonObject');
    
    // 2. NSItemProvider(contentsOf: url) should be present
    // This allows streaming the file directly to Safari without loading into RAM
    expect(swiftCode).toContain('NSItemProvider(contentsOf: url)');
    
    // 3. UserDefaults should NOT be present
    // We removed custom domain functionality to simplify and save memory
    expect(swiftCode).not.toContain('UserDefaults');
    
    // 4. Should get URL for blockerList.json
    expect(swiftCode).toContain('Bundle(for: ContentBlockerRequestHandler.self).url(forResource: "blockerList", withExtension: "json")');
  });
});
