interface BaseMessage {
  workspaceId: string
}

export interface PhraseUsageMessage extends BaseMessage {
  type: 'phrase-usage'
  workspaceId: string
}

export interface AutotranslationUsageMessage extends BaseMessage {
  type: 'autotranslation-usage'
  workspaceId: string
}

export interface DestinationSyncRequestMessage extends BaseMessage {
  type: 'destination-sync-request'
  destinationId: string
}

export type Message =
  | PhraseUsageMessage
  | AutotranslationUsageMessage
  | DestinationSyncRequestMessage
