import { useEffect, useState } from 'react'
import {
  useGetProject,
  useListWorkspaceLanguages,
} from '../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../hooks/workspace'

export const useLanguagesSelector = () => {
  const { id: workspaceId } = useCurrentWorkspace()
  const { data: languagesData } = useListWorkspaceLanguages({
    queryParams: {
      workspaceId,
    },
  })
  const [languageId, setLanguageId] = useState<string | null>(null)
  useEffect(() => {
    if (!languagesData) {
      return
    }

    setLanguageId(languagesData.at(0)?.id ?? null)
  }, [languagesData])

  return {
    languageId,
    setLanguageId,
    languages: languagesData ?? [],
  }
}

export const useProjectLanguagesSelector = (projectId: string) => {
  const { data } = useGetProject({
    queryParams: {
      id: projectId,
    },
  })
  const [languageId, setLanguageId] = useState<string | null>(null)
  useEffect(() => {
    if (!data) {
      return
    }

    setLanguageId(data.languages.at(0)?.id ?? null)
  }, [data])

  return {
    languageId,
    setLanguageId,
    languages: data?.languages ?? [],
  }
}
