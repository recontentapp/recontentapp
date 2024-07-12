import { Popover } from '@reach/popover'
import {
  Box,
  Button,
  Icon,
  MinimalButton,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useOutsideClick,
} from 'design-system'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useListPrompts,
  useRewritePhraseTranslation,
} from '../../../../../../../generated/reactQuery'
import {
  useCurrentWorkspace,
  useHasAbility,
} from '../../../../../../../hooks/workspace'
import routes from '../../../../../../../routing'
import { styled } from '../../../../../../../theme'
import { promptToneOptions } from '../../../../../../../utils/prompts'
import { ShowPromptModal, ShowPromptModalRef } from '../../ShowPromptModal'

interface Props {
  languageId: string
  projectId: string
  content: string
  onChange: (content: string) => void
}

const PopoverContent = styled('div', {
  backgroundColor: '$gray1',
  borderRadius: '$radius200',
  boxShadow: '$shadow200',
  fontSize: '$size60',
  border: '1px solid $gray6',
  marginTop: '$space40',
  paddingX: '$space60',
  paddingY: '$space80',
  maxHeight: 200,
  overflowY: 'auto',
})

const Prompt = styled('button', {
  flexGrow: 1,
  textAlign: 'left',
  cursor: 'pointer',
  minWidth: 0,
  fontSize: '$size60',
  paddingX: '$space40',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  paddingY: '$space40',
  transition: 'background-color 0.2s ease-in-out',
  backgroundColor: '$gray1',
  borderRadius: '$radius200',
  boxShadow: '$shadow200',
  border: '1px solid $gray6',
  color: '$gray14',
  '&:hover,&:focus': {
    backgroundColor: '$gray2',
  },
  '&:active': {
    backgroundColor: '$gray3',
  },
})

const AddMore = styled('button', {
  textAlign: 'left',
  cursor: 'pointer',
  minWidth: 0,
  fontSize: '$size60',
  paddingX: '$space40',
  fontWeight: 500,
  paddingY: '$space40',
  color: '$blue900',
  display: 'flex',
  alignItems: 'center',
  gap: '$space20',
  transition: 'color 0.2s ease-in-out',
  '&:hover,&:focus': {
    color: '$blue700',
  },
})

const SettingsButton = styled('button', {
  width: 24,
  height: 24,
  borderRadius: '$radius200',
  cursor: 'pointer',
  flexShrink: 0,
  '&:hover': {
    backgroundColor: '$gray3',
  },
  '&:active': {
    backgroundColor: '$gray4',
  },
})

interface GetDisabledStatus {
  hasAbility: boolean
  content: string
}

const getDisabledStatus = ({ hasAbility, content }: GetDisabledStatus) => {
  if (!hasAbility) {
    return {
      isDisabled: true,
      message: 'You do not yet have access to AI features.',
    }
  }

  if (content.length === 0) {
    return {
      isDisabled: true,
      message: 'Start typing to rewrite content.',
    }
  }

  return {
    isDisabled: false,
    message: '',
  }
}

