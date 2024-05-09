export interface Project {
  id: string
  workspace_id: string
  name: string
  description: string | null
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string | null
}

export interface Language {
  id: string
  locale: string
  name: string
  created_at: string
  created_by: string
  updated_at: string
  workspace_id: string
}

export type RevisionState = 'open' | 'merging' | 'closed'

export interface Revision {
  id: string
  project_id: string
  state: RevisionState
  name: string
  created_at: string
  updated_at: string
  merged_at: string
}

export interface CreateFigmaDocumentDTO {
  name: string
  url: string
  project_id: string
  revision_id: string
  language_id: string
}

export interface FigmaDocument {
  id: string
  project_id: string
  workspace_id: string
  revision_id: string
  language_id: string
  name: string
  url: string
  last_synced_at: string | null
  created_at: string
  Updated_at: string
  created_by: string
  updated_by: string | null
}

export interface PhraseInFigmaDocument {
  id: string
  phrase_key: string
  phrase_translation: string
}

export interface PhraseTranslationDTO {
  id: string
  project_id: string
  revision_id: string
  language_id: string
  phrase_key: string
  content: string
}

export interface ListPhrasesInFigmaDocumentParams {
  document_id: string
  limit?: number
  after?: string
}

export interface CreatePhraseDTO {
  document_id: string
  phrase_content: string
  phrase_key?: string
}

export interface BatchCreatePhraseDTO {
  document_id: string
  texts: string[]
}

export interface ConnectPhraseDTO {
  document_id: string
  phrase_key: string
}

export interface ListResult<Item> {
  has_more: boolean
  total_count: number
  data: Item[]
}

export interface UpdatePhraseForDocumentDTO {
  id: string
  document_id: string
  phrase_content: string
}

export interface SearchPhrasesDTO {
  document_id: string
  term: string
}
