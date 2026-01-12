import { BillingProductLevel } from '@teable/openapi';
import type { IUsageVo } from '@teable/openapi';

/**
 * All features unlocked - billing system removed
 * Returns full Enterprise-level access for all features
 */
const UNLIMITED_USAGE: IUsageVo = {
  level: BillingProductLevel.Enterprise,
  limit: {
    maxRows: Number.MAX_SAFE_INTEGER,
    maxSizeAttachments: Number.MAX_SAFE_INTEGER,
    maxNumDatabaseConnections: Number.MAX_SAFE_INTEGER,
    maxRevisionHistoryDays: 365,
    maxAutomationHistoryDays: 365,
    // Working features - enabled
    rowColoringEnable: true,
    buttonFieldEnable: true,
    fieldAIEnable: true,
    chatAIEnable: true,
    adminPanelEnable: true,
    userGroupEnable: true,
    advancedExtensionsEnable: true,
    passwordRestrictedSharesEnable: true,
    authenticationEnable: true,
    domainVerificationEnable: true,
    organizationEnable: true,
    appEnable: true,
    customDomainEnable: true,
    apiRateLimit: Number.MAX_SAFE_INTEGER,
    maxNumAutomationSendEmail: Number.MAX_SAFE_INTEGER,
    // Incomplete features - keep disabled until implemented
    automationEnable: false,
    auditLogEnable: false,
    advancedPermissionsEnable: false,
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useBaseUsage = (_props?: { disabled?: boolean }) => {
  // All features unlocked - return full access
  return UNLIMITED_USAGE;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useBaseUsageWithLoading = (_props?: { disabled?: boolean }) => {
  // All features unlocked - return full access immediately
  return { baseUsage: UNLIMITED_USAGE, loading: false, isFetched: true };
};
