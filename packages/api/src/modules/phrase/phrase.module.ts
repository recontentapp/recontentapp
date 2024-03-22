import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'

import { PhraseService } from './phrase.service'

@Module({
  providers: [PrismaService, PhraseService],
  exports: [PhraseService],
})
export class PhraseModule {}
