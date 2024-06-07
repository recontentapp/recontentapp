import { BubbleMenu, Editor } from '@tiptap/react'
import { Icon } from 'design-system'
import { FC } from 'react'
import { styled } from '../../../theme'

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  height: 22,
  backgroundColor: '$purple700',
  border: '1px solid $purple600',
  borderRadius: '$radius100',
  boxShadow: '$shadow100',
})

const Button = styled('button', {
  position: 'relative',
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  borderRadius: '$radius100',
  transition: 'all 0.2s ease-in-out',
  variants: {
    active: {
      true: {
        backgroundColor: '$purple600',
      },
    },
  },
  '&:hover': {
    backgroundColor: '$purple600',
  },
  '&::before': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    content: 'X',
    opacity: 0,
  },
  '& svg': {
    pointerEvents: 'none',
  },
})

interface SelectionMenuProps {
  editor: Editor | null
}

export const SelectionMenu: FC<SelectionMenuProps> = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
      <Container>
        <Button
          type="button"
          onClick={() => {
            editor.chain().focus().toggleBold().run()
          }}
          active={editor.isActive('bold')}
        >
          <Icon src="format_bold" size={16} color="$purple100" />
        </Button>
        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          <Icon src="format_italic" size={16} color="$purple100" />
        </Button>
        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
        >
          <Icon src="format_strikethrough" size={16} color="$purple100" />
        </Button>
      </Container>
    </BubbleMenu>
  )
}
