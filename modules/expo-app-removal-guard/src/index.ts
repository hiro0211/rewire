import { requireOptionalNativeModule } from 'expo-modules-core';

type AppRemovalGuardModule = {
  setDenyAppRemoval(value: boolean): Promise<boolean>;
  getDenyAppRemoval(): Promise<boolean>;
};

export default requireOptionalNativeModule<AppRemovalGuardModule>(
  'ExpoAppRemovalGuard',
);
