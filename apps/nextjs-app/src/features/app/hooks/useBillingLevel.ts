import { BillingProductLevel } from '@teable/openapi';

/**
 * useBillingLevel - Always returns Enterprise level (billing system removed)
 * All features are unlocked for self-hosted instances.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useBillingLevel = (_params: { spaceId?: string; baseId?: string }) => {
  // All features unlocked - always Enterprise level
  return BillingProductLevel.Enterprise;
};
