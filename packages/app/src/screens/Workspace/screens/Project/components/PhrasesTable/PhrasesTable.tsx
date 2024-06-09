import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { QueryKey } from '@tanstack/react-query'
import {
  ColumnConfig,
  DropdownButton,
  Filter,
  FilterRef,
  Icon,
  SelectField,
  Stack,
  Table,
  TableRef,
  Text,
} from 'design-system'
import {
  useListProjectRevisions,
  useListProjectTags,
  useListWorkspaceLanguages,
} from '../../../../../../generated/reactQuery'
import { Components } from '../../../../../../generated/typeDefinitions'
import { useDebouncedUpdate } from '../../../../../../hooks/debouncedEffect'
import { useFormatter } from '../../../../../../hooks/formatter'
import { useCurrentWorkspace } from '../../../../../../hooks/workspace'
import routes from '../../../../../../routing'
import { formatRelative } from '../../../../../../utils/dates'
import { useModals } from '../../../../hooks/modals'
import { useReferenceableAccounts } from '../../../../hooks/referenceable'
import {
  EditPhraseKeyModal,
  EditPhraseKeyModalRef,
} from '../EditPhraseKeyModal'
import { ListTagsModal, ListTagsModalRef } from '../ListTagsModal'
import { Search } from '../Search'
import { TagsCell } from '../TagsCell'
import { SelectionFooter } from './components/SelectionFooter'

interface State {
  translated: string | undefined
  untranslated: string | undefined
  containsTags: string[]
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
  containsTags: string[]
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
  containsTags,
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
  const { openCreateTag } = useModals()
  const tableRef = useRef<TableRef>(null!)
  const { getName } = useReferenceableAccounts()
  const { key: workspaceKey, id: workspaceId } = useCurrentWorkspace()
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
  const [localKey, setLocalKey] = useState('')
  const { data: tagsData } = useListProjectTags({
    queryParams: { projectId: project.id },
  })

  const onRequestEditKey = (phrase: Components.Schemas.PhraseItem) => {
    editPhraseKeyModalRef.current.open({ phrase })
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

    if (containsTags.length > 0) {
      filterRef.current.setValues('containsTags', containsTags[0])
      return
    }

    filterRef.current.setValues(undefined, undefined)
  }, [translated, untranslated, containsTags])

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
      [getName, openCreateTag, phrasesQueryKey, project, onRequestDelete],
    )

  return (
    <Stack direction="column" spacing="$space80">
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
                  {tagsData?.pagination.itemsCount ?? 0}
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
                  containsTags: [],
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

              if (value.firstValue === 'containsTags') {
                setState(state => ({
                  ...state,
                  containsTags: [value.secondValue],
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
              {
                label: 'Contains tag',
                value: 'containsTags',
                text: '',
                options: (tagsData?.items ?? []).map(tag => ({
                  label: `${tag.key}:${tag.value}`,
                  value: tag.id,
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
          <SelectionFooter
            projectId={project.id}
            revisionId={project.masterRevisionId}
            phrasesQueryKey={phrasesQueryKey}
            selectedPhrases={selectedPhrases}
            onBatchSuccess={() => tableRef.current.resetSelection()}
          />
        }
        onSelectionChange={setSelectedPhrases}
      />
    </Stack>
  )
}
