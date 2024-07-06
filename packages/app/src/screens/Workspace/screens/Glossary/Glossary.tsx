import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, Stack, TextField } from 'design-system'
import { FullpageSpinner } from '../../../../components/FullpageSpinner'
import { Head } from '../../../../components/Head'
import { useGetGlossary } from '../../../../generated/reactQuery'
import { useDebouncedValue } from '../../../../hooks/debouncedEffect'
import { useCurrentWorkspace, useHasAbility } from '../../../../hooks/workspace'
import routes from '../../../../routing'
import { AddCard } from '../../components/AddCard'
import { Card } from '../../components/Card'
import { Page } from '../../components/Page'
import { ScreenWrapper } from '../../components/ScreenWrapper'
import {
  UpsertGlossaryTermModal,
  UpsertGlossaryTermModalRef,
} from './components/UpsertGlossaryTermModal'
import { useInfiniteListGlossaryTerms } from './hooks'

export const Glossary: FC = () => {
  const params = useParams<'glossaryId'>()
  const navigate = useNavigate()
  const { key: workspaceKey, name: workspaceName } = useCurrentWorkspace()
  const canManageGlossaries = useHasAbility('glossaries:manage')
  const upsertGlossaryTermModalRef = useRef<UpsertGlossaryTermModalRef>(null!)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500)
  const {
    data: glossary,
    isLoading: glossaryLoading,
    failureCount,
  } = useGetGlossary({
    queryParams: {
      id: params.glossaryId!,
    },
  })
  const { data, hasNextPage, fetchNextPage } = useInfiniteListGlossaryTerms({
    glossaryId: params.glossaryId!,
    query: debouncedSearchTerm.length > 0 ? debouncedSearchTerm : undefined,
    pageSize: 25,
  })

  const terms = useMemo(() => {
    return data?.pages.flatMap(page => page.items) ?? []
  }, [data])

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
          path: canManageGlossaries
            ? routes.workspaceSettingsGlossaries.url({
                pathParams: { workspaceKey },
              })
            : undefined,
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
      >
        <Stack direction="column" spacing="$space300">
          <Stack direction="row" spacing="$space100">
            <TextField
              label="Search term"
              placeholder="Search term..."
              hideLabel
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <Button
              variation="primary"
              icon="add"
              onAction={() =>
                upsertGlossaryTermModalRef.current.open(glossary, null)
              }
            >
              Add term
            </Button>
          </Stack>

          <Stack renderAs="ul" direction="row" spacing="$space100">
            {terms.map(term => (
              <li key={term.id}>
                <Card
                  onAction={() =>
                    upsertGlossaryTermModalRef.current.open(glossary, term)
                  }
                  id={term.id}
                  title={term.name}
                  description={term.description ?? ''}
                />
              </li>
            ))}

            {hasNextPage && (
              <AddCard
                title="Load more"
                icon="chevron_right"
                onAction={fetchNextPage}
              />
            )}
          </Stack>
        </Stack>

        <UpsertGlossaryTermModal ref={upsertGlossaryTermModalRef} />
      </Page>
    </ScreenWrapper>
  )
}
