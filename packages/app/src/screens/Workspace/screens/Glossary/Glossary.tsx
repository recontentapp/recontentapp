import { FC, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Box, Button, SelectField } from 'design-system'
import { FullpageSpinner } from '../../../../components/FullpageSpinner'
import { Head } from '../../../../components/Head'
import {
  useGetGlossary,
  useListWorkspaceLanguages,
} from '../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../hooks/workspace'
import routes from '../../../../routing'
import { Page } from '../../components/Page'
import { ScreenWrapper } from '../../components/ScreenWrapper'
import { AddPanel } from './components/AddPanel'
import { useInfiniteListGlossaryTerms } from './hooks'

export const Glossary: FC = () => {
  const params = useParams<'glossaryId'>()
  const navigate = useNavigate()
  const {
    id: workspaceId,
    key: workspaceKey,
    name: workspaceName,
  } = useCurrentWorkspace()
  const { data: languagesData } = useListWorkspaceLanguages({
    queryParams: {
      workspaceId,
    },
  })
  const [isAdding, setIsAdding] = useState(false)
  const [languageId, setLanguageId] = useState<string | null>(null)
  const {
    data: glossary,
    isLoading: glossaryLoading,
    failureCount,
  } = useGetGlossary({
    queryParams: {
      id: params.glossaryId!,
    },
  })
  const { data, fetchNextPage, hasNextPage } = useInfiniteListGlossaryTerms(
    {
      glossaryId: params.glossaryId!,
      languageId: String(languageId),
      pageSize: 100,
    },
    { enabled: !!languageId },
  )

  const terms = useMemo(() => {
    return data?.pages.flatMap(page => page.items) ?? []
  }, [data])

  useEffect(() => {
    if (!languagesData) {
      return
    }

    setLanguageId(languagesData.at(0)?.id ?? null)
  }, [languagesData])

  useEffect(() => {
    if (failureCount > 0) {
      navigate(routes.dashboard.url({ pathParams: { workspaceKey } }))
    }
  }, [failureCount, navigate, workspaceKey])

  if (glossaryLoading || !glossary) {
    return <FullpageSpinner />
  }

  return (
    <ScreenWrapper
      breadcrumbItems={[
        {
          label: workspaceName,
          path: routes.dashboard.url({ pathParams: { workspaceKey } }),
        },
        {
          label: 'Glossaries',
        },
        {
          label: glossary.name,
          path: routes.glossary.url({
            pathParams: {
              workspaceKey,
              glossaryId: glossary.id,
            },
          }),
        },
      ]}
    >
      <Head title={glossary.name} />
      <Page
        title={glossary.name}
        description={glossary.description ? glossary.description : undefined}
        panel={
          isAdding && languageId ? (
            <AddPanel languageId={languageId} />
          ) : undefined
        }
      >
        <SelectField
          label="Language"
          placeholder="Language"
          value={languageId ?? undefined}
          onChange={option => {
            if (!option) {
              return
            }

            setLanguageId(option.value)
          }}
          options={
            languagesData?.map(l => ({
              label: l.name,
              value: l.id,
            })) ?? []
          }
        />
        {terms.map(term => (
          <p>{term.name}</p>
        ))}

        <Box display="block">
          <Button onAction={() => setIsAdding(true)} variation="primary">
            Add term
          </Button>
        </Box>
      </Page>
    </ScreenWrapper>
  )
}
