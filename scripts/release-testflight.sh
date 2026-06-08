#!/usr/bin/env bash
# Build a Release archive of the iOS app and upload it to TestFlight.
# Single-purpose script: archive -> export IPA -> altool upload.
#
# Requirements (handled by hiro out-of-band):
#   - Xcode 16+ installed on this Mac (xcodebuild on PATH)
#   - Apple Distribution certificate + provisioning profile in Keychain
#   - App Store Connect API .p8 key at $ASC_KEY_PATH
#   - ios/ directory populated (npx expo prebuild --platform ios, then pod install)
#
# Usage:
#   ./scripts/release-testflight.sh [--prebuild] [--skip-pods] [--skip-upload]
#
# Env vars (override defaults):
#   ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH

set -euo pipefail

: "${ASC_KEY_ID:=2X7YAY8C29}"
: "${ASC_ISSUER_ID:=f9b7f07e-d315-46ba-895a-144635852ffd}"
: "${ASC_KEY_PATH:=$HOME/.config/rewire/AuthKey_2X7YAY8C29.p8}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE="$REPO_ROOT/ios/Rewire.xcworkspace"
SCHEME="Rewire"
CONFIGURATION="Release"
BUILD_DIR="$REPO_ROOT/build"
ARCHIVE_PATH="$BUILD_DIR/Rewire.xcarchive"
IPA_DIR="$BUILD_DIR/ipa"
EXPORT_OPTIONS="$REPO_ROOT/scripts/ExportOptions.plist"

DO_PREBUILD=0
DO_PODS=1
DO_UPLOAD=1

while [ $# -gt 0 ]; do
  case "$1" in
    --prebuild) DO_PREBUILD=1 ;;
    --skip-pods) DO_PODS=0 ;;
    --skip-upload) DO_UPLOAD=0 ;;
    -h|--help)
      sed -n '2,15p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
  shift
done

log() { printf '\n\033[1;36m==>\033[0m %s\n' "$1"; }
fail() { printf '\n\033[1;31m✗\033[0m %s\n' "$1" >&2; exit 1; }

# --- Pre-flight checks -------------------------------------------------------

[ -f "$ASC_KEY_PATH" ] || fail "ASC_KEY_PATH not found: $ASC_KEY_PATH"
[ -f "$EXPORT_OPTIONS" ] || fail "ExportOptions.plist not found: $EXPORT_OPTIONS"
command -v xcodebuild >/dev/null || fail "xcodebuild not on PATH"

cd "$REPO_ROOT"

# --- Optional prebuild -------------------------------------------------------

if [ "$DO_PREBUILD" = 1 ]; then
  log "Running expo prebuild (iOS)"
  npx expo prebuild --platform ios --no-install
fi

[ -d "$WORKSPACE" ] || fail "Workspace not found: $WORKSPACE (run with --prebuild?)"

# --- Pods --------------------------------------------------------------------

if [ "$DO_PODS" = 1 ]; then
  log "pod install (deployment)"
  (cd ios && pod install --deployment)
fi

# --- Clean previous archive --------------------------------------------------

rm -rf "$ARCHIVE_PATH" "$IPA_DIR"
mkdir -p "$BUILD_DIR"

# --- Archive -----------------------------------------------------------------

log "xcodebuild archive ($SCHEME / $CONFIGURATION)"
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE_PATH" \
  -allowProvisioningUpdates \
  -authenticationKeyIssuerID "$ASC_ISSUER_ID" \
  -authenticationKeyID "$ASC_KEY_ID" \
  -authenticationKeyPath "$ASC_KEY_PATH" \
  archive

# --- Export IPA --------------------------------------------------------------

log "xcodebuild -exportArchive -> IPA"
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  -exportPath "$IPA_DIR" \
  -allowProvisioningUpdates \
  -authenticationKeyIssuerID "$ASC_ISSUER_ID" \
  -authenticationKeyID "$ASC_KEY_ID" \
  -authenticationKeyPath "$ASC_KEY_PATH"

IPA_FILE="$(find "$IPA_DIR" -maxdepth 1 -name '*.ipa' | head -n1)"
[ -n "$IPA_FILE" ] || fail "No .ipa produced under $IPA_DIR"

# --- Upload ------------------------------------------------------------------

if [ "$DO_UPLOAD" = 0 ]; then
  log "Skipping upload (--skip-upload). IPA at: $IPA_FILE"
  exit 0
fi

log "xcrun altool --upload-app -> TestFlight"
API_PRIVATE_KEYS_DIR="$(dirname "$ASC_KEY_PATH")" \
xcrun altool --upload-app \
  --type ios \
  --file "$IPA_FILE" \
  --apiKey "$ASC_KEY_ID" \
  --apiIssuer "$ASC_ISSUER_ID"

log "Upload complete. App Store Connect → TestFlight → Builds に 5〜15 分で反映されます。"
log "次回ビルド前に app.json の expo.ios.buildNumber を上げてください。"
