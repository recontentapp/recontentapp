import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'

import { WorkspaceService } from './workspace.service'

@Module({
  providers: [PrismaService, WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
