import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Box,
  Button,
  ColumnConfig,
  ConfirmationModal,
  ConfirmationModalRef,
  DropdownButton,
  Filter,
  FilterRef,
  Icon,
  SelectField,
  Stack,
  Table,
  TableRef,
  Text,
  toast,
} from '../../../../../components/primitives'
import { useDebouncedUpdate } from '../../../../../hooks/debouncedEffect'
import { useFormatter } from '../../../../../hooks/formatter'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { formatRelative } from '../../../../../utils/dates'
import { useReferenceableAccounts } from '../../../hooks/referenceable'
import { EditPhraseKeyModal, EditPhraseKeyModalRef } from './EditPhraseKeyModal'
import { Search } from './Search'
import {
  useBatchDeletePhrase,
  useListProjectRevisions,
  useListProjectTags,
  useListWorkspaceLanguages,
} from '../../../../../generated/reactQuery'
import { Components } from '../../../../../generated/typeDefinitions'
import { QueryKey, useQueryClient } from '@tanstack/react-query'
import routes from '../../../../../routing'
import { ListTagsModal, ListTagsModalRef } from './ListTagsModal'
import { useModals } from '../../../hooks/modals'
import { TagsCell } from './TagsCell'

interface State {
  translated: string | undefined
  untranslated: string | undefined
  key: string
}

type StateFunction = (state: State) => State

interface PhrasesTableProps {
  isLoading: boolean
  project: Components.Schemas.Project
  revisionId: string
  phrases: Components.Schemas.PhraseItem[]
  phrasesTotalCount: number
  translated: string | undefined
  untranslated: string | undefined
  initialKey: string | undefined
  phrasesQueryKey: QueryKey
  setState: (fn: StateFunction) => void
  onRequestAdd: () => void
  onRequestTranslate: (index: number) => void
  onRequestDelete: (phraseId: string) => void
  onLoadMore?: () => void
}

