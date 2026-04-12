jest.mock("expo/config-plugins", () => {
  const withInfoPlist = jest.fn((config, callback) => {
    withInfoPlist._callback = callback;
    return config;
  });
  return { withInfoPlist };
});

const { withInfoPlist } = require("expo/config-plugins");
const withRemoveTrackingDescription = require("../withRemoveTrackingDescription");

describe("withRemoveTrackingDescription", () => {
  beforeEach(() => {
    withInfoPlist._callback = null;
    withInfoPlist.mockClear();
  });

  test("NSUserTrackingUsageDescriptionが存在する場合、削除する", () => {
    const config = { name: "test" };
    withRemoveTrackingDescription(config);

    const modConfig = {
      modResults: {
        NSUserTrackingUsageDescription:
          "This app would like to track your activity",
        CFBundleName: "Rewire",
      },
    };

    const result = withInfoPlist._callback(modConfig);

    expect(result.modResults.NSUserTrackingUsageDescription).toBeUndefined();
    expect(result.modResults.CFBundleName).toBe("Rewire");
  });

  test("NSUserTrackingUsageDescriptionが存在しない場合、何も変更しない", () => {
    const config = { name: "test" };
    withRemoveTrackingDescription(config);

    const modConfig = {
      modResults: {
        CFBundleName: "Rewire",
        ITSAppUsesNonExemptEncryption: false,
      },
    };

    const result = withInfoPlist._callback(modConfig);

    expect(result.modResults.NSUserTrackingUsageDescription).toBeUndefined();
    expect(result.modResults.CFBundleName).toBe("Rewire");
    expect(result.modResults.ITSAppUsesNonExemptEncryption).toBe(false);
  });

  test("withInfoPlistを呼び出してコールバックを登録する", () => {
    const config = { name: "test" };
    withRemoveTrackingDescription(config);

    expect(withInfoPlist).toHaveBeenCalledWith(config, expect.any(Function));
  });
});
