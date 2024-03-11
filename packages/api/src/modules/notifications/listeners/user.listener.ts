import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { UserCreatedEvent } from 'src/modules/auth/events/user-created.event'
import { MailerService } from '../mailer.service'
import { PrismaService } from 'src/utils/prisma.service'
import { MyLogger } from 'src/utils/logger'

@Injectable()
export class UserListener {
  private readonly logger = new MyLogger()

  constructor(
    private prismaService: PrismaService,
    private mailerService: MailerService,
  ) {}

  @OnEvent('user.created')
  async onUserCreated(event: UserCreatedEvent) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: event.id,
        providerName: 'email',
      },
    })

    if (!user) {
      return
    }

    if (!user.confirmationCode) {
      this.logger.warn('User has no confirmation code', {
        userId: user.id,
      })
      return
    }

    this.mailerService.sendEmail({
      name: 'confirmation-code',
      params: {
        to: user.email,
        subject: 'Confirm your Recontent.app account',
      },
      data: {
        confirmationCode: user.confirmationCode,
      },
    })
  }
}
