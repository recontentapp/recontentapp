import { Module } from '@nestjs/common'
import { SlackService } from './slack.service'
import { UserListener } from './user.listener'
import { WorkspaceListener } from './workspace.listener'
import { PrismaService } from 'src/utils/prisma.service'

@Module({
  providers: [PrismaService, SlackService, UserListener, WorkspaceListener],
  exports: [SlackService],
})
export class SlackNotificationsModule {}
