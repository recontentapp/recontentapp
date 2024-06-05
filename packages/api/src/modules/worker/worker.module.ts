import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { ConsumerService } from './consumer.service'
import { ProducerService } from './producer.service'
import { MeteredService } from '../cloud/billing/metered.service'
import { DestinationService } from '../phrase/destination.service'
import { GitHubAppSyncService } from '../cloud/github-app/sync.service'

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
