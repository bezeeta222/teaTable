import { Module } from '@nestjs/common';
import { EnterpriseLicenseController } from './enterprise-license.controller';
import { InstanceUsageController } from './instance-usage.controller';
import { SubscriptionController } from './subscription.controller';
import { UsageController } from './usage.controller';

@Module({
  controllers: [
    EnterpriseLicenseController,
    InstanceUsageController,
    SubscriptionController,
    UsageController,
  ],
})
export class EnterpriseLicenseModule {}
