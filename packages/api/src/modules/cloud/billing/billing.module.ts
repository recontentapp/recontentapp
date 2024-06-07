import { Module } from '@nestjs/common'
import { ProducerService } from 'src/modules/worker/producer.service'
import { PrismaService } from 'src/utils/prisma.service'
import { MeteredService } from './metered.service'
import { ScheduleService } from './schedule.service'
import { SettingsService } from './settings.service'
import { SubscriptionService } from './subscription.service'

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
