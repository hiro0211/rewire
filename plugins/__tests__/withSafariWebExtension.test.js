/* global describe, test, expect, __dirname */
const path = require('path');
const plugin = require('../withSafariWebExtension');

describe('loadBlockedDomains', () => {
  test('parses ALL_BLOCKED_DOMAINS from constants/screenTime/blockedDomains.ts', () => {
    const projectRoot = path.resolve(__dirname, '../..');
    const domains = plugin.loadBlockedDomains(projectRoot);

    expect(Array.isArray(domains)).toBe(true);
    expect(domains.length).toBeGreaterThan(100);
    expect(domains).toContain('missav.ai');
    expect(domains).toContain('pornhub.com');
    expect(new Set(domains).size).toBe(domains.length);
  });
});

describe('generateManifest', () => {
  test('returns MV3 with nativeMessaging + content_scripts, NO declarativeNetRequest (Safari 26 bug workaround)', () => {
    const manifest = plugin.generateManifest();

    expect(manifest.manifest_version).toBe(3);
    expect(manifest.permissions).toContain('nativeMessaging');
    // Safari 26 has a regression that breaks declarativeNetRequest redirect.
    // We rely solely on content_scripts at document_start for the block flow.
    expect(manifest.permissions).not.toContain('declarativeNetRequest');
    expect(manifest.permissions).not.toContain('declarativeNetRequestWithHostAccess');
    expect(manifest.declarative_net_request).toBeUndefined();
    expect(manifest.host_permissions).toContain('<all_urls>');
    // iOS Safari MV3 service_worker dies after 30-45s (known issue since iOS 17.4).
    // Use non-persistent scripts as the Apple Forums-recommended workaround.
    expect(manifest.background.scripts).toEqual(['background.js']);
    expect(manifest.background.persistent).toBe(false);
    expect(manifest.background.service_worker).toBeUndefined();
    expect(manifest.content_scripts[0].run_at).toBe('document_start');
    expect(manifest.content_scripts[0].matches).toContain('<all_urls>');
    expect(manifest.content_scripts[0].js).toEqual(['domains.js', 'content.js']);
    expect(manifest.web_accessible_resources[0].resources).toContain('blocked.html');
  });

  test('declares webNavigation and alarms permissions for heartbeat detection', () => {
    const manifest = plugin.generateManifest();

    expect(manifest.permissions).toContain('webNavigation');
    expect(manifest.permissions).toContain('alarms');
  });
});

describe('generateRules', () => {
  test('produces one redirect rule per domain pointing to blocked.html', () => {
    const rules = plugin.generateRules(['example.com', 'foo.bar']);

    expect(rules).toHaveLength(2);
    expect(rules[0]).toEqual({
      id: 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { extensionPath: '/blocked.html?domain=example.com' },
      },
      condition: {
        urlFilter: '||example.com',
        resourceTypes: ['main_frame'],
      },
    });
    expect(rules[1].id).toBe(2);
    expect(rules[1].action.redirect.extensionPath).toBe('/blocked.html?domain=foo.bar');
  });

  test('assigns sequential ids', () => {
    const rules = plugin.generateRules(['a.com', 'b.com', 'c.com']);
    expect(rules.map((r) => r.id)).toEqual([1, 2, 3]);
  });
});

