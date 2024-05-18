import { FC, Suspense, lazy } from 'react'

import { TextViewProps } from './types'

const InnerTextView = lazy(
  () => import(/* webpackChunkName: "TextView" */ './TextView'),
)

export const TextView: FC<TextViewProps> = props => {
  return (
    <Suspense fallback={null}>
      <InnerTextView {...props} />
    </Suspense>
  )
}
