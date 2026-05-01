export interface SafariWebExtensionStatus {
  isEnabled: boolean;
  hasAllUrls: boolean;
  extensionBundleId: string;
  lastActiveAt: number;
  lastBlockedAt: number;
  error?: string;
}

export interface ExtensionStateNative {
  available: boolean;
  isEnabled: boolean;
  error?: string;
}

export type ExtensionAliveListener = (payload: { receivedAt: number }) => void;

export interface SafariWebExtensionBridge {
  getExtensionStatus: () => Promise<SafariWebExtensionStatus>;
  getExtensionState: () => Promise<ExtensionStateNative>;
  subscribeAlive: (listener: ExtensionAliveListener) => () => void;
}
