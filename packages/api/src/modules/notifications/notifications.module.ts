import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'

import { MailerService } from './mailer.service'
import { WorkspaceListener } from './listeners/workspace.listener'

@Module({
  providers: [PrismaService, MailerService, WorkspaceListener],
  exports: [MailerService],
})
export class NotificationsModule {}
