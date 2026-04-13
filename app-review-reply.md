Dear App Review Team,

Thank you for your feedback regarding Guideline 2.1.

Our app does not track users. The ATT permission request is not appearing because we intentionally removed it from the binary. This is not a bug.

BACKGROUND

Rewire was designed without any tracking functionality. During a previous submission, App Store Connect showed an error that our binary contained NSUserTrackingUsageDescription, so we temporarily added ATT as a workaround.

After reviewing Apple's definition of "tracking" (linking app data with third-party data for advertising, or sharing data with a data broker), we confirmed that Rewire does none of these things. Including ATT was incorrect and misleading to users, so we removed it entirely.

In the current build, we have:
- Removed NSUserTrackingUsageDescription from Info.plist
- Uninstalled the expo-tracking-transparency package
- Removed all calls to requestTrackingPermissionsAsync
- Added a build-time plugin that strips NSUserTrackingUsageDescription as a safeguard
- Declared NSPrivacyTracking = false in PrivacyInfo.xcprivacy

WHY OUR APP DOES NOT TRACK USERS

- No advertising SDKs (no AdMob, Facebook SDK, AppsFlyer, Adjust, or Branch)
- No IDFA collection (Firebase Analytics is used with IDFA explicitly disabled)
- No data sharing with data brokers
- No cross-app or cross-site tracking

APP STORE CONNECT ISSUE

Following your recommendation to "update your app privacy information in App Store Connect to not declare tracking," we have been trying to do exactly that. However, when we select "No, product interaction data is not used for tracking purposes" and click Publish, App Store Connect returns this error:

"The app includes NSUserTrackingUsageDescription, which indicates that it may request permission to track the user..."

This error persists even though our current binary does not contain NSUserTrackingUsageDescription. We believe this is a caching issue where App Store Connect still references metadata from an older build.

REQUEST

We are blocked from updating our App Privacy responses due to this error. We kindly request that Apple set our "Product Interaction" response to "No, product interaction data is not used for tracking purposes" on our behalf, since the App Store Connect UI prevents us from saving this selection.

If there is another step we can take on our end, such as uploading a new build to refresh the cached metadata, please let us know and we will act immediately.

Thank you for your assistance.

Best regards,
Hiroaki Arimura
Developer, Rewire