export const RewriteButton = ({
  projectId,
  content,
  onChange,
  languageId,
}: Props) => {
  const navigate = useNavigate()
  const canAutotranslate = useHasAbility('auto_translation:use')
  const canManagePrompts = useHasAbility('prompts:manage')
  const containerRef = useRef<HTMLDivElement>(null!)
  const contentRef = useRef<HTMLDivElement>(null!)
  const showPromptModalRef = useRef<ShowPromptModalRef>(null!)
  const { id: workspaceId, key: workspaceKey } = useCurrentWorkspace()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const { data } = useListPrompts(
    {
      queryParams: { projectId, workspaceId },
    },
    {
      staleTime: Infinity,
    },
  )
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const { mutateAsync: rewrite, isPending: isRewriting } =
    useRewritePhraseTranslation({
      onSuccess: data => {
        setSuggestion(data.suggestion)
      },
    })

  useOutsideClick(contentRef, () => {
    if (isRewriting) {
      return
    }

    setIsVisible(false)
    setSuggestion(null)
    setSelectedPromptId(null)
  })

  const { isDisabled, message } = getDisabledStatus({
    hasAbility: canAutotranslate,
    content,
  })

  const onRequestRewrite = (promptId: string) => {
    if (isRewriting) {
      return
    }

    rewrite({
      body: { promptId, content, sourceLanguageId: languageId },
    })
  }

  const onApply = () => {
    if (!suggestion) {
      return
    }

    onChange(suggestion)
    setIsVisible(false)
    setSuggestion(null)
    setSelectedPromptId(null)
  }

  const customPrompts = data?.items ?? []
  const status = isRewriting
    ? 'loading'
    : suggestion !== null
      ? 'suggestion'
      : 'prompt'

  return (
    <>
      <Tooltip wrap isDisabled={!isDisabled} title={message} position="bottom">
        <div ref={containerRef}>
          <Button
            variation="secondary"
            isDisabled={isDisabled}
            size="xsmall"
            icon="sparkles"
            onAction={() => setIsVisible(true)}
          >
            Rewrite
          </Button>
        </div>
      </Tooltip>

      <Popover
        hidden={!isVisible}
        style={{
          zIndex: 4,
          width: status === 'suggestion' ? '400px' : '300px',
        }}
        targetRef={containerRef}
      >
        <PopoverContent ref={contentRef}>
          {status === 'loading' && (
            <Stack direction="row" alignItems="center" spacing="$space40">
              <Spinner color="$purple600" size={12} />

              <Text size="$size60" color="$purple600" variation="bold">
                AI is thinking...
              </Text>
            </Stack>
          )}

          {status === 'suggestion' && (
            <Stack direction="column" spacing="$space60">
              <Text size="$size60" color="$purple600" variation="bold">
                Here's a suggestion
              </Text>

              <Text size="$size60" lineHeight="$lineHeight200" color="$gray14">
                {suggestion}
              </Text>

              <Box position="sticky" bottom={0} backgroundColor="$white">
                <Stack direction="row">
                  <MinimalButton
                    variation="primary"
                    size="xsmall"
                    icon="check"
                    isDisabled={!suggestion}
                    onAction={onApply}
                  >
                    Apply
                  </MinimalButton>
                  <MinimalButton
                    variation="primary"
                    size="xsmall"
                    icon="refresh"
                    isDisabled={!selectedPromptId}
                    onAction={() => {
                      setSuggestion(null)
                    }}
                  >
                    Try again
                  </MinimalButton>
                </Stack>
              </Box>
            </Stack>
          )}

          {status === 'prompt' && (
            <Stack direction="column" spacing="$space60">
              <Text size="$size60" color="$purple600" variation="bold">
                Choose a prompt to rewrite
              </Text>

              <Stack
                renderAs="ul"
                direction="row"
                flexWrap="wrap"
                spacing="$space60"
              >
                {customPrompts.map(prompt => (
                  <Stack
                    renderAs="li"
                    direction="row"
                    flexWrap="nowrap"
                    justifyContent="space-between"
                    alignItems="center"
                    maxWidth={184}
                  >
                    <Prompt
                      onClick={() => {
                        setSelectedPromptId(prompt.id)
                        onRequestRewrite(prompt.id)
                      }}
                    >
                      {prompt.name}
                    </Prompt>

                    <SettingsButton
                      onClick={() => {
                        showPromptModalRef.current.open(prompt)
                      }}
                    >
                      <Icon src="settings" size={12} color="$gray14" />
                    </SettingsButton>
                  </Stack>
                ))}

                {customPrompts.length === 0 &&
                  promptToneOptions.map(option => (
                    <Stack
                      renderAs="li"
                      direction="row"
                      flexWrap="nowrap"
                      justifyContent="space-between"
                      alignItems="center"
                      maxWidth={184}
                    >
                      <Prompt
                        onClick={() => {
                          setSelectedPromptId(option.value)
                          onRequestRewrite(option.value)
                        }}
                      >
                        {option.label}
                      </Prompt>
                    </Stack>
                  ))}

                {customPrompts.length === 0 && canManagePrompts && (
                  <Stack
                    renderAs="li"
                    direction="row"
                    flexWrap="nowrap"
                    justifyContent="space-between"
                    alignItems="center"
                    maxWidth={184}
                  >
                    <AddMore
                      onClick={() => {
                        navigate(
                          routes.workspaceSettingsPrompts.url({
                            pathParams: {
                              workspaceKey,
                            },
                          }),
                        )
                      }}
                    >
                      <Icon src="add" size={12} color="$blue900" /> Create
                      custom ones
                    </AddMore>
                  </Stack>
                )}
              </Stack>
            </Stack>
          )}
        </PopoverContent>
      </Popover>

      <ShowPromptModal ref={showPromptModalRef} />
    </>
  )
}
