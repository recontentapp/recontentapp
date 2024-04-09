import { MyLogger } from './logger'

interface Params {
  id: string
  workspaceId: string
  metric: 'openai_token'
  quantity: number
  timestamp: Date
}

export class UsageLogger extends MyLogger {
  log({ id, workspaceId, metric, quantity, timestamp }: Params) {
    this.winston.log('info', 'Usage recorded', {
      service: 'usage_records',
      id,
      workspaceId,
      metric,
      quantity,
      timestamp: timestamp.toISOString(),
    })
  }
}
