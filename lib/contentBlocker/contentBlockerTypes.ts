export interface ContentBlockerStatus {
  isEnabled: boolean;
  extensionBundleId: string;
}

export interface ContentBlockerBridge {
  enableBlocker: () => Promise<boolean>;
  disableBlocker: () => Promise<boolean>;
  getBlockerStatus: () => Promise<ContentBlockerStatus>;
  reloadBlockerRules: () => Promise<boolean>;
}
