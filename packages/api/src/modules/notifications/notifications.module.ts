import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'

import { MailerService } from './mailer.service'
import { UserCreatedListener } from './listeners/user-created.listener'

@Module({
  providers: [PrismaService, MailerService, UserCreatedListener],
  exports: [MailerService],
})
export class NotificationsModule {}
