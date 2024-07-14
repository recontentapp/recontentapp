import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { AIService } from './ai.service'
import { GlossaryService } from './glossary.service'
import { PromptService } from './prompt.service'

@Module({
  providers: [PrismaService, PromptService, GlossaryService, AIService],
  exports: [PromptService, GlossaryService, AIService],
})
export class UXWritingModule {}
