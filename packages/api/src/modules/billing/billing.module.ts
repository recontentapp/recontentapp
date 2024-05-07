import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { SubscriptionService } from './subscription.service'
import { SettingsService } from './settings.service'
import { ScheduleService } from './schedule.service'
import { SQSService } from 'src/utils/sqs.service'
import { MeteredService } from './metered.service'

@Module({
  providers: [
    PrismaService,
    SQSService,
    MeteredService,
    SettingsService,
    SubscriptionService,
    ScheduleService,
  ],
  exports: [SettingsService, SubscriptionService, MeteredService],
})
export class BillingModule {}
