import { FC, forwardRef, useImperativeHandle, useRef } from 'react'

import { Sidepanel, Stack } from 'design-system'
import { SidepanelRef } from 'design-system/dist/components/Sidepanel'
import {
  useGetPhrase,
  useGetProject,
} from '../../../../../../generated/reactQuery'
import { styled } from '../../../../../../theme'
import { Main } from './components/Main'
import { Sidebar } from './components/Sidebar'

export interface UpdatePhrasePanelRef {
  open: () => void
}

interface UpdatePhrasePanelProps {
  projectId: string
  revisionId: string
  phraseId: string
  currentIndex: number
  totalCount: number
  onNext: () => void
  onPrevious: () => void
  onClose?: () => void
}

interface ContentProps {
  projectId: string
  phraseId: string
  currentIndex: number
  totalCount: number
  onNext: () => void
  onPrevious: () => void
}

const Scroller = styled('div', {
  width: '100%',
  height: '100%',
  paddingX: '$space100',
  overflowY: 'auto',
  overflowX: 'hidden',
})

const Footer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  backgroundColor: '$white',
  borderTop: '1px solid $gray7',
  paddingX: '$space200',
  paddingY: '$space80',
})

const Content: FC<ContentProps> = ({
  projectId,
  phraseId,
  currentIndex,
  totalCount,
  onNext,
  onPrevious,
}) => {
  const { data: project } = useGetProject({ queryParams: { id: projectId } })
  const { data: phrase } = useGetPhrase({
    queryParams: {
      phraseId,
    },
  })

  return (
    <Stack width="100%" height="100%" direction="row">
      <Main
        project={project}
        phrase={phrase}
        currentIndex={currentIndex}
        totalCount={totalCount}
        onNext={onNext}
        onPrevious={onPrevious}
      />

      <Sidebar project={project} phrase={phrase} />
    </Stack>
  )
}

export const UpdatePhrasePanel = forwardRef<
  UpdatePhrasePanelRef,
  UpdatePhrasePanelProps
>(
  (
    {
      onClose,
      phraseId,
      projectId,
      currentIndex,
      totalCount,
      onNext,
      onPrevious,
    },
    ref,
  ) => {
    const sidepanelRef = useRef<SidepanelRef>(null!)

    useImperativeHandle(ref, () => ({
      open: () => {
        sidepanelRef.current.open()
      },
    }))

    return (
      <Sidepanel ref={sidepanelRef} onClose={onClose}>
        <Content
          projectId={projectId}
          phraseId={phraseId}
          currentIndex={currentIndex}
          totalCount={totalCount}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      </Sidepanel>
    )
  },
)
