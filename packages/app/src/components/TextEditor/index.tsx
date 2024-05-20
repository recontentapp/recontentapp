import { Suspense, forwardRef, lazy } from 'react'

import { TextEditorProps, TextEditorRef } from './types'

const InnerTextEditor = lazy(
  () => import(/* webpackChunkName: "TextEditor" */ './TextEditor'),
)

export const TextEditor = forwardRef<TextEditorRef, TextEditorProps>(
  (props, ref) => {
    return (
      <Suspense fallback={null}>
        <InnerTextEditor {...props} ref={ref} />
      </Suspense>
    )
  },
)

export * from './types'
