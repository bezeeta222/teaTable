import { Controller, Get, Param } from '@nestjs/common';
import {
  GET_SUBSCRIPTION_SUMMARY,
  GET_SUBSCRIPTION_SUMMARY_LIST,
} from '@teable/openapi';
import { Public } from '../../auth/decorators/public.decorator';

/**
 * Mock Subscription Controller
 * Returns enterprise-level subscription for all spaces.
 */
@Controller('api')
export class SubscriptionController {
  /**
   * Get subscription summary for a specific space
   */
  @Get(GET_SUBSCRIPTION_SUMMARY.replace('/api', '').replace('{spaceId}', ':spaceId'))
  @Public()
  async getSubscriptionSummary(@Param('spaceId') spaceId: string) {
    return {
      spaceId,
      status: 'active',
      level: 'enterprise',
    };
  }

  /**
   * Get subscription summary list for all spaces
   * Returns empty array - will be populated dynamically by space queries
   */
  @Get(GET_SUBSCRIPTION_SUMMARY_LIST.replace('/api', ''))
  @Public()
  async getSubscriptionSummaryList() {
    // Return empty array - individual space queries will return enterprise level
    return [];
  }
}
