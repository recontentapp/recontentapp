import { Popover } from '@reach/popover'
import {
  Box,
  Button,
  MinimalButton,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useOutsideClick,
} from 'design-system'
import { useRef, useState } from 'react'
import {
  useListPrompts,
  useRewritePhraseTranslation,
} from '../../../../../../../generated/reactQuery'
import {
  useCurrentWorkspace,
  useHasAbility,
} from '../../../../../../../hooks/workspace'
import { styled } from '../../../../../../../theme'

interface Props {
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
  display: 'block',
  width: '180px',
  textAlign: 'left',
  cursor: 'pointer',
  color: '$gray14',
  fontSize: '$size60',
  paddingX: '$space40',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  paddingY: '$space40',
  transition: 'background-color 0.2s ease-in-out',
  borderRadius: '$radius100',
  '&:hover': {
    backgroundColor: '$gray3',
  },
})

interface GetDisabledStatus {
  hasAbility: boolean
  content: string
  promptsCount: number
}

const getDisabledStatus = ({
  hasAbility,
  content,
  promptsCount,
}: GetDisabledStatus) => {
  if (!hasAbility) {
    return {
      isDisabled: true,
      message: 'You do not yet have access to AI features.',
    }
  }

  if (promptsCount === 0) {
    return {
      isDisabled: true,
      message:
        'Make sure to link AI prompts to this project to rewrite content in the "UX Writing" section.',
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

export const RewriteButton = ({ projectId, content, onChange }: Props) => {
  const canAutotranslate = useHasAbility('auto_translation:use')
  const containerRef = useRef<HTMLDivElement>(null!)
  const contentRef = useRef<HTMLDivElement>(null!)
  const { id: workspaceId } = useCurrentWorkspace()
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
    promptsCount: data?.items.length ?? 0,
  })

  const onRequestRewrite = (promptId: string) => {
    if (isRewriting) {
      return
    }

    rewrite({
      body: { promptId, content, workspaceId },
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
          zIndex: 100,
          width: status === 'suggestion' ? '400px' : '200px',
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
                      if (!selectedPromptId) {
                        return
                      }

                      onRequestRewrite(selectedPromptId)
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

              <Stack renderAs="ul" direction="column" spacing="$space40">
                {data?.items.map(prompt => (
                  <li>
                    <Prompt
                      onClick={() => {
                        setSelectedPromptId(prompt.id)
                        onRequestRewrite(prompt.id)
                      }}
                    >
                      {prompt.name}
                    </Prompt>
                  </li>
                ))}
              </Stack>
            </Stack>
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}
