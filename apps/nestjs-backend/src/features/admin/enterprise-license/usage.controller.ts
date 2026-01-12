import { Controller, Get, Param } from '@nestjs/common';
import { GET_SPACE_USAGE, GET_BASE_USAGE } from '@teable/openapi';
import { Public } from '../../auth/decorators/public.decorator';

/**
 * Mock Usage Controller for Space and Base
 * Returns enterprise-level access with all features enabled.
 */
@Controller('api')
export class UsageController {
  private getEnterpriseUsage() {
    return {
      level: 'enterprise',
      limit: {
        // Numeric limits - set to very high values
        maxRows: Number.MAX_SAFE_INTEGER,
        maxSizeAttachments: Number.MAX_SAFE_INTEGER,
        maxNumDatabaseConnections: 1000,
        maxRevisionHistoryDays: 365,
        maxAutomationHistoryDays: 365,
        apiRateLimit: 100000,
        maxNumAutomationSendEmail: 100000,

        // Feature flags - all enabled
        automationEnable: true,
        auditLogEnable: true,
        adminPanelEnable: true,
        rowColoringEnable: true,
        buttonFieldEnable: true,
        fieldAIEnable: true,
        userGroupEnable: true,
        advancedExtensionsEnable: true,
        advancedPermissionsEnable: true,
        passwordRestrictedSharesEnable: true,
        authenticationEnable: true,
        domainVerificationEnable: true,
        organizationEnable: true,
        chatAIEnable: true,
        appEnable: true,
        customDomainEnable: true,
      },
    };
  }

  /**
   * Get usage for a specific space
   */
  @Get(GET_SPACE_USAGE.replace('/api', '').replace('{spaceId}', ':spaceId'))
  @Public()
  async getSpaceUsage(@Param('spaceId') _spaceId: string) {
    return this.getEnterpriseUsage();
  }

  /**
   * Get usage for a specific base
   */
  @Get(GET_BASE_USAGE.replace('/api', '').replace('{baseId}', ':baseId'))
  @Public()
  async getBaseUsage(@Param('baseId') _baseId: string) {
    return this.getEnterpriseUsage();
  }
}
