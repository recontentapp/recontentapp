import { useQueryClient } from '@tanstack/react-query'
import {
  Button,
  ConfirmationModal,
  ConfirmationModalRef,
  Heading,
  Stack,
  toast,
} from 'design-system'
import { useMemo, useRef } from 'react'
import { FullpageSpinner } from '../../../../../components/FullpageSpinner'
import {
  getGetProjectQueryKey,
  useGetGlossary,
  useUnlinkGlossaryFromProject,
} from '../../../../../generated/reactQuery'
import { useHasAbility } from '../../../../../hooks/workspace'
import { Card } from '../../../components/Card'
import { useInfiniteListGlossaryTerms } from '../../Glossary/hooks'
import {
  ShowGlossaryTermModal,
  ShowGlossaryTermModalRef,
} from './ShowGlossaryTermModal'

interface Props {
  projectId: string
  glossaryId: string
}

export const ProjectGlossary = ({ projectId, glossaryId }: Props) => {
  const queryClient = useQueryClient()
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)
  const showGlossaryTermModalRef = useRef<ShowGlossaryTermModalRef>(null!)
  const canManageGlossaries = useHasAbility('glossaries:manage')
  const { mutateAsync: unlink, isPending: isUnlinking } =
    useUnlinkGlossaryFromProject({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetProjectQueryKey({
            queryParams: {
              id: projectId,
            },
          }),
        })
      },
    })

  const { data: glossary } = useGetGlossary({
    queryParams: {
      id: glossaryId,
    },
  })
  const { data } = useInfiniteListGlossaryTerms({
    glossaryId,
    pageSize: 100,
  })

  const terms = useMemo(() => {
    return data?.pages.flatMap(page => page.items) ?? []
  }, [data])

  if (!glossary) {
    return <FullpageSpinner />
  }

  return (
    <Stack direction="column" spacing="$space80">
      <Stack direction="row" alignItems="center" spacing="$space60">
        <Heading size="$size100" color="$gray14" renderAs="h2">
          Glossary
        </Heading>

        <ShowGlossaryTermModal ref={showGlossaryTermModalRef} />

        <Stack direction="row" alignItems="center" spacing="$space60">
          {canManageGlossaries && (
            <Button
              variation="secondary"
              icon="unlink"
              size="xsmall"
              isLoading={isUnlinking}
              onAction={() => {
                confirmationModalRef.current.confirm().then(result => {
                  if (!result) {
                    return
                  }

                  unlink({
                    body: {
                      projectId,
                      glossaryId,
                    },
                  }).then(() => {
                    toast('success', {
                      title: 'Glossary successfully unlinked',
                    })
                  })
                })
              }}
            >
              Unlink from project
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack renderAs="ul" direction="row" spacing="$space100">
        {terms.map(term => (
          <li key={term.id}>
            <Card
              onAction={() =>
                showGlossaryTermModalRef.current.open(glossary, term)
              }
              id={term.id}
              title={term.name}
              description={term.description ?? ''}
            />
          </li>
        ))}
      </Stack>

      <ConfirmationModal
        ref={confirmationModalRef}
        variation="danger"
        title="Are you sure about unlinking this glossary?"
        description="You can always link it again in the future."
      />
    </Stack>
  )
}
