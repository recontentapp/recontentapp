import { FieldProps } from 'design-system'
import { CSSProperties } from 'react'

export interface PhraseEditorProps
  extends FieldProps,
    Pick<CSSProperties, 'maxWidth' | 'width'> {
  onChange?: (value: string) => void
  /**
   * A controlled version of PhraseEditor
   * is not performant. It should be used
   * in an uncontrolled manner.
   */
  initialValue?: string
  direction?: 'ltr' | 'rtl'
}

export interface PhraseEditorRef {
  reset: () => void
}
