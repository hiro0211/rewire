const withFirebaseAnalyticsNoAdId = require('../withFirebaseAnalyticsNoAdId');

describe('withFirebaseAnalyticsNoAdId config plugin', () => {
  test('exports a function', () => {
    expect(typeof withFirebaseAnalyticsNoAdId).toBe('function');
  });

  describe('injectFlag', () => {
    const { injectFlag } = withFirebaseAnalyticsNoAdId;

    test('target行の前にフラグを挿入する', () => {
      const input = [
        "require 'something'",
        '',
        "target 'Rewire' do",
        '  use_expo_modules!',
        'end',
      ].join('\n');

      const result = injectFlag(input);
      expect(result).toContain('$RNFirebaseAnalyticsWithoutAdIdSupport = true');
      const flagIndex = result.indexOf('$RNFirebaseAnalyticsWithoutAdIdSupport = true');
      const targetIndex = result.indexOf("target 'Rewire' do");
      expect(flagIndex).toBeLessThan(targetIndex);
    });

    test('すでにフラグが存在する場合は重複挿入しない', () => {
      const input = [
        '$RNFirebaseAnalyticsWithoutAdIdSupport = true',
        '',
        "target 'Rewire' do",
        '  use_expo_modules!',
        'end',
      ].join('\n');

      const result = injectFlag(input);
      const matches = result.match(/\$RNFirebaseAnalyticsWithoutAdIdSupport/g) || [];
      expect(matches.length).toBe(1);
    });

    test('target行がない場合もフラグを挿入する', () => {
      const input = [
        "require 'something'",
        "ENV['KEY'] = 'value'",
        '',
        'some_other_content',
      ].join('\n');

      const result = injectFlag(input);
      expect(result).toContain('$RNFirebaseAnalyticsWithoutAdIdSupport = true');
    });

    test('コメントが含まれる', () => {
      const input = "target 'Rewire' do\nend\n";
      const result = injectFlag(input);
      expect(result).toContain('# Exclude GoogleAppMeasurementIdentitySupport');
    });
  });
});
