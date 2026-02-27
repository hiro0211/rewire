const withWidget = require('../withWidget');

describe('withWidget config plugin', () => {
  test('exports a function', () => {
    expect(typeof withWidget).toBe('function');
  });

  test('generateWidgetSwift → TimelineProvider + App Groups UserDefaults', () => {
    const swift = withWidget.generateWidgetSwift();
    expect(swift).toContain('UserDefaults(suiteName:');
    expect(swift).toContain('group.rewire.app.com');
    expect(swift).toContain('TimelineProvider');
    expect(swift).toContain('getTimeline');
    expect(swift).toContain('getSnapshot');
    expect(swift).toContain('Calendar.current');
  });

  test('generateWidgetViews → SwiftUI + WidgetKit import', () => {
    const swift = withWidget.generateWidgetViews();
    expect(swift).toContain('import SwiftUI');
    expect(swift).toContain('import WidgetKit');
    expect(swift).toContain('日');
    expect(swift).toContain('時間');
  });

  test('generateWidgetViews → widgetBackground helper for iOS 17+ containerBackground', () => {
    const swift = withWidget.generateWidgetViews();
    expect(swift).toContain('func widgetBackground');
    expect(swift).toContain('containerBackground');
    expect(swift).toContain('iOSApplicationExtension 17.0');
  });

  test('generateWidgetViews → views use widgetBackground instead of bare background', () => {
    const swift = withWidget.generateWidgetViews();
    expect(swift).toContain('.widgetBackground(bgColor)');
    // Should NOT use .background(bgColor) directly on views (only inside the fallback helper)
    const lines = swift.split('\n');
    const viewLines = lines.filter(l =>
      l.includes('.background(bgColor)') && !l.includes('self.')
    );
    // Only allowed inside the widgetBackground helper as fallback
    expect(viewLines.length).toBeLessThanOrEqual(1);
  });

  test('generateInfoPlist → com.apple.widgetkit-extension', () => {
    const plist = withWidget.generateInfoPlist();
    expect(plist).toContain('com.apple.widgetkit-extension');
    expect(plist).toContain('NSExtensionPointIdentifier');
  });

  test('generateEntitlements → group.rewire.app.com', () => {
    const plist = withWidget.generateEntitlements();
    expect(plist).toContain('group.rewire.app.com');
    expect(plist).toContain('com.apple.security.application-groups');
  });

  test('generateWidgetBundle → @main + WidgetBundle', () => {
    const swift = withWidget.generateWidgetBundle();
    expect(swift).toContain('@main');
    expect(swift).toContain('WidgetBundle');
  });

  test('WIDGET_BUNDLE_ID = rewire.app.com.RewireWidget', () => {
    expect(withWidget.WIDGET_BUNDLE_ID).toBe('rewire.app.com.RewireWidget');
  });

  test('WIDGET_EXTENSION_NAME = RewireWidget', () => {
    expect(withWidget.WIDGET_EXTENSION_NAME).toBe('RewireWidget');
  });
});
