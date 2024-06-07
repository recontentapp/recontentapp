import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { MeteredService } from '../cloud/billing/metered.service'
import { GitHubAppSyncService } from '../cloud/github-app/sync.service'
import { DestinationService } from '../phrase/destination.service'
import { ConsumerService } from './consumer.service'
import { ProducerService } from './producer.service'

@Module({
  providers: [
    PrismaService,
    ConsumerService,
    ProducerService,
    MeteredService,
    DestinationService,
    GitHubAppSyncService,
  ],
  exports: [ConsumerService, ProducerService],
})
export class WorkerModule {}
