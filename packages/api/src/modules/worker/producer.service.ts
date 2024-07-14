import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from '../../utils/config'
import { Message } from './types'

@Injectable()
export class ProducerService {
  sqsClient: SQSClient
  queueUrl: string | null

  constructor(private readonly configService: ConfigService<Config, true>) {
    const workerConfig = this.configService.get('worker', {
      infer: true,
    })

    this.sqsClient = new SQSClient({
      endpoint: workerConfig.sqsEndpoint || undefined,
    })

    if (workerConfig.available) {
      this.queueUrl = workerConfig.sqsQueueUrl
    }
  }

  getClient() {
    return this.sqsClient
  }

  async sendMessage(message: Message) {
    if (!this.queueUrl) {
      throw new BadRequestException('Worker SQS queue URL is not set')
    }

    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      }),
    )
  }
}
