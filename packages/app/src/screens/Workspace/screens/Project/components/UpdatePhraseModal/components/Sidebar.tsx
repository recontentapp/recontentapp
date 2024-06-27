import { Box, Tabs } from 'design-system'
import { Components } from '../../../../../../../generated/typeDefinitions'
import { styled } from '../../../../../../../theme'

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

export const Sidebar = ({ project, phrase }: Props) => {
  return (
    <Container>
      {!project || !phrase ? null : (
        <>
          <Box
            backgroundColor="$white"
            position="sticky"
            top={0}
            paddingX="$space80"
            paddingTop="$space60"
          >
            <Tabs
              label="Tabs"
              tabs={[{ label: 'Glossary', value: 'glossary' }]}
              currentTab="glossary"
              onSelect={() => {}}
            />
          </Box>
          <pre>{JSON.stringify(project, null, 2)}</pre>
          <pre>{JSON.stringify(phrase, null, 2)}</pre>
          <pre>{JSON.stringify(phrase, null, 2)}</pre>
          <pre>{JSON.stringify(phrase, null, 2)}</pre>
        </>
      )}
    </Container>
  )
}
