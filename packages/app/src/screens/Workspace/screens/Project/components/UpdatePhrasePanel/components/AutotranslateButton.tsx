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
import { useAutotranslate } from '../../../../../../../generated/reactQuery'
import {
  useCurrentWorkspace,
  useHasAbility,
} from '../../../../../../../hooks/workspace'
import { styled } from '../../../../../../../theme'

interface Props {
  onChange: (content: string) => void
  currentValue: {
    content: string | undefined
    languageId: string
  }
  languages: {
    content: string | undefined
    languageId: string
  }[]
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

interface GetDisabledStatus {
  hasAbility: boolean
  sourceTranslationAvailable: boolean
}

const getDisabledStatus = ({
  hasAbility,
  sourceTranslationAvailable,
}: GetDisabledStatus) => {
  if (!hasAbility) {
    return {
      isDisabled: true,
      message: 'You do not yet have access to AI features.',
    }
  }

  if (!sourceTranslationAvailable) {
    return {
      isDisabled: true,
      message:
        'At least one other language must have content before you can auto-translate.',
    }
  }

  return {
    isDisabled: false,
    message: '',
  }
}

export const AutotranslateButton = ({
  onChange,
  currentValue,
  languages,
}: Props) => {
  const canAutotranslate = useHasAbility('ai:use')
  const containerRef = useRef<HTMLDivElement>(null!)
  const contentRef = useRef<HTMLDivElement>(null!)
  const { id: workspaceId } = useCurrentWorkspace()
  const [isVisible, setIsVisible] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const { mutateAsync, isPending: isAutotranslating } = useAutotranslate({
    onSuccess: data => {
      setSuggestion(data.suggestion)
    },
  })
  const sourceLanguageId = languages.find(
    language =>
      language.content &&
      language.content.length > 0 &&
      language.languageId !== currentValue.languageId,
  )
  const autoTranslationDisabled =
    !sourceLanguageId ||
    (!!currentValue.content && currentValue.content.length > 0)

  useOutsideClick(contentRef, () => {
    if (isAutotranslating) {
      return
    }

    setIsVisible(false)
    setSuggestion(null)
  })

  const onRequestAutotranslate = () => {
    if (
      autoTranslationDisabled ||
      isAutotranslating ||
      !sourceLanguageId.content
    ) {
      return
    }

    setIsVisible(true)
    mutateAsync({
      body: {
        sourceLanguageId: sourceLanguageId.languageId,
        targetLanguageId: currentValue.languageId,
        content: sourceLanguageId.content,
        workspaceId,
      },
    })
  }

  const onApply = () => {
    if (!suggestion) {
      return
    }

    onChange(suggestion)
    setIsVisible(false)
    setSuggestion(null)
  }

  const { isDisabled, message } = getDisabledStatus({
    hasAbility: canAutotranslate,
    sourceTranslationAvailable: sourceLanguageId?.content !== undefined,
  })

  return (
    <>
      <Tooltip wrap isDisabled={!isDisabled} title={message} position="bottom">
        <div ref={containerRef}>
          <Button
            variation="secondary"
            isDisabled={isDisabled}
            size="xsmall"
            icon="sparkles"
            onAction={onRequestAutotranslate}
          >
            Autotranslate
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
          {isAutotranslating && (
            <Stack direction="row" alignItems="center" spacing="$space40">
              <Spinner color="$purple600" size={12} />

              <Text size="$size60" color="$purple600" variation="bold">
                AI is thinking...
              </Text>
            </Stack>
          )}

          {!isAutotranslating && suggestion && (
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
                    onAction={onRequestAutotranslate}
                  >
                    Try again
                  </MinimalButton>
                </Stack>
              </Box>
            </Stack>
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}
