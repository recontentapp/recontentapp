import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { WorkspaceInvitationCreatedEvent } from 'src/modules/workspace/events/invitation-created.event'
import { PrismaService } from 'src/utils/prisma.service'
import { MailerService } from '../mailer.service'

@Injectable()
export class WorkspaceListener {
  constructor(
    private prismaService: PrismaService,
    private mailerService: MailerService,
  ) {}

  @OnEvent('workspace.invitation.created', {
    suppressErrors: true,
    async: true,
  })
  async onWorkspaceInvitationCreated(event: WorkspaceInvitationCreatedEvent) {
    const invitation = await this.prismaService.workspaceInvitation.findUnique({
      where: {
        id: event.id,
      },
    })

    if (!invitation) {
      return
    }

    const inviter = await this.prismaService.workspaceAccount.findFirst({
      where: {
        workspaceId: invitation.workspaceId,
        id: invitation.createdBy,
      },
      include: {
        user: true,
      },
    })

    if (!inviter?.user) {
      return
    }

    this.mailerService.sendEmail({
      name: 'invitation',
      params: {
        to: invitation.email,
        subject: "You're invited to join a workspace on Recontent.app",
      },
      data: {
        invitationCode: invitation.invitationCode,
        inviterEmail: inviter.user.email,
        inviterName: `${inviter.user.firstName} ${inviter.user.lastName}`,
      },
    })
  }
}
