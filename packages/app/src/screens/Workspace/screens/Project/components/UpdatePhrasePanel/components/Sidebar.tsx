import { Box, Tabs } from 'design-system'
import { useState } from 'react'
import { Components } from '../../../../../../../generated/typeDefinitions'
import { styled } from '../../../../../../../theme'
import { Glossary } from './Glossary'
import { Properties } from './Properties'

const Container = styled('div', {
  width: 280,
  height: '100%',
  flexShrink: 0,
  minWidth: 0,
  borderLeft: '1px solid $gray7',
  overflowX: 'hidden',
  overflowY: 'auto',
})

interface Props {
  project?: Components.Schemas.Project
  phrase?: Components.Schemas.Phrase
}

type Tab = 'properties' | 'glossary'

export const Sidebar = ({ project, phrase }: Props) => {
  const [currentTab, setCurrentTab] = useState<Tab>('properties')
  const glossaryId = project?.glossaryId

  return (
    <Container>
      <Box
        backgroundColor="$white"
        position="sticky"
        top={0}
        paddingX="$space80"
        paddingTop="$space60"
        zIndex={1}
      >
        <Tabs<Tab>
          label="Tabs"
          tabs={[
            { label: 'Properties', value: 'properties' },
            ...(glossaryId
              ? [{ label: 'Glossary', value: 'glossary' } as const]
              : []),
          ]}
          currentTab={currentTab}
          onSelect={setCurrentTab}
        />
      </Box>

      {currentTab === 'properties' && <Properties phrase={phrase} />}

      {currentTab === 'glossary' && glossaryId && (
        <Glossary project={project} glossaryId={glossaryId} />
      )}
    </Container>
  )
}
