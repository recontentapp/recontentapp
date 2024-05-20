import { EditorContent, useEditor } from '@tiptap/react'
import { forwardRef, useImperativeHandle } from 'react'

import { useId } from '../../hooks/ids'
import { Box, Icon, Label, Stack, Text as UIText, theme } from 'design-system'
import { PhraseEditorProps, PhraseEditorRef } from './types'
import { styled } from '../../theme'
import { usePhraseExtensions } from '../../tiptap/hooks'

const Container = styled('div', {
  variants: {
    direction: {
      rtl: {
        '& .ProseMirror': {
          direction: 'rtl',
        },
      },
      ltr: {
        '& .ProseMirror': {
          direction: 'ltr',
        },
      },
    },
    variation: {
      error: {
        '& .ProseMirror': {
          outlineColor: theme.colors.red200,
          outlineOffset: -0.6,
          outlineStyle: 'auto',
          outlineWidth: 2,
          boxShadow:
            'rgba(47, 78, 178, 0.9) 0px 0px 0px 1px, rgba(47, 78, 178, 0.3) 0px 0px 0px 2px',
        },
      },
    },
  },
  '& .ProseMirror': {
    backgroundColor: '$white',
    border: '1px solid $gray7',
    borderRadius: '$radius200',
    lineHeight: '$lineHeight200',
    outline: 'none',
    minHeight: 100,
    maxHeight: 260,
    overflowY: 'auto',
    paddingX: '$space80',
    paddingY: '$space100',
    fontSize: '$size80',
    boxShadow: '$shadow100',
    '&:focus': {
      outlineColor: theme.colors.blue900,
      outlineOffset: -0.6,
      outlineStyle: 'auto',
      outlineWidth: 2,
      boxShadow:
        'rgba(47, 78, 178, 0.9) 0px 0px 0px 1px, rgba(47, 78, 178, 0.3) 0px 0px 0px 2px',
    },
    '> * + *': {
      marginTop: '0.75em',
    },
    '& a': {
      color: theme.colors.blue900,
      textDecoration: 'underline',
    },
    '& strong': {
      fontWeight: 600,
    },
    '& ul': {
      paddingLeft: '$space100',
      listStyle: 'disc',
      lineHeight: '$lineHeight200',
    },
    '& ol': {
      paddingLeft: '$space100',
      listStyle: 'auto',
      lineHeight: '$lineHeight200',
    },
    '& p.is-editor-empty:first-child::before': {
      color: '$gray9',
      content: 'attr(data-placeholder)',
      float: 'left',
      height: 0,
      pointerEvents: 'none',
    },
    '& span[data-type="mention"]': {
      color: '$blue900',
      fontWeight: 600,
    },
  },
})

const PhraseEditor = forwardRef<PhraseEditorRef, PhraseEditorProps>(
  (
    {
      label,
      hideLabel = false,
      autoFocus = false,
      direction = 'ltr',
      placeholder,
      onChange,
      onBlur,
      initialValue,
      error,
      info,
      id,
      name,
      hint,
      isDisabled,
      isOptional,
      width,
      maxWidth,
    },
    ref,
  ) => {
    const ID = useId(id)
    const extensions = usePhraseExtensions({ placeholder })
    const editor = useEditor(
      {
        autofocus: autoFocus,
        // TODO: create custom parser/transformer
        content: initialValue?.replaceAll('\n', '<br>'),
        editable: !isDisabled,
        onBlur: ({ event }) => {
          onBlur?.(event)
        },
        onUpdate: ({ editor }) => {
          onChange?.(editor.getText())
        },
        extensions,
      },
      [extensions, initialValue, isDisabled],
    )

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (!editor) {
          return
        }

        editor.commands.clearContent(true)
      },
    }))

    return (
      <Container
        variation={error ? 'error' : undefined}
        direction={direction}
        css={{ width, maxWidth }}
      >
        <Stack direction="column">
          <Box marginBottom={hideLabel ? undefined : '$space60'}>
            <Label
              id={ID}
              label={label}
              hideLabel={hideLabel}
              hint={hint}
              isOptional={isOptional}
            />
          </Box>

          <EditorContent
            editor={editor}
            id={id}
            name={name}
            disabled={isDisabled}
          />

          {(error || info) && (
            <Stack
              direction="row"
              spacing="$space40"
              alignItems="center"
              marginTop="$space60"
            >
              <Icon
                src="info"
                size={16}
                color={error ? '$red200' : '$gray10'}
              />
              <UIText size="$size80" color={error ? '$red100' : '$gray11'}>
                {error || info}
              </UIText>
            </Stack>
          )}
        </Stack>
      </Container>
    )
  },
)

export default PhraseEditor
