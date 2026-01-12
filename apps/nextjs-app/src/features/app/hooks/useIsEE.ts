/**
 * useIsEE - Always returns true (billing system removed)
 * All EE features are unlocked for self-hosted instances.
 */
export const useIsEE = () => {
  // All EE features unlocked
  return true;
};
