import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'

import { PhraseService } from './phrase.service'
import { DestinationService } from './destination.service'
import { TranslateService } from './translate.service'
import { MeteredService } from '../cloud/billing/metered.service'
import { GitHubAppSyncService } from '../cloud/github-app/sync.service'

@Module({
  providers: [
    PrismaService,
    PhraseService,
    DestinationService,
    GitHubAppSyncService,
    TranslateService,
    MeteredService,
  ],
  exports: [PhraseService, TranslateService, DestinationService],
})
export class PhraseModule {}
