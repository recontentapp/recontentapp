import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'
import { backOff } from 'exponential-backoff'
import {
  CloudWatchLogsClient,
  GetQueryResultsCommand,
  PutLogEventsCommand,
  StartQueryCommand,
} from '@aws-sdk/client-cloudwatch-logs'

type Metric = 'token'

interface LogParams {
  workspaceId: string
  accountId: string
  externalId: string
  metric: Metric
  quantity: number
  timestamp: Date
}

interface GetUsageForPeriodParams {
  startTime: Date
  endTime: Date
  workspaceId: string
  metric: Metric
}

@Injectable()
export class MeteredService {
  private active: boolean
  private groupName: string
  private streamName: string
  private logsClient: CloudWatchLogsClient

  constructor(private readonly configService: ConfigService<Config, true>) {
    const { cloudWatchLogsGroupName, cloudWatchLogsStreamName } =
      this.configService.get('billing', { infer: true })
    this.active = !!cloudWatchLogsGroupName && !!cloudWatchLogsStreamName

    if (!this.active) {
      return
    }

    this.logsClient = new CloudWatchLogsClient()
    this.groupName = String(cloudWatchLogsGroupName)
    this.streamName = String(cloudWatchLogsStreamName)
  }

  async log({
    workspaceId,
    accountId,
    externalId,
    metric,
    quantity,
    timestamp,
  }: LogParams) {
    if (!this.active) {
      return
    }

    await this.logsClient.send(
      new PutLogEventsCommand({
        logGroupName: this.groupName,
        logStreamName: this.streamName,
        logEvents: [
          {
            timestamp: timestamp.getTime(),
            message: JSON.stringify({
              workspaceId,
              accountId,
              externalId,
              metric,
              quantity,
            }),
          },
        ],
      }),
    )
  }

  async getUsageForPeriod({
    startTime,
    endTime,
    workspaceId,
    metric,
  }: GetUsageForPeriodParams) {
    if (!this.active) {
      throw new BadRequestException('Metered service is not configured')
    }

    const queryResponse = await this.logsClient.send(
      new StartQueryCommand({
        logGroupName: this.groupName,
        startTime: startTime.getTime() / 1000,
        endTime: endTime.getTime() / 1000,
        queryString: `fields workspaceId, metric, quantity
          | filter workspaceId = "${workspaceId}"
          | filter metric = "${metric}"
          | stats sum(\`quantity\`) as total
        `,
      }),
    )

    const queryId = queryResponse.queryId
    if (!queryId) {
      throw new BadRequestException('Query failed')
    }

    const total = await backOff(
      async () => {
        const response = await this.logsClient.send(
          new GetQueryResultsCommand({
            queryId: queryId,
          }),
        )

        if (response.status !== 'Complete') {
          throw new Error('Query not complete')
        }

        const result = response.results?.at(0)
        if (!result) {
          throw new Error('No results')
        }

        const total = result.find(field => field.field === 'total')?.value
        if (!total) {
          throw new Error('No total')
        }

        return Number(total)
      },
      {
        delayFirstAttempt: true,
        jitter: 'none',
        startingDelay: 1000 * 2,
        numOfAttempts: 5,
      },
    ).catch(() => null)

    if (!total) {
      throw new BadRequestException('Query failed')
    }

    return total
  }
}
