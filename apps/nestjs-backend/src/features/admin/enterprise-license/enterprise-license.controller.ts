import { Controller, Get } from '@nestjs/common';
import { GET_ENTERPRISE_LICENSE_STATUS } from '@teable/openapi';
import { Public } from '../../auth/decorators/public.decorator';

/**
 * Mock Enterprise License Controller
 * Returns a valid (non-expired) license status for self-hosted instances.
 */
@Controller('api')
export class EnterpriseLicenseController {
  @Get(GET_ENTERPRISE_LICENSE_STATUS.replace('/api', ''))
  @Public()
  async getStatus() {
    // Return null expiredTime = license is valid/never expires
    return { expiredTime: null };
  }
}
