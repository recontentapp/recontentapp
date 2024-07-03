export interface AIResult {
  result: string
  usage: {
    inputTokensCount: number
    outputTokensCount: number
  }
}

export interface ProcessParams {
  prompt: string
  query: string
  resultFormat: 'text' | 'json'
}

export interface AIProvider {
  process: (params: ProcessParams) => Promise<AIResult>
}