export const PhrasesTable: FC<PhrasesTableProps> = ({
  isLoading,
  project,
  revisionId,
  phrases,
  phrasesTotalCount,
  phrasesQueryKey,
  initialKey,
  translated,
  untranslated,
  setState,
  onRequestAdd,
  onRequestTranslate,
  onRequestDelete,
  onLoadMore,
}) => {
  const [selectedPhrases, setSelectedPhrases] = useState<
    Components.Schemas.PhraseItem[]
  >([])
  const queryClient = useQueryClient()
  const { openCreateTag } = useModals()
  const tableRef = useRef<TableRef>(null!)
  const { getName } = useReferenceableAccounts()
  const { key: workspaceKey, id: workspaceId } = useCurrentWorkspace()
  const { mutateAsync: batchDeletePhrases } = useBatchDeletePhrase({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: phrasesQueryKey,
      })
    },
  })
  const { data: languages = [] } = useListWorkspaceLanguages({
    queryParams: { workspaceId },
  })
  const navigate = useNavigate()
  const formatter = useFormatter()
  const { data: revisions } = useListProjectRevisions({
    queryParams: { projectId: project.id, state: 'open' },
  })
  const filterRef = useRef<FilterRef>(null!)
  const editPhraseKeyModalRef = useRef<EditPhraseKeyModalRef>(null!)
  const listTagsModalRef = useRef<ListTagsModalRef>(null!)
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)
  const [localKey, setLocalKey] = useState('')
  const { data: tagsData } = useListProjectTags({
    queryParams: { projectId: project.id },
  })

  const onRequestEditKey = (phrase: Components.Schemas.PhraseItem) => {
    editPhraseKeyModalRef.current.open({ phrase })
  }

  const onRequestBatchDeletePhrases = (ids: string[]) => {
    confirmationModalRef.current.confirm().then(result => {
      if (!result) {
        return
      }

      batchDeletePhrases({
        body: { ids },
      })
        .then(() => {
          toast('success', {
            title: 'Phrases deleted',
          })
          tableRef.current.resetSelection()
        })
        .catch(() => {
          toast('error', {
            title: 'Could not delete phrases',
            description: 'Feel free to try later or contact us',
          })
        })
    })
  }

  useEffect(() => {
    if (translated) {
      filterRef.current.setValues('translated', translated)
      return
    }

    if (untranslated) {
      filterRef.current.setValues('untranslated', untranslated)
      return
    }

    filterRef.current.setValues(undefined, undefined)
  }, [translated, untranslated])

  useDebouncedUpdate(
    () => {
      setState(state => ({
        ...state,
        key: localKey,
      }))
    },
    [localKey],
    400,
  )

  const search = useMemo(
    () => ({
      initialValue: initialKey,
      placeholder: 'Search key...',
      onSearch: (query: string) => setLocalKey(query),
      onClear: () => {
        setState(state => ({
          ...state,
          key: '',
        }))
        setLocalKey('')
      },
    }),
    [],
  )

  const revisionOptions = useMemo(() => {
    if (!revisions) {
      return []
    }

    return revisions.items.map(revision => ({
      label: revision.name,
      value: revision.id,
    }))
  }, [revisions])

  const columns: ColumnConfig<Components.Schemas.PhraseItem, string>[] =
    useMemo(
      () => [
        {
          headerCell: 'Key',
          isPrimary: true,
          width: 320,
          key: 'key',
          bodyCell: phrase => (
            <span
              title={phrase.key}
              style={{
                maxWidth: 300,
                display: 'inline-block',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {phrase.key}
            </span>
          ),
        },
        {
          headerCell: 'Tags',
          key: 'tags',
          width: 200,
          withoutPadding: true,
          bodyCell: phrase => (
            <TagsCell
              phrase={phrase}
              phrasesQueryKey={phrasesQueryKey}
              onRequestTagCreate={() => openCreateTag(project)}
            />
          ),
        },
        {
          headerCell: 'Last updated by',
          key: 'updatedBy',
          bodyCell: phrase => (
            <span>{getName(phrase.updatedBy ?? phrase.createdBy)}</span>
          ),
        },
        {
          headerCell: 'Last updated on',
          width: 130,
          key: 'updatedAt',
          bodyCell: phrase => (
            <span>{formatRelative(new Date(phrase.updatedAt))}</span>
          ),
        },
        {
          headerCell: 'Actions',
          key: 'actions',
          width: 100,
          bodyCell: phrase => (
            <DropdownButton
              variation="minimal"
              icon="more"
              usePortal={false}
              items={[
                {
                  label: 'Edit key',
                  icon: 'edit',
                  onSelect: () => onRequestEditKey(phrase),
                },
                {
                  label: 'Delete',
                  icon: 'delete',
                  variation: 'danger',
                  onSelect: () => onRequestDelete(phrase.id),
                },
              ]}
            />
          ),
        },
      ],
      [getName],
    )

  return (
    <Stack direction="column" spacing="$space80">
      <ConfirmationModal
        ref={confirmationModalRef}
        title="Are you sure about deleting these phrases"
        description="Once deleted, phrases can not be recovered."
        variation="danger"
      />
      <ListTagsModal
        ref={listTagsModalRef}
        projectId={project.id}
        onRequestCreate={() => openCreateTag(project)}
        onTagDeleted={() => {}}
      />
      <EditPhraseKeyModal ref={editPhraseKeyModalRef} />

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing="$space60">
          <Stack direction="row" alignItems="center" spacing="$space20">
            <SelectField
              label="Revision"
              hideLabel
              options={revisionOptions}
              value={revisionId}
              onChange={revision =>
                navigate(
                  routes.projectPhrases.url({
                    pathParams: {
                      workspaceKey,
                      projectId: project.id,
                      revisionId: revision?.value ?? '',
                    },
                  }),
                )
              }
              headerLabel="Switch revisions"
              // footerAction={{
              //   label: 'Create revision',
              //   onAction: () => {},
              // }}
            />
          </Stack>

          <Stack direction="row" spacing="$space40" alignItems="center">
            <Icon src="translate" color="$gray12" size={16} />

            <Stack direction="row" spacing="$space40" alignItems="center">
              <Text size="$size80" color="$gray14" variation="bold">
                {formatter.format(phrasesTotalCount)}
              </Text>
              <Text size="$size80" color="$gray11">
                {phrasesTotalCount > 1 ? 'phrases' : 'phrase'}
              </Text>
            </Stack>
          </Stack>

          <Stack direction="row" spacing="$space40" alignItems="center">
            <Icon src="merge" color="$gray12" size={16} />

            <Stack direction="row" spacing="$space40" alignItems="center">
              <Text size="$size80" color="$gray14" variation="bold">
                {revisionOptions.length}
              </Text>
              <Text size="$size80" color="$gray11">
                {revisionOptions.length > 1 ? 'revisions' : 'revision'}
              </Text>
            </Stack>
          </Stack>

          <button
            style={{ cursor: 'pointer' }}
            onClick={() => listTagsModalRef.current.open()}
          >
            <Stack direction="row" spacing="$space40" alignItems="center">
              <Icon src="local_offer" color="$gray12" size={16} />

              <Stack direction="row" spacing="$space40" alignItems="center">
                <Text size="$size80" color="$gray14" variation="bold">
                  1
                </Text>
                <Text size="$size80" color="$gray11">
                  {(tagsData?.pagination.itemsCount ?? 0) > 1 ? 'tags' : 'tag'}
                </Text>
              </Stack>
            </Stack>
          </button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing="$space40">
          <Filter
            ref={filterRef}
            onSelect={value => {
              if (!value) {
                setState(state => ({
                  ...state,
                  translated: undefined,
                  untranslated: undefined,
                }))
                return
              }

              if (value.firstValue === 'translated') {
                setState(state => ({
                  ...state,
                  translated: value.secondValue,
                  untranslated: undefined,
                }))
                return
              }

              if (value.firstValue === 'untranslated') {
                setState(state => ({
                  ...state,
                  translated: undefined,
                  untranslated: value.secondValue,
                }))
                return
              }
            }}
            options={[
              {
                label: 'Translated',
                value: 'translated',
                text: 'in',
                options: languages.map(locale => ({
                  label: locale.name,
                  value: locale.id,
                })),
              },
              {
                label: 'Untranslated',
                value: 'untranslated',
                text: 'in',
                options: languages.map(locale => ({
                  label: locale.name,
                  value: locale.id,
                })),
              },
            ]}
          />

          <Search
            onChange={search.onSearch}
            initialValue={search.initialValue}
          />
        </Stack>
      </Stack>

      <Table
        isLoading={isLoading}
        primaryAction={{
          label: 'Quickly translate',
          icon: 'translate',
          onAction: (_phrase, index) => onRequestTranslate(index),
        }}
        footerLoadMore={onLoadMore}
        footerAddOnAction={onRequestAdd}
        items={phrases}
        columns={columns}
        tRef={tableRef}
        SelectionFooter={
          <Box paddingY="$space60" paddingX="$space80">
            <Stack
              direction="row"
              width="100%"
              spacing="$space100"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text size="$size80" color="$white" variation="bold">
                {selectedPhrases.length} selected phrase(s)
              </Text>

              <Stack direction="row" spacing="$space60" alignItems="center">
                <Button
                  variation="danger"
                  icon="delete"
                  size="xsmall"
                  isLoading={false}
                  onAction={() =>
                    onRequestBatchDeletePhrases(
                      selectedPhrases.map(phrase => phrase.id),
                    )
                  }
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          </Box>
        }
        onSelectionChange={setSelectedPhrases}
      />
    </Stack>
  )
}
