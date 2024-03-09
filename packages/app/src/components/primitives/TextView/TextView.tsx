import { EditorContent, useEditor } from '@tiptap/react'
import { FC } from 'react'

import { styled, theme } from '../../../theme'
import { useExtensions } from '../../../tiptap'
import { TextViewProps } from './types'

const Container = styled('div', {
  '& .ProseMirror': {
    outline: 'none',
    fontSize: '$size80',
    lineHeight: '$lineHeight200',
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

const TextView: FC<TextViewProps> = ({ content }) => {
  const extensions = useExtensions()
  const editor = useEditor(
    {
      content,
      editable: false,
      extensions,
    },
    [extensions],
  )

  return (
    <Container>
      <EditorContent editor={editor} />
    </Container>
  )
}

export default TextView
