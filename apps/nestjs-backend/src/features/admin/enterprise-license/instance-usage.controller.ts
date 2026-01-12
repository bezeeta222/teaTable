import { Controller, Get } from '@nestjs/common';
import { GET_INSTANCE_USAGE } from '@teable/openapi';
import { Public } from '../../auth/decorators/public.decorator';

/**
 * Mock Instance Usage Controller
 * Returns enterprise-level access with all features enabled for self-hosted instances.
 */
@Controller('api')
export class InstanceUsageController {
  @Get(GET_INSTANCE_USAGE)
  @Public()
  async getUsage() {
    // Return enterprise level with all features enabled
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
}
