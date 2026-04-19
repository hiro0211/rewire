jest.mock('expo/metro-config', () => ({
  getDefaultConfig: jest.fn(() => ({
    transformer: {},
  })),
}));

describe('metro.config.js', () => {
  it('experimentalImportSupport と inlineRequires が有効', async () => {
    const config = require('../metro.config.js');
    const options = await config.transformer.getTransformOptions();
    expect(options.transform.experimentalImportSupport).toBe(true);
    expect(options.transform.inlineRequires).toBe(true);
  });
});
