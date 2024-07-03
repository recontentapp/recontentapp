import { FC, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Stack } from 'design-system'
import { FullpageSpinner } from '../../../../components/FullpageSpinner'
import { Head } from '../../../../components/Head'
import { useGetGlossary } from '../../../../generated/reactQuery'
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
  const {
    data: glossary,
    isLoading: glossaryLoading,
    failureCount,
  } = useGetGlossary({
    queryParams: {
      id: params.glossaryId!,
    },
  })
  const { data } = useInfiniteListGlossaryTerms({
    glossaryId: params.glossaryId!,
    pageSize: 100,
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
          <AddCard
            title="Create a term"
            description="It can be something specific to your business, mobile app or a feature."
            onAction={() =>
              upsertGlossaryTermModalRef.current.open(glossary, null)
            }
          />
        </Stack>

        <UpsertGlossaryTermModal ref={upsertGlossaryTermModalRef} />
      </Page>
    </ScreenWrapper>
  )
}
