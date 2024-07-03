import { useQueryClient } from '@tanstack/react-query'
import {
  Button,
  ConfirmationModal,
  ConfirmationModalRef,
  Heading,
  SelectField,
  Stack,
  Table,
  toast,
} from 'design-system'
import { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getGetProjectQueryKey,
  useUnlinkGlossaryFromProject,
} from '../../../../../generated/reactQuery'
import {
  useCurrentWorkspace,
  useHasAbility,
} from '../../../../../hooks/workspace'
import routes from '../../../../../routing'
import { useProjectLanguagesSelector } from '../../../hooks/languages'
import { useInfiniteListGlossaryTerms } from '../../Glossary/hooks'

interface Props {
  projectId: string
  glossaryId: string
}

export const ProjectGlossary = ({ projectId, glossaryId }: Props) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { key: workspaceKey } = useCurrentWorkspace()
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)
  const canManageGlossaries = useHasAbility('glossaries:manage')
  const { languageId, setLanguageId, languages } =
    useProjectLanguagesSelector(projectId)
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

  const { data, fetchNextPage, hasNextPage, isPending } =
    useInfiniteListGlossaryTerms({
      glossaryId,
      pageSize: 100,
    })

  const terms = useMemo(() => {
    return data?.pages.flatMap(page => page.items) ?? []
  }, [data])

  return (
    <Stack direction="column" spacing="$space80">
      <Stack
        direction="row"
        alignItems="center"
        spacing="$space60"
        justifyContent="space-between"
      >
        <Stack direction="row" alignItems="center" spacing="$space80">
          <Heading size="$size100" color="$gray14" renderAs="h2">
            Glossary
          </Heading>

          <SelectField
            label="Language"
            placeholder="Language"
            hideLabel
            value={languageId ?? undefined}
            onChange={option => {
              if (!option) {
                return
              }

              setLanguageId(option.value)
            }}
            options={languages.map(l => ({
              label: l.name,
              value: l.id,
            }))}
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing="$space60">
          {canManageGlossaries && (
            <>
              <Button
                variation="primary"
                icon="edit"
                size="xsmall"
                onAction={() => {
                  navigate(
                    routes.glossary.url({
                      pathParams: { workspaceKey, glossaryId },
                    }),
                  )
                }}
              >
                Update
              </Button>
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
            </>
          )}
        </Stack>
      </Stack>

      <Table
        isLoading={isPending}
        footerLoadMore={hasNextPage ? fetchNextPage : undefined}
        items={terms}
        columns={[
          {
            key: 'label',
            isPrimary: true,
            width: 100,
            headerCell: 'Label',
            bodyCell: item => item.name,
          },
          {
            key: 'description',
            headerCell: 'Description',
            bodyCell: item => item.description,
          },
        ]}
      />

      <ConfirmationModal
        ref={confirmationModalRef}
        variation="danger"
        title="Are you sure about unlinking this glossary?"
        description="You can always link it again in the future."
      />
    </Stack>
  )
}
