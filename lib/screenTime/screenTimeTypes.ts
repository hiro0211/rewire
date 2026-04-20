export type AuthorizationStatus = 'notDetermined' | 'denied' | 'approved';

export interface AuthorizationResult {
  status: AuthorizationStatus;
  error?: string;
}

export interface ScreenTimeBridge {
  requestAuthorization(): Promise<AuthorizationResult>;
  getAuthorizationStatus(): Promise<AuthorizationStatus>;
  enableWebContentFilter(): Promise<boolean>;
  disableWebContentFilter(): Promise<boolean>;
}
