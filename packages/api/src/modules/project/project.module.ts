import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'

import { ProjectService } from './project.service'

@Module({
  providers: [PrismaService, ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
