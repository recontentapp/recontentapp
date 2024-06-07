import { Message as RawMessage } from '@aws-sdk/client-sqs'
import { BeforeApplicationShutdown, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Consumer } from 'sqs-consumer'
import { MeteredService } from 'src/modules/cloud/billing/metered.service'
import { DestinationService } from 'src/modules/phrase/destination.service'
import { Config } from 'src/utils/config'
import { MyLogger } from 'src/utils/logger'
import { ProducerService } from './producer.service'
import { Message } from './types'

@Injectable()
export class ConsumerService implements BeforeApplicationShutdown {
  private sqsConsumer?: Consumer
  private logger: MyLogger

  constructor(
    private readonly configService: ConfigService<Config, true>,
    private readonly sqsService: ProducerService,
    private readonly meteredService: MeteredService,
    private readonly destinationService: DestinationService,
  ) {
    this.logger = new MyLogger()

    const workerConfig = this.configService.get('worker', {
      infer: true,
    })
    if (!workerConfig.available) {
      return
    }

    this.sqsConsumer = Consumer.create({
      waitTimeSeconds: 20, // Long polling
      queueUrl: workerConfig.sqsQueueUrl,
      handleMessage: this.handleMessage.bind(this),
      sqs: this.sqsService.getClient(),
    })

    this.sqsConsumer.on('message_processed', message => {
      this.logger.log('Message processed', {
        service: 'worker',
        statusCode: 200,
        messageId: message.MessageId,
        messageBody: message.Body,
      })
    })

    this.sqsConsumer.on('processing_error', (error, message) => {
      this.logger.error('Message processed', {
        service: 'worker',
        statusCode: 500,
        messageId: message.MessageId,
        errorMessage: error.message,
        messageBody: message.Body,
      })
    })

    this.sqsConsumer.start()
  }

  private static isValidMessage(message: unknown): message is Message {
    return typeof message === 'object' && message !== null && 'type' in message
  }

  async beforeApplicationShutdown() {
    this.sqsConsumer?.stop()
  }

  async handleMessage(rawMessage: RawMessage) {
    const message = JSON.parse(rawMessage.Body ?? '{}')
    if (!ConsumerService.isValidMessage(message)) {
      console.error('Invalid message received', message)
      return
    }

    switch (message.type) {
      case 'autotranslation-usage': {
        await this.meteredService.reportDailyAutotranslationUsage({
          workspaceId: message.workspaceId,
        })
        break
      }

      case 'phrase-usage': {
        await this.meteredService.reportPhrasesUsage({
          workspaceId: message.workspaceId,
        })
        break
      }

      case 'destination-sync-request': {
        await this.destinationService.syncDestination({
          destinationId: message.destinationId,
          requester: null,
        })
      }
    }
  }
}
