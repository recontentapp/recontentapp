import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { PrismaService } from 'src/utils/prisma.service'
import { UserConfirmedEvent } from 'src/modules/auth/events/user-confirmed.event'
import { SlackService } from './slack.service'

@Injectable()
export class WorkspaceListener {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly slackService: SlackService,
  ) {}

  @OnEvent('workspace.created', {
    suppressErrors: true,
    async: true,
  })
  async onUserConfirmed(event: UserConfirmedEvent) {
    const workspace = await this.prismaService.workspace.findUnique({
      where: { id: event.id },
      include: {
        accounts: {
          where: {
            role: 'owner',
          },
          include: {
            user: true,
          },
        },
      },
    })
    if (!workspace) {
      return
    }

    const firstOwner = workspace.accounts.at(0)?.user

    this.slackService.sendNotification({
      title: 'New workspace created',
      fields: [
        { title: 'ID', value: workspace.id },
        { title: 'Key', value: workspace.key },
        ...(firstOwner
          ? [
              {
                title: 'Owner',
                value: `${firstOwner.firstName} ${firstOwner.lastName} (${firstOwner.email})`,
              },
            ]
          : []),
      ],
    })
  }
}
