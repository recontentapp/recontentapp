import {
  BatchCreatePhraseDTO,
  ConnectPhraseDTO,
  CreateFigmaDocumentDTO,
  CreatePhraseDTO,
  FigmaDocument,
  Language,
  ListPhrasesInFigmaDocumentParams,
  ListResult,
  PhraseInFigmaDocument,
  PhraseTranslationDTO,
  Project,
  Revision,
  SearchPhrasesDTO,
  UpdatePhraseForDocumentDTO,
} from './types'
import { Request } from '../request'

export const listProjects = (request: Request) => async () => {
  const response = await request<{ data: Project[] }>({
    path: '/ListProjects',
    method: 'get',
  })

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  return response.data.data
}

export const listLanguagesByProject =
  ({ request, projectId }: { request: Request; projectId: string }) =>
  async () => {
    const response = await request<{ data: Language[] }>({
      path: '/ListLanguagesInProject',
      method: 'get',
      params: {
        project_id: projectId,
      },
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return response.data.data
  }

export const listRevisionsByProject =
  ({ projectId, request }: { projectId: string; request: Request }) =>
  async () => {
    const response = await request<{ data: Revision[] }>({
      path: '/ListRevisionsInProject',
      method: 'get',
      params: {
        project_id: projectId,
      },
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return response.data.data
  }

export const createFigmaDocument =
  (request: Request) => async (dto: CreateFigmaDocumentDTO) => {
    const response = await request<
      { data: string },
      unknown,
      unknown,
      CreateFigmaDocumentDTO
    >({
      path: '/CreateFigmaDocument',
      method: 'post',
      body: dto,
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return response.data.data
  }

export const getFigmaDocument =
  (request: Request, documentId: string) => async () => {
    const response = await request<{ data: FigmaDocument }>({
      path: '/GetFigmaDocument',
      method: 'get',
      params: {
        document_id: documentId,
      },
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return response.data.data
  }

export const syncFigmaDocument =
  (request: Request) => async (documentId: string) => {
    const response = await request({
      path: '/SyncFigmaDocument',
      method: 'post',
      body: {
        document_id: documentId,
      },
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
  }

export const listPhrasesInFigmaDocument = async ({
  params,
  request,
}: {
  params: ListPhrasesInFigmaDocumentParams
  request: Request
}) => {
  const response = await request<
    ListResult<PhraseInFigmaDocument>,
    unknown,
    ListPhrasesInFigmaDocumentParams
  >({
    path: '/ListPhrasesInFigmaDocument',
    method: 'get',
    params,
  })

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  return response.data
}

export const searchPhrases =
  ({ params, request }: { params: SearchPhrasesDTO; request: Request }) =>
  async () => {
    const response = await request<
      ListResult<PhraseTranslationDTO>,
      unknown,
      SearchPhrasesDTO
    >({
      path: '/SearchPhrases',
      method: 'get',
      params,
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return response.data.data
  }

export const createPhrase =
  (request: Request) => async (body: CreatePhraseDTO) => {
    const response = await request<
      { data: PhraseInFigmaDocument },
      unknown,
      unknown,
      CreatePhraseDTO
    >({
      path: '/CreatePhrase',
      method: 'post',
      body,
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return response.data.data
  }

export const batchCreatePhrase =
  (request: Request) => async (body: BatchCreatePhraseDTO) => {
    const response = await request<
      { data: PhraseInFigmaDocument[] },
      unknown,
      unknown,
      BatchCreatePhraseDTO
    >({
      path: '/BatchCreatePhrases',
      method: 'post',
      body,
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return response.data.data
  }

export const connectPhrase =
  (request: Request) => async (body: ConnectPhraseDTO) => {
    const response = await request<
      { data: PhraseInFigmaDocument },
      unknown,
      unknown,
      ConnectPhraseDTO
    >({
      path: '/ConnectPhrase',
      method: 'post',
      body,
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return response.data.data
  }

export const updatePhraseForDocument =
  (request: Request) => async (body: UpdatePhraseForDocumentDTO) => {
    const response = await request<
      { data: PhraseInFigmaDocument },
      unknown,
      unknown,
      UpdatePhraseForDocumentDTO
    >({
      path: '/UpdatePhraseForDocument',
      method: 'post',
      body,
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return response.data.data
  }

export const deleteFigmaDocument = (request: Request) => async (id: string) => {
  const response = await request({
    path: '/DeleteFigmaDocument',
    method: 'delete',
    body: {
      id,
    },
  })

  if (!response.ok && response.statusCode !== 404) {
    throw new Error('Network response was not ok')
  }
}
