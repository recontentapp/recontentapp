import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'

import { WorkspaceListener } from './listeners/workspace.listener'
import { MailerService } from './mailer.service'

@Module({
  providers: [PrismaService, MailerService, WorkspaceListener],
  exports: [MailerService],
})
export class NotificationsModule {}
