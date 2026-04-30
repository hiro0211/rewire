export interface SafariWebExtensionStatus {
  isEnabled: boolean;
  hasAllUrls: boolean;
  extensionBundleId: string;
  lastActiveAt: number;
  error?: string;
}

export interface SafariWebExtensionBridge {
  getExtensionStatus: () => Promise<SafariWebExtensionStatus>;
}
