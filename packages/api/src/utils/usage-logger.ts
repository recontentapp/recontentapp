import ksuid from 'ksuid'
import { MyLogger } from './logger'

interface Params {
  externalId: string
  workspaceId: string
  metric: 'openai_token'
  quantity: number
  timestamp: Date
}

export class UsageLogger extends MyLogger {
  log({ externalId, workspaceId, metric, quantity, timestamp }: Params) {
    this.winston.log('info', 'Usage recorded', {
      service: 'usage_records',
      timestamp: timestamp.toISOString(),
      id: ksuid.randomSync().toString(),
      externalId,
      workspaceId,
      metric,
      quantity,
    })
  }
}
