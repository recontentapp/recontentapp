import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'

import { PhraseService } from './phrase.service'
import { DestinationService } from './destination.service'
import { TranslateService } from './translate.service'

@Module({
  providers: [
    PrismaService,
    PhraseService,
    DestinationService,
    TranslateService,
  ],
  exports: [PhraseService, TranslateService, DestinationService],
})
export class PhraseModule {}
