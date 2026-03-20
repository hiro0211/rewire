export interface PurchaseErrorKeys {
  titleKey: string;
  messageKey: string;
}

export function getPurchaseErrorKeys(error: any): PurchaseErrorKeys | null {
  const code = error?.code ?? error?.errorCode;

  if (error?.userCancelled || code === '1' || code === 'PURCHASE_CANCELLED') {
    return null;
  }

  switch (code) {
    case '2':
    case 'STORE_PROBLEM':
      return { titleKey: 'errors.purchase.storeProblem.title', messageKey: 'errors.purchase.storeProblem.message' };
    case '3':
    case 'PURCHASE_NOT_ALLOWED':
      return { titleKey: 'errors.purchase.notAllowed.title', messageKey: 'errors.purchase.notAllowed.message' };
    case '5':
    case 'PRODUCT_NOT_AVAILABLE':
      return { titleKey: 'errors.purchase.notAvailable.title', messageKey: 'errors.purchase.notAvailable.message' };
    case '10':
    case 'NETWORK_ERROR':
    case '35':
    case 'OFFLINE_CONNECTION_ERROR':
      return { titleKey: 'errors.purchase.networkError.title', messageKey: 'errors.purchase.networkError.message' };
    case '15':
    case 'OPERATION_ALREADY_IN_PROGRESS':
      return { titleKey: 'errors.purchase.inProgress.title', messageKey: 'errors.purchase.inProgress.message' };
    case '18':
    case 'INELIGIBLE_ERROR':
      return { titleKey: 'errors.purchase.ineligible.title', messageKey: 'errors.purchase.ineligible.message' };
    case '20':
    case 'PAYMENT_PENDING':
      return { titleKey: 'errors.purchase.paymentPending.title', messageKey: 'errors.purchase.paymentPending.message' };
    case '23':
    case 'CONFIGURATION_ERROR':
      return { titleKey: 'errors.purchase.configError.title', messageKey: 'errors.purchase.configError.message' };
    case '32':
    case 'PRODUCT_REQUEST_TIMED_OUT':
      return { titleKey: 'errors.purchase.timeout.title', messageKey: 'errors.purchase.timeout.message' };
    default:
      return { titleKey: 'errors.purchase.defaultError.title', messageKey: 'errors.purchase.defaultError.message' };
  }
}
