import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { GlossaryService } from './glossary.service'
import { PromptService } from './prompt.service'

@Module({
  providers: [PrismaService, PromptService, GlossaryService],
  exports: [PromptService, GlossaryService],
})
export class UXWritingModule {}
