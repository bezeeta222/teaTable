import { BillingProductLevel } from '@teable/openapi';
import type { ReactElement } from 'react';

interface IUpgradeWrapperRenderProps {
  badge: ReactElement | null;
  needsUpgrade: boolean;
  isCommunity: boolean;
  currentLevel?: BillingProductLevel;
}

interface IUpgradeWrapperProps {
  children?: ReactElement | ((props: IUpgradeWrapperRenderProps) => ReactElement);
  spaceId?: string;
  baseId?: string;
  targetBillingLevel?: BillingProductLevel;
  onUpgradeClick?: () => void;
}

/**
 * UpgradeWrapper - All features unlocked (billing system removed)
 * All features are available without upgrade prompts.
 */
export const UpgradeWrapper: React.FC<IUpgradeWrapperProps> = ({ children }) => {
  // All features unlocked - no billing checks
  const renderProps: IUpgradeWrapperRenderProps = {
    badge: null,
    needsUpgrade: false,
    isCommunity: true,
    currentLevel: BillingProductLevel.Enterprise,
  };

  if (typeof children === 'function') {
    return children(renderProps);
  }

  return children ?? null;
};
