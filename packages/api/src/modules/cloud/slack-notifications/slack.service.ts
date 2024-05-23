import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Requester } from 'src/modules/auth/requester.object'
import { Config } from 'src/utils/config'

interface SendFeedbackParams {
  requester: Requester
  workspaceId: string
  message: string
  referrer: string
}

interface NotificationField {
  title: string
  value: string
}

interface SendNotificationParams {
  title: string
  fields: NotificationField[]
}

@Injectable()
export class SlackService {
  constructor(private readonly configService: ConfigService<Config, true>) {}

  async sendNotification({ title, fields }: SendNotificationParams) {
    const webhookUrl = this.configService.get('slack.notificationsWebhookUrl', {
      infer: true,
    })
    if (!webhookUrl) {
      throw new BadRequestException('Slack notifications are not configured')
    }

    await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: title,
            },
            fields: fields.map(f => ({
              type: 'mrkdwn',
              text: `*${f.title}*\n${f.value}`,
            })),
          },
          {
            type: 'divider',
          },
        ],
      }),
    })
  }

  async sendFeedback({
    requester,
    workspaceId,
    message,
    referrer,
  }: SendFeedbackParams) {
    const webhookUrl = this.configService.get('slack.feedbacksWebhookUrl', {
      infer: true,
    })
    if (!webhookUrl) {
      throw new BadRequestException('Slack feedbacks are not configured')
    }

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')
    const user = requester.getUserDetails()
    const workspace = workspaceAccess.getWorkspaceDetails()

    await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message,
            },
            fields: [
              {
                type: 'mrkdwn',
                text: `*User*\n${user.firstName} ${user.lastName} (${requester.getUserEmail()})`,
              },
              {
                type: 'mrkdwn',
                text: `*Workspace*\n${workspace.key} (${workspace.id})`,
              },
              {
                type: 'mrkdwn',
                text: `*Referrer*\n${referrer}`,
              },
            ],
          },
          {
            type: 'divider',
          },
        ],
      }),
    })
  }
}
