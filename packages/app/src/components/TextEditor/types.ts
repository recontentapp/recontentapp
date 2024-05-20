import { FieldProps } from 'design-system'
import { CSSProperties } from 'react'

export interface TextEditorProps
  extends FieldProps,
    Pick<CSSProperties, 'maxWidth' | 'width'> {
  onChange?: (value: string) => void
  value?: string
}

export interface TextEditorRef {
  reset: () => void
  getValueWithMentionedAccounts: () => {
    value: string
    mentionedAccounts: string[]
  }
}
