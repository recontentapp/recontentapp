import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'

import { ProjectService } from './project.service'
import { TagService } from './tag.service'

@Module({
  providers: [PrismaService, ProjectService, TagService],
  exports: [ProjectService, TagService],
})
export class ProjectModule {}