describe('generateSwiftHandler', () => {
  test('uses UNUserNotificationCenter + SFExtensionMessageKey + App Group', () => {
    const swift = plugin.generateSwiftHandler();

    expect(swift).toContain('import SafariServices');
    expect(swift).toContain('import UserNotifications');
    expect(swift).toContain('NSExtensionRequestHandling');
    expect(swift).toContain('SFExtensionMessageKey');
    expect(swift).toContain('UNUserNotificationCenter.current()');
    expect(swift).toContain('UNMutableNotificationContent()');
    expect(swift).toContain('group.rewire.app.com');
    expect(swift).toContain('"route": "/panic"');
    expect(swift).toContain('rewire-shield-panic');
  });

  test('localizes notification body via Locale.preferredLanguages with ja + en strings', () => {
    const swift = plugin.generateSwiftHandler();

    expect(swift).toContain('Locale.preferredLanguages');
    expect(swift).toContain('localizedNotificationBody');
    expect(swift).toContain('衝動に気づきました。今の気持ちを振り返りましょう。');
    expect(swift).toContain('We noticed an urge. Take a moment to reflect.');
  });

  test('persists hasAllUrls flag from heartbeat messages into App Group UserDefaults', () => {
    const swift = plugin.generateSwiftHandler();

    expect(swift).toContain('rewire.webExtension.hasAllUrls');
    expect(swift).toContain('msg["hasAllUrls"]');
  });

  test('emits os_log diagnostics for Console.app debugging', () => {
    const swift = plugin.generateSwiftHandler();

    expect(swift).toContain('import os.log');
    expect(swift).toContain('os_log');
    expect(swift).toContain('safari-ext-handler');
  });

  test('posts a Darwin notification on every receive so the host app can detect activity in real-time', () => {
    const swift = plugin.generateSwiftHandler();

    // Darwin notifications are an iOS-wide IPC mechanism; the host app subscribes
    // to "rewire.extension.alive" via CFNotificationCenterAddObserver and gets
    // sub-second confirmation that the extension is running.
    expect(swift).toContain('CFNotificationCenterGetDarwinNotifyCenter');
    expect(swift).toContain('CFNotificationCenterPostNotification');
    expect(swift).toContain('rewire.extension.alive');
  });
});

describe('generateBlockedHtml', () => {
  test('references icons/app-icon.png and blocked.css/js', () => {
    const html = plugin.generateBlockedHtml();

    expect(html).toContain('icons/app-icon.png');
    expect(html).toContain('blocked.css');
    expect(html).toContain('blocked.js');
    expect(html).toContain('rewire-open');
  });

  test('keeps Japanese copy as inline fallback (for pre-DOMContentLoaded paint and tests)', () => {
    const html = plugin.generateBlockedHtml();

    expect(html).toContain('止めるって、決めたはず。');
    expect(html).toContain('をブロックしました');
    expect(html).toContain('あのときの自分を、信じて。');
    expect(html).not.toContain('衝動に気づきました');
    expect(html).not.toContain('あなたを守るために');
  });

  test('has a placeholder span for the dynamic domain name', () => {
    const html = plugin.generateBlockedHtml();

    expect(html).toContain('id="blocked-domain"');
  });

  test('annotates every user-facing string with data-i18n keys for browser.i18n replacement', () => {
    const html = plugin.generateBlockedHtml();

    expect(html).toContain('data-i18n="blockTitle"');
    expect(html).toContain('data-i18n="blockBody"');
    expect(html).toContain('data-i18n="openRewire"');
    expect(html).toContain('data-i18n="notificationHint"');
  });
});

describe('generateBlockedCss', () => {
  test('uses DARK_GRADIENTS.background colors', () => {
    const css = plugin.generateBlockedCss();

    expect(css).toContain('#0A0A0F');
    expect(css).toContain('#1a1a3e');
    expect(css).toContain('#2d1b4e');
    expect(css).toContain('linear-gradient');
    expect(css).toContain('border-radius: 22px'); // iOS app icon look
  });
});

describe('generateBlockedJs', () => {
  test('reads domain query param, sends message, handles click for rewire:// scheme', () => {
    const js = plugin.generateBlockedJs();

    expect(js).toContain("params.get('domain')");
    expect(js).toContain("type: 'blockedAccess'");
    expect(js).toContain('rewire-open');
    expect(js).toContain('rewire://panic');
  });

  test('injects the domain into #blocked-domain via textContent (XSS safe)', () => {
    const js = plugin.generateBlockedJs();

    expect(js).toContain('blocked-domain');
    expect(js).toContain('textContent');
    expect(js).not.toContain('innerHTML');
  });

  test('localizes text via browser.i18n.getMessage for [data-i18n] elements', () => {
    const js = plugin.generateBlockedJs();

    // Reads i18n keys dynamically from each element's data-i18n attribute,
    // so the JS contains the attribute name + getMessage call; per-key
    // assertions live on generateBlockedHtml / generateLocaleMessages.
    expect(js).toContain('data-i18n');
    expect(js).toContain('i18n.getMessage');
    // blockBody is the only key with a substitution (the domain), so its
    // literal must appear in the source.
    expect(js).toContain("'blockBody'");
  });
});

