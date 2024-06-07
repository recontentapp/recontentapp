import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'

import { MeteredService } from '../cloud/billing/metered.service'
import { GitHubAppSyncService } from '../cloud/github-app/sync.service'
import { ProducerService } from '../worker/producer.service'
import { DestinationSyncService } from './destination-sync.service'
import { DestinationService } from './destination.service'
import { PhraseService } from './phrase.service'
import { TranslateService } from './translate.service'

@Module({
  providers: [
    PrismaService,
    PhraseService,
    DestinationService,
    GitHubAppSyncService,
    DestinationSyncService,
    TranslateService,
    MeteredService,
    ProducerService,
  ],
  exports: [PhraseService, TranslateService, DestinationService],
})
export class PhraseModule {}
