import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { FigmaService } from './figma.service'

@Module({
  providers: [PrismaService, FigmaService],
  exports: [FigmaService],
})
export class FigmaModule {}
