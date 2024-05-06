import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { SubscriptionService } from './subscription.service'
import { SettingsService } from './settings.service'

@Module({
  providers: [PrismaService, SettingsService, SubscriptionService],
  exports: [SettingsService, SubscriptionService],
})
export class BillingModule {}
