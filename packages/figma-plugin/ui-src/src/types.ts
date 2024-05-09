export interface FigmaText {
  content: string
  figmaId: string
  recontentId: string | null
  recontentKey: string | null
  recontentContent: string | null
}

export interface Initialized {
  type: 'initialized'
  data: {
    id: string | null
    name: string
    apiToken: string | null
    selectedTexts: FigmaText[]
    traversed: boolean
  }
}

export interface TextsSelected {
  type: 'textsSelected'
  data: {
    selectedTexts: FigmaText[]
    traversed: boolean
  }
}

export interface APITokenUpdateRequested {
  type: 'apiTokenUpdateRequested'
  data: string | null
}

export interface IDUpdateRequested {
  type: 'idUpdateRequested'
}

export interface ProjectCreated {
  type: 'projectCreated'
  data: {
    id: string
  }
}

export interface NotificationRequested {
  type: 'notificationRequested'
  data: {
    message: string
    error?: boolean
  }
}

export interface PhraseCreated {
  type: 'phraseCreated'
  data: {
    figmaId: string
    recontentId: string
    key: string
  }
}

export interface BatchPhraseCreated {
  type: 'batchPhraseCreated'
  data: Array<{
    figmaId: string
    recontentId: string
    key: string
  }>
}

export interface PhraseConnected {
  type: 'phraseConnected'
  data: {
    figmaId: string
    recontentId: string
    key: string
  }
}

export interface SyncRequested {
  type: 'syncRequested'
  // Phrases indexed by recontentId
  data: Record<
    string,
    {
      key: string
      translation: string
    }
  >
}

export interface SyncDone {
  type: 'syncDone'
}

export interface PhraseUpdated {
  type: 'phraseUpdated'
  data: {
    recontentId: string
    translation: string
    key: string
  }
}

export interface ResetRequested {
  type: 'resetRequested'
}

export type Receivable =
  | Initialized['type']
  | TextsSelected['type']
  | SyncDone['type']

export type Emittable =
  | APITokenUpdateRequested
  | IDUpdateRequested
  | NotificationRequested
  | ProjectCreated
  | PhraseCreated
  | BatchPhraseCreated
  | PhraseConnected
  | PhraseUpdated
  | SyncRequested
  | ResetRequested
