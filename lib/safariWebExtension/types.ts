export interface SafariWebExtensionStatus {
  isEnabled: boolean;
  extensionBundleId: string;
  lastActiveAt: number;
  error?: string;
}

export interface SafariWebExtensionBridge {
  getExtensionStatus: () => Promise<SafariWebExtensionStatus>;
}
