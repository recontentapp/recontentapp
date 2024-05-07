import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { SubscriptionService } from './subscription.service'
import { SettingsService } from './settings.service'
import { ScheduleService } from './schedule.service'

@Module({
  providers: [
    PrismaService,
    SettingsService,
    SubscriptionService,
    ScheduleService,
  ],
  exports: [SettingsService, SubscriptionService],
})
export class BillingModule {}
