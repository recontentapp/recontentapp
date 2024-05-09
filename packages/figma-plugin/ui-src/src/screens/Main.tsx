import React from 'react'
import { useFigmaDocument } from '../api'
import { MultipleTextsEditor } from '../components/MultipleTextsEditor'
import { Placeholder } from '../components/Placeholder'
import { SingleTextEditor } from '../components/SingleTextEditor'
import { useContext } from '../context'
import { styled } from '../theme'
import { Error } from '../components/Error'
import { SyncFooter } from '../components/SyncFooter'

const Container = styled('div', {
  width: '100%',
  height: 'calc(100% - 41px)',
  display: 'flex',
  flexDirection: 'column',
})

const MainContainer = styled('div', {
  flexGrow: 1,
})

export const Main = () => {
  const { selectedTexts, traversed, id } = useContext()
  const { data: document, isError } = useFigmaDocument(id!)

  if (isError) {
    return <Error />
  }

  return (
    <Container>
      <MainContainer>
        {selectedTexts.length === 0 && <Placeholder />}

        {selectedTexts.length === 1 && !traversed && (
          <SingleTextEditor text={selectedTexts[0]} document={document} />
        )}

        {selectedTexts.length > 1 && document && (
          <MultipleTextsEditor texts={selectedTexts} document={document} />
        )}
      </MainContainer>

      {document && <SyncFooter document={document} />}
    </Container>
  )
}
