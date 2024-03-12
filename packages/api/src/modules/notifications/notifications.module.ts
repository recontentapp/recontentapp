import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'

import { MailerService } from './mailer.service'
import { UserListener } from './listeners/user.listener'
import { WorkspaceListener } from './listeners/workspace.listener'

@Module({
  providers: [PrismaService, MailerService, WorkspaceListener, UserListener],
  exports: [MailerService],
})
export class NotificationsModule {}
