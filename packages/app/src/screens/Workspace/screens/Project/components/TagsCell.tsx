import { Popover } from '@reach/popover'
import { InfiniteData, QueryKey, useQueryClient } from '@tanstack/react-query'
import { Stack, Tag, Text } from 'design-system'
import { FC, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ApplyTagsToPhraseParameters,
  useApplyTagsToPhrase,
  useListProjectTags,
} from '../../../../../generated/reactQuery'
import { Components, Paths } from '../../../../../generated/typeDefinitions'
import { useOutsideClick } from '../../../../../hooks/outsideClick'
import { styled } from '../../../../../theme'
import { useReferenceableTags } from '../../../hooks/referenceable'

interface TagsCellProps {
  phrase: Components.Schemas.PhraseItem
  phrasesQueryKey: QueryKey
  onRequestTagCreate: () => void
}

const Cell = styled('div', {
  width: '100%',
  height: '100%',
  maxWidth: 208,
  overflowX: 'scroll',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '$gray2',
  },
})

const TagsCellAction = styled('button', {
  color: '$blue900',
  textAlign: 'center',
  display: 'block',
  width: '100%',
  fontWeight: 500,
  fontSize: '$size60',
  paddingX: '$space100',
  paddingY: '$space60',
  cursor: 'pointer',
  '&:hover,&:focus': {
    color: '$blue800',
  },
  '&:active': {
    color: '$blue700',
  },
})

const Input = styled('div', {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '$gray2',
  paddingX: '$space80',
  paddingY: '$space60',
  borderBottom: '1px solid $gray7',
  minHeight: 34,
})

const TagsPopover = styled('div', {
  width: 280,
  backgroundColor: '$white',
  // Offset border left
  marginLeft: 1,
  overflow: 'hidden',
  boxShadow: '$shadow300',
  borderRadius: '$radius200',
  border: '1px solid $gray7',
})

const List = styled('ul', {
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 240,
  overflowY: 'auto',
  paddingY: '$space60',
})

const ListItem = styled('button', {
  width: '100%',
  textAlign: 'left',
  paddingX: '$space80',
  paddingY: '$space40',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '$gray2',
  },
})

export const TagsCell: FC<TagsCellProps> = ({
  phrase,
  phrasesQueryKey,
  onRequestTagCreate,
}) => {
  const queryClient = useQueryClient()
  const params = useParams<'projectId' | 'revisionId'>()
  const [tags, setTags] = useState<string[]>([...phrase.tags])
  const { mutateAsync } = useApplyTagsToPhrase({
    onMutate: (variables: ApplyTagsToPhraseParameters) => {
      // Optimistically update the cache for tags
      queryClient.setQueryData<InfiniteData<Paths.ListPhrases.Responses.$200>>(
        phrasesQueryKey,
        data => {
          if (!data) {
            return data
          }

          return {
            ...data,
            pages: data.pages.map(page => {
              return {
                ...page,
                items: page.items.map(item => {
                  if (item.id === variables.body.phraseId) {
                    return {
                      ...item,
                      tags: variables.body.tagIds,
                    }
                  }

                  return item
                }),
              }
            }),
          }
        },
      )
    },
  })
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null!)
  const popoverRef = useRef<HTMLDivElement>(null!)
  const { data } = useListProjectTags(
    {
      queryParams: { projectId: params.projectId! },
    },
    {
      staleTime: Infinity,
    },
  )
  const { get } = useReferenceableTags(params.projectId!)

  const onRequestEdit = () => {
    setIsVisible(true)
  }

  const onSave = () => {
    mutateAsync({
      body: {
        phraseId: phrase.id,
        tagIds: tags,
      },
    })
  }

  useOutsideClick(popoverRef, () => {
    setIsVisible(false)
    onSave()
  })

  return (
    <Cell
      tabIndex={0}
      role="button"
      ref={containerRef}
      onFocus={onRequestEdit}
      onClick={onRequestEdit}
    >
      {isVisible && (
        <Popover
          targetRef={containerRef}
          ref={popoverRef}
          position={(containerRect, popoverRect) => {
            if (!containerRect || !popoverRect) {
              return {}
            }

            const spaceBelowContainer = window.innerHeight - containerRect.top
            const spaceAboveContainer =
              window.innerHeight - containerRect.height - spaceBelowContainer

            if (
              spaceBelowContainer > popoverRect.height ||
              (spaceAboveContainer < popoverRect.height &&
                spaceBelowContainer < popoverRect.height)
            ) {
              return {
                top: containerRect.top - 2,
                left: containerRect.left - 2,
              }
            }

            return {
              top: containerRect.top - popoverRect.height,
              left: containerRect.left - 2,
            }
          }}
        >
          <TagsPopover>
            <Stack direction="column">
              <Input>
                {tags.length > 0 ? (
                  <Stack direction="row" flexWrap="wrap" spacing="$space40">
                    {tags.map(tag => (
                      <Tag
                        key={tag}
                        {...get(tag)}
                        size="small"
                        onClose={() => {
                          setTags(previousTags =>
                            previousTags.filter(
                              previousTag => previousTag !== tag,
                            ),
                          )
                        }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Text size="$size80" color="$gray9">
                    Select a tag or create one...
                  </Text>
                )}
              </Input>

              <List>
                {(data?.items ?? []).length === 0 ? (
                  <li>
                    <TagsCellAction onClick={onRequestTagCreate}>
                      Create a new tag
                    </TagsCellAction>
                  </li>
                ) : (
                  (data?.items ?? []).map(tag => (
                    <li key={tag.id}>
                      <ListItem
                        onClick={() => {
                          const hasTag = tags.includes(tag.id)
                          if (!hasTag) {
                            setTags(previousTags => [...previousTags, tag.id])
                          }
                        }}
                      >
                        <Tag {...get(tag.id)} size="small" />
                      </ListItem>
                    </li>
                  ))
                )}
              </List>
            </Stack>
          </TagsPopover>
        </Popover>
      )}
      <Stack
        direction="row"
        spacing="$space20"
        flexWrap="nowrap"
        paddingLeft="$space60"
        paddingRight="$space60"
      >
        {phrase.tags.map(tag => (
          <Tag key={tag} size="small" {...get(tag)} />
        ))}
      </Stack>
    </Cell>
  )
}
