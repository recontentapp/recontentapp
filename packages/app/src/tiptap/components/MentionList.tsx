import { MentionOptions } from '@tiptap/extension-mention'
import { ReactRenderer } from '@tiptap/react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import tippy from 'tippy.js'

import { styled } from '../../theme'

type MentionListProps = MentionOptions['suggestion']

const Container = styled('div', {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  color: 'rgba(0, 0, 0, 0.8)',
  overflow: 'hidden',
  minWidth: 'min-content',
  backgroundColor: '$white',
  border: '1px solid $gray7',
  borderRadius: '$radius200',
  marginTop: '$space0',
  boxShadow: '$shadow100',
})

const Item = styled('button', {
  fontSize: '$size80',
  fontWeight: 500,
  color: '$gray14',
  paddingX: '$space80',
  textAlign: 'left',
  paddingY: '$space60',
  cursor: 'pointer',
  margin: 0,
  whiteSpace: 'nowrap',
  userSelect: 'none',
  '&:hover': {
    backgroundColor: '$gray3',
  },
  '&.is-selected': {
    backgroundColor: '$gray3',
    borderColor: '#000',
  },
})

const NoResult = styled('span', {
  fontSize: '$size80',
  fontWeight: 500,
  color: '$gray14',
  paddingX: '$space80',
  textAlign: 'left',
  paddingY: '$space80',
  margin: 0,
  whiteSpace: 'nowrap',
  userSelect: 'none',
})

export const getSuggestions = (
  members: any[],
): MentionOptions['suggestion'] => ({
  items: ({ query }) => {
    return members
      .filter(member =>
        member.name.toLowerCase().startsWith(query.toLowerCase()),
      )
      .slice(0, 5)
  },

  render: () => {
    let reactRenderer: ReactRenderer
    let popup: any

    return {
      onStart: props => {
        reactRenderer = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        // @ts-expect-error
        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: reactRenderer.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props) {
        reactRenderer.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup[0].hide()

          return true
        }

        // @ts-expect-error
        return reactRenderer.ref?.onKeyDown(props)
      },

      onExit() {
        popup[0].destroy()
        reactRenderer.destroy()
      },
    }
  },
})

export const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    if (!props.items) {
      return
    }

    // @ts-expect-error
    const item = props.items[index]

    if (item) {
      // @ts-expect-error
      props.command({ id: item.account_id, label: item.name })
    }
  }

  const upHandler = () => {
    setSelectedIndex(
      // @ts-expect-error
      (selectedIndex + props.items.length - 1) % props.items.length,
    )
  }

  const downHandler = () => {
    // @ts-expect-error
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    // @ts-expect-error
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <Container>
      {props.items?.length ? (
        // @ts-expect-error
        props.items.map((item, index) => (
          <Item
            className={`item ${index === selectedIndex ? 'is-selected' : ''}`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.name}
          </Item>
        ))
      ) : (
        <NoResult>Member not found</NoResult>
      )}
    </Container>
  )
})