describe('generateBackgroundJs', () => {
  test('routes blockedAccess messages to native via sendNativeMessage', () => {
    const js = plugin.generateBackgroundJs();

    expect(js).toContain('onMessage.addListener');
    expect(js).toContain("'blockedAccess'");
    expect(js).toContain('sendNativeMessage');
    expect(js).toContain('rewire.app.com.SafariWebExtension');
  });

  test('sends heartbeat on runtime.onStartup', () => {
    const js = plugin.generateBackgroundJs();

    expect(js).toContain('onStartup.addListener');
    expect(js).toContain("type: 'heartbeat'");
  });

  test('sends heartbeat on webNavigation.onCommitted (debounced)', () => {
    const js = plugin.generateBackgroundJs();

    expect(js).toContain('webNavigation.onCommitted.addListener');
  });

  test('registers a periodic alarm for heartbeat', () => {
    const js = plugin.generateBackgroundJs();

    expect(js).toContain("alarms.create('rewire-heartbeat'");
    expect(js).toContain('periodInMinutes');
    expect(js).toContain('alarms.onAlarm.addListener');
  });

  test('hardcodes hasAllUrls:true in heartbeat payload (host_permissions is required)', () => {
    const js = plugin.generateBackgroundJs();

    // <all_urls> is in manifest.host_permissions (required), so the install gate
    // already enforces it. Skip permissions.contains because it returns false
    // unreliably on Safari iOS.
    expect(js).toContain('hasAllUrls: true');
    expect(js).not.toContain('permissions.contains');
  });

  test('relays contentHeartbeat from content_script to native', () => {
    const js = plugin.generateBackgroundJs();

    expect(js).toContain("'contentHeartbeat'");
  });
});

describe('generateContentJs', () => {
  test('fallback redirects to blocked.html when declarativeNetRequest misses', () => {
    const js = plugin.generateContentJs();

    expect(js).toContain('BLOCKED_DOMAINS');
    expect(js).toContain('window.stop()');
    expect(js).toContain("getURL('blocked.html')");
    expect(js).toContain('location.replace');
  });

  test('sends contentHeartbeat to wake background script on every page', () => {
    const js = plugin.generateContentJs();

    // content_script runs on every page (matches: <all_urls>) and acts as a
    // backup heartbeat trigger when the background page is asleep / killed.
    expect(js).toContain("type: 'contentHeartbeat'");
    expect(js).toContain('sendMessage');
  });
});

describe('generateLocaleMessages', () => {
  test('ja messages include all user-facing keys for the block page', () => {
    const ja = plugin.generateLocaleMessages('ja');

    expect(ja.extensionDescription.message).toContain('Rewire');
    expect(ja.blockTitle.message).toBe('止めるって、決めたはず。');
    expect(ja.blockBody.message).toContain('$DOMAIN$');
    expect(ja.blockBody.message).toContain('をブロックしました');
    expect(ja.blockBody.message).toContain('あのときの自分を、信じて。');
    expect(ja.blockBody.placeholders.domain.content).toBe('$1');
    expect(ja.openRewire.message).toBe('Rewire を開く');
    expect(ja.notificationHint.message).toBe('通知からも Rewire を開けます');
  });

  test('en messages mirror the ja key set with English copy', () => {
    const en = plugin.generateLocaleMessages('en');

    expect(en.extensionDescription.message).toContain('Rewire');
    expect(en.blockTitle.message.length).toBeGreaterThan(0);
    expect(en.blockTitle.message).not.toBe('止めるって、決めたはず。');
    expect(en.blockBody.message).toContain('$DOMAIN$');
    expect(en.blockBody.message.toLowerCase()).toContain('blocked');
    expect(en.blockBody.placeholders.domain.content).toBe('$1');
    expect(en.openRewire.message.toLowerCase()).toContain('rewire');
    expect(en.notificationHint.message.length).toBeGreaterThan(0);
  });

  test('ja and en have the same key set (no missing translations)', () => {
    const ja = plugin.generateLocaleMessages('ja');
    const en = plugin.generateLocaleMessages('en');

    expect(Object.keys(en).sort()).toEqual(Object.keys(ja).sort());
  });
});

describe('generateDomainsJs', () => {
  test('emits a const array of provided domains', () => {
    const js = plugin.generateDomainsJs(['example.com', 'foo.bar']);

    expect(js).toContain('const BLOCKED_DOMAINS');
    expect(js).toContain('"example.com"');
    expect(js).toContain('"foo.bar"');
  });
});
