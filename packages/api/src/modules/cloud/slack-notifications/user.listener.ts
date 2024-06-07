import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { UserConfirmedEvent } from 'src/modules/auth/events/user-confirmed.event'
import { PrismaService } from 'src/utils/prisma.service'
import { SlackService } from './slack.service'

@Injectable()
export class UserListener {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly slackService: SlackService,
  ) {}

  @OnEvent('user.confirmed', {
    suppressErrors: true,
    async: true,
  })
  async onUserConfirmed(event: UserConfirmedEvent) {
    const user = await this.prismaService.user.findUnique({
      where: { id: event.id },
    })
    if (!user) {
      return
    }

    this.slackService.sendNotification({
      title: 'New user confirmed',
      fields: [
        { title: 'ID', value: user.id },
        { title: 'Email', value: user.email },
        { title: 'Provider', value: user.providerName },
      ],
    })
  }
}
