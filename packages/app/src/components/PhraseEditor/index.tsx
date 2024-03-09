import { Suspense, forwardRef, lazy } from 'react'

import { PhraseEditorProps, PhraseEditorRef } from './types'

const InnerPhraseEditor = lazy(
  () => import(/* webpackChunkName: "PhraseEditor" */ './PhraseEditor'),
)

export const PhraseEditor = forwardRef<PhraseEditorRef, PhraseEditorProps>(
  (props, ref) => {
    return (
      <Suspense fallback={null}>
        <InnerPhraseEditor {...props} ref={ref} />
      </Suspense>
    )
  },
)

export * from './types'
