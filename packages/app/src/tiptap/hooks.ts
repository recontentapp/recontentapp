import { Bold } from '@tiptap/extension-bold'
import { BulletList } from '@tiptap/extension-bullet-list'
import { Document } from '@tiptap/extension-document'
import { HardBreak } from '@tiptap/extension-hard-break'
import { History } from '@tiptap/extension-history'
import { Italic } from '@tiptap/extension-italic'
import { Link } from '@tiptap/extension-link'
import { ListItem } from '@tiptap/extension-list-item'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Strike } from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import { useMemo } from 'react'

import { getSuggestions } from './components/MentionList'
import { Mention, MentionOptions } from './extensions/mention'

interface UseExtensionsParams {
  placeholder?: string
}

export const useExtensions = ({ placeholder }: UseExtensionsParams = {}) => {
  // TODO: API call
  const members: Array<{ account_id: string; name: string }> = []

  const extensions = useMemo(
    () => [
      Document,
      Paragraph,
      Placeholder.configure({
        placeholder,
      }),
      Text,
      Bold,
      BulletList,
      HardBreak,
      History,
      Italic,
      ListItem,
      OrderedList,
      Strike,
      Link,
      Mention.configure({
        renderLabel: ({
          options,
          node,
        }: {
          options: MentionOptions
          node: ProseMirrorNode
        }) => {
          const foundMember = members.find(
            member => member.account_id === node.attrs.id,
          )
          return `${options.suggestion.char}${foundMember?.name ?? 'Unknown'}`
        },
        suggestion: getSuggestions(members),
      }),
    ],
    [members, placeholder],
  )

  return extensions
}

interface UsePhraseExtensionsParams {
  placeholder?: string
}

export const usePhraseExtensions = ({
  placeholder,
}: UsePhraseExtensionsParams = {}) => {
  const extensions = useMemo(
    () => [
      Document,
      Paragraph,
      Placeholder.configure({
        placeholder,
      }),
      Text,
      HardBreak,
      History,
    ],
    [placeholder],
  )

  return extensions
}
