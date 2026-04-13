/Users/arimurahiroaki/.openclaw/completions/openclaw.zsh:3719: command not found: compdef
arimurahiroaki@ArimuranoMac-mini rewire % npx expo prebuild --platform ios --clean
env: load .env
env: export EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
! Git branch has uncommitted file changes
› It's recommended to commit all changes before proceeding in case you want to revert generated changes.

✔ Continue with uncommitted changes? … yes

✔ Cleared ios code
✔ Created native directory
✔ Updated package.json | no changes
[ContentBlocker] Writing 584 rules to blockerList.json
✔ Finished prebuild
✔ Installed CocoaPods
arimurahiroaki@ArimuranoMac-mini rewire % cd ios && pod install && cd ..
Forcing static linking for pods: ["RNFBApp", "RNFBAnalytics", "RNFBFirestore"]
Using Expo modules
[Expo] Enabling modular headers for pod ExpoModulesCore
[Expo] Enabling modular headers for pod React-RCTAppDelegate
[Expo] Enabling modular headers for pod React-RCTFabric
[Expo] Enabling modular headers for pod ReactAppDependencyProvider
[Expo] Enabling modular headers for pod React-Core
[Expo] Enabling modular headers for pod ReactCodegen
[Expo] Enabling modular headers for pod RCTRequired
[Expo] Enabling modular headers for pod RCTTypeSafety
[Expo] Enabling modular headers for pod ReactCommon
[Expo] Enabling modular headers for pod React-NativeModulesApple
[Expo] Enabling modular headers for pod Yoga
[Expo] Enabling modular headers for pod React-Fabric
[Expo] Enabling modular headers for pod React-graphics
[Expo] Enabling modular headers for pod React-utils
[Expo] Enabling modular headers for pod React-featureflags
[Expo] Enabling modular headers for pod React-debug
[Expo] Enabling modular headers for pod React-ImageManager
[Expo] Enabling modular headers for pod React-rendererdebug
[Expo] Enabling modular headers for pod React-jsi
[Expo] Enabling modular headers for pod React-renderercss
[Expo] Enabling modular headers for pod hermes-engine
[Expo] Enabling modular headers for pod glog
[Expo] Enabling modular headers for pod boost
[Expo] Enabling modular headers for pod DoubleConversion
[Expo] Enabling modular headers for pod fast_float
[Expo] Enabling modular headers for pod fmt
[Expo] Enabling modular headers for pod RCT-Folly
[Expo] Enabling modular headers for pod SocketRocket
[Expo] Enabling modular headers for pod ZXingObjC
[Expo] Enabling modular headers for pod RNScreens
RNFBAnalytics: Not installing FirebaseAnalytics/IdentitySupport Pod, no IDFA will be collected.
-- SK_GRAPHITE: OFF (detected via libs/.graphite marker file)
Found 16 modules for target `Rewire`
link_native_modules! {ios_packages: [{configurations: [], name: "@react-native-async-storage/async-storage", root: "/Users/arimurahiroaki/rewire/node_modules/@react-native-async-storage/async-storage", path: "../node_modules/@react-native-async-storage/async-storage", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/@react-native-async-storage/async-storage/RNCAsyncStorage.podspec", script_phases: []}, {configurations: [], name: "@react-native-community/datetimepicker", root: "/Users/arimurahiroaki/rewire/node_modules/@react-native-community/datetimepicker", path: "../node_modules/@react-native-community/datetimepicker", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/@react-native-community/datetimepicker/RNDateTimePicker.podspec", script_phases: []}, {configurations: [], name: "@react-native-community/slider", root: "/Users/arimurahiroaki/rewire/node_modules/@react-native-community/slider", path: "../node_modules/@react-native-community/slider", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/@react-native-community/slider/react-native-slider.podspec", script_phases: []}, {configurations: [], name: "@react-native-firebase/analytics", root: "/Users/arimurahiroaki/rewire/node_modules/@react-native-firebase/analytics", path: "../node_modules/@react-native-firebase/analytics", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/@react-native-firebase/analytics/RNFBAnalytics.podspec", script_phases: []}, {configurations: [], name: "@react-native-firebase/app", root: "/Users/arimurahiroaki/rewire/node_modules/@react-native-firebase/app", path: "../node_modules/@react-native-firebase/app", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/@react-native-firebase/app/RNFBApp.podspec", script_phases: [{"name" => "[RNFB] Core Configuration", "path" => "./ios_config.sh", "execution_position" => "after_compile", "input_files" => ["$(BUILT_PRODUCTS_DIR)/$(INFOPLIST_PATH)"]}]}, {configurations: [], name: "@react-native-firebase/firestore", root: "/Users/arimurahiroaki/rewire/node_modules/@react-native-firebase/firestore", path: "../node_modules/@react-native-firebase/firestore", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/@react-native-firebase/firestore/RNFBFirestore.podspec", script_phases: []}, {configurations: [], name: "@react-native-picker/picker", root: "/Users/arimurahiroaki/rewire/node_modules/@react-native-picker/picker", path: "../node_modules/@react-native-picker/picker", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/@react-native-picker/picker/RNCPicker.podspec", script_phases: []}, {configurations: [], name: "@shopify/react-native-skia", root: "/Users/arimurahiroaki/rewire/node_modules/@shopify/react-native-skia", path: "../node_modules/@shopify/react-native-skia", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/@shopify/react-native-skia/react-native-skia.podspec", script_phases: []}, {configurations: [], name: "expo", root: "/Users/arimurahiroaki/rewire/node_modules/expo", path: "../node_modules/expo", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/expo/Expo.podspec", script_phases: []}, {configurations: [], name: "react-native-purchases", root: "/Users/arimurahiroaki/rewire/node_modules/react-native-purchases", path: "../node_modules/react-native-purchases", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/react-native-purchases/RNPurchases.podspec", script_phases: []}, {configurations: [], name: "react-native-reanimated", root: "/Users/arimurahiroaki/rewire/node_modules/react-native-reanimated", path: "../node_modules/react-native-reanimated", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/react-native-reanimated/RNReanimated.podspec", script_phases: []}, {configurations: [], name: "react-native-safe-area-context", root: "/Users/arimurahiroaki/rewire/node_modules/react-native-safe-area-context", path: "../node_modules/react-native-safe-area-context", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/react-native-safe-area-context/react-native-safe-area-context.podspec", script_phases: []}, {configurations: [], name: "react-native-screens", root: "/Users/arimurahiroaki/rewire/node_modules/react-native-screens", path: "../node_modules/react-native-screens", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/react-native-screens/RNScreens.podspec", script_phases: []}, {configurations: [], name: "react-native-svg", root: "/Users/arimurahiroaki/rewire/node_modules/react-native-svg", path: "../node_modules/react-native-svg", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/react-native-svg/RNSVG.podspec", script_phases: []}, {configurations: [], name: "react-native-view-shot", root: "/Users/arimurahiroaki/rewire/node_modules/react-native-view-shot", path: "../node_modules/react-native-view-shot", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/react-native-view-shot/react-native-view-shot.podspec", script_phases: []}, {configurations: [], name: "react-native-worklets", root: "/Users/arimurahiroaki/rewire/node_modules/react-native-worklets", path: "../node_modules/react-native-worklets", podspec_path: "/Users/arimurahiroaki/rewire/node_modules/react-native-worklets/RNWorklets.podspec", script_phases: []}], ios_project_root_path: "/Users/arimurahiroaki/rewire/ios", react_native_path: "../node_modules/react-native"}
RNFBAnalytics: Not installing FirebaseAnalytics/IdentitySupport Pod, no IDFA will be collected.
Adding a custom script phase for Pod RNFBApp: [RNFB] Core Configuration
-- SK_GRAPHITE: OFF (detected via libs/.graphite marker file)
Auto-linking React Native modules for target `Rewire`: RNCAsyncStorage, RNCPicker, RNDateTimePicker, RNFBAnalytics, RNFBApp, RNFBFirestore, RNPurchases, RNReanimated, RNSVG, RNScreens, RNWorklets, react-native-safe-area-context, react-native-skia, react-native-slider, and react-native-view-shot
Framework build type is static framework
[ReactNativeDependencies] Setting up ReactNativeDependencies...
[ReactNativeDependencies] Building from source: false
[ReactNativeDependencies] Using release tarball
[ReactNativeDependencies] Using tarball from URL: https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/0.81.5/react-native-artifacts-0.81.5-reactnative-dependencies-debug.tar.gz
[ReactNativeDependencies] Source: {http: "https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/0.81.5/react-native-artifacts-0.81.5-reactnative-dependencies-debug.tar.gz"}
[ReactNativeCore] Setting up ReactNativeCore...
[ReactNativeCore] Building from source: false
[ReactNativeCore] Using tarball from URL: https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/0.81.5/react-native-artifacts-0.81.5-reactnative-core-debug.tar.gz
[ReactNativeCore] Source: {http: "https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/0.81.5/react-native-artifacts-0.81.5-reactnative-core-debug.tar.gz"}
Configuring the target with the New Architecture
[ReactNativeCore] Using React Native Core and React Native Dependencies prebuilt versions.
[Codegen] Analyzing /Users/arimurahiroaki/rewire/package.json
[Codegen] Searching for codegen-enabled libraries in the app.
[Codegen] The "codegenConfig" field is not defined in package.json. Assuming there is nothing to generate at the app level.
[Codegen] Searching for codegen-enabled libraries in react-native.config.js
[Codegen] Found @react-native-async-storage/async-storage
[Codegen] Found @react-native-community/datetimepicker
[Codegen] Found @react-native-community/slider
[Codegen] Found @react-native-picker/picker
[Codegen] Found @shopify/react-native-skia
[Codegen] Found react-native-reanimated
[Codegen] Found react-native-safe-area-context
[Codegen] Found react-native-screens
[Codegen] Found react-native-svg
[Codegen] Found react-native-view-shot
[Codegen] Found react-native-worklets
[Codegen] Processing rnasyncstorage
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, macos, tvos, visionos for rnasyncstorage
[Codegen] Processing RNDateTimePickerCGen
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, visionos for RNDateTimePickerCGen
[Codegen] Processing RNCSlider
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, visionos for RNCSlider
[Codegen] Processing rnpicker
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, macos, tvos for rnpicker
[Codegen] Processing rnskia
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, macos, tvos for rnskia
[Codegen] Processing rnreanimated
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, macos, tvos, visionos for rnreanimated
[Codegen] Processing safeareacontext
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, macos, tvos, visionos for safeareacontext
[Codegen] Processing rnscreens
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, tvos, visionos for rnscreens
[Codegen] Processing rnsvg
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, macos, tvos, visionos for rnsvg
[Codegen] Processing rnviewshot
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios for rnviewshot
[Codegen] Processing rnworklets
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, macos, tvos, visionos for rnworklets
[Codegen] Generating Native Code for rnasyncstorage - ios
[Codegen] Generated artifacts: /Users/arimurahiroaki/rewire/ios/build/generated/ios
[Codegen] Generating Native Code for RNDateTimePickerCGen - ios
[Codegen] Generated artifacts: /Users/arimurahiroaki/rewire/ios/build/generated/ios
[Codegen] Generating Native Code for RNCSlider - ios
[Codegen] Generated artifacts: /Users/arimurahiroaki/rewire/ios/build/generated/ios
[Codegen] Generating Native Code for rnpicker - ios
[Codegen] Generated artifacts: /Users/arimurahiroaki/rewire/ios/build/generated/ios
[Codegen] Generating Native Code for rnskia - ios
[Codegen] Generated artifacts: /Users/arimurahiroaki/rewire/ios/build/generated/ios
[Codegen] Generating Native Code for rnreanimated - ios
[Codegen] Generated artifacts: /Users/arimurahiroaki/rewire/ios/build/generated/ios
[Codegen] Generating Native Code for safeareacontext - ios
[Codegen] Generated artifacts: /Users/arimurahiroaki/rewire/ios/build/generated/ios
[Codegen] Generating Native Code for rnscreens - ios
[Codegen] Generated artifacts: /Users/arimurahiroaki/rewire/ios/build/generated/ios
[Codegen] Generating Native Code for rnsvg - ios
[Codegen] Generated artifacts: /Users/arimurahiroaki/rewire/ios/build/generated/ios
[Codegen] Generating Native Code for rnviewshot - ios
[Codegen] Generated artifacts: /Users/arimurahiroaki/rewire/ios/build/generated/ios
[Codegen] Generating Native Code for rnworklets - ios
[Codegen] Generated artifacts: /Users/arimurahiroaki/rewire/ios/build/generated/ios
[Codegen] Generating RCTThirdPartyComponentsProvider.h
[Codegen] Generated artifact: /Users/arimurahiroaki/rewire/ios/build/generated/ios/RCTThirdPartyComponentsProvider.h
[Codegen] Generating RCTThirdPartyComponentsProvider.mm
[Codegen] Generated artifact: /Users/arimurahiroaki/rewire/ios/build/generated/ios/RCTThirdPartyComponentsProvider.mm
[Codegen] Generating RCTModulesProvider.h
[Codegen] Generated artifact: /Users/arimurahiroaki/rewire/ios/build/generated/ios/RCTModuleProviders.h
[Codegen] Generating RCTModuleProviders.mm
[Codegen] Generated artifact: /Users/arimurahiroaki/rewire/ios/build/generated/ios/RCTModuleProviders.mm
[Codegen] Generating RCTAppDependencyProvider
[Codegen] Generated artifact: /Users/arimurahiroaki/rewire/ios/build/generated/ios/RCTAppDependencyProvider.h
[Codegen] Generated artifact: /Users/arimurahiroaki/rewire/ios/build/generated/ios/RCTAppDependencyProvider.mm
[Codegen] Generated podspec: /Users/arimurahiroaki/rewire/ios/build/generated/ios/ReactAppDependencyProvider.podspec
[Codegen] Generated podspec: /Users/arimurahiroaki/rewire/ios/build/generated/ios/ReactCodegen.podspec
[Codegen] Done.
[ReactNativeDependencies] Using release tarball
[ReactNativeDependencies] Using tarball from URL: https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/0.81.5/react-native-artifacts-0.81.5-reactnative-dependencies-debug.tar.gz
Analyzing dependencies
RNFBAnalytics: Not installing FirebaseAnalytics/IdentitySupport Pod, no IDFA will be collected.
-- SK_GRAPHITE: OFF (detected via libs/.graphite marker file)
Downloading dependencies
[Expo] Disabling USE_FRAMEWORKS for modules ExpoModulesCore, Expo, ReactAppDependencyProvider, expo-dev-menu, RNFBApp, RNFBAnalytics, RNFBFirestore
Generating Pods project
Setting USE_HERMES build settings
Setting REACT_NATIVE_PATH build settings
Setting SWIFT_ACTIVE_COMPILATION_CONDITIONS build settings
[Ccache]: Removing Ccache from CC, LD, CXX & LDPLUSPLUS build settings
Setting SWIFT_ENABLE_EXPLICIT_MODULES build settings
[SPM] Cleaning old SPM dependencies from Pods project
[SPM] Adding SPM dependencies to Pods project
[Privacy Manifest Aggregation] Appending aggregated reasons to existing PrivacyInfo.xcprivacy file.
[Privacy Manifest Aggregation] Reading .xcprivacy files to aggregate all used Required Reason APIs.
Setting CLANG_CXX_LANGUAGE_STANDARD to c++20 on /Users/arimurahiroaki/rewire/ios/Rewire.xcodeproj

==================== DEPRECATION NOTICE =====================
Calling `pod install` directly is deprecated in React Native
because we are moving away from Cocoapods toward alternative
solutions to build the project.
* If you are using Expo, please run:
`npx expo run:ios`
* If you are using the Community CLI, please run:
`yarn ios`
=============================================================

Pod install took 19 [s] to run
Integrating client project
Pod installation complete! There are 106 dependencies from the Podfile and 127 total pods installed.
[Expo] Adding '[Expo Autolinking] Run Codegen with autolinking' build phase to ReactCodegen

[!] NPM package '@react-native-firebase/analytics' depends on '@react-native-firebase/app' v23.8.8 but found v23.8.6, this might cause build issues or runtime crashes.

[!] NPM package '@react-native-firebase/analytics' depends on '@react-native-firebase/app' v23.8.8 but found v23.8.6, this might cause build issues or runtime crashes.

[!] NPM package '@react-native-firebase/analytics' depends on '@react-native-firebase/app' v23.8.8 but found v23.8.6, this might cause build issues or runtime crashes.
arimurahiroaki@ArimuranoMac-mini rewire % 