import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { SubscriptionService } from './subscription.service'
import { SettingsService } from './settings.service'
import { ScheduleService } from './schedule.service'
import { MeteredService } from './metered.service'
import { ProducerService } from 'src/modules/worker/producer.service'

@Module({
  providers: [
    PrismaService,
    ProducerService,
    MeteredService,
    SettingsService,
    SubscriptionService,
    ScheduleService,
  ],
  exports: [SettingsService, SubscriptionService, MeteredService],
})
export class BillingModule {}
