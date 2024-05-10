import { Button, Muted, Section, Stack } from 'figma-ui-kit'
import { FigmaText } from '../types'
import { useContext } from '../context'

interface MultipleTextsEditorProps {
  texts: FigmaText[]
  document: any
}

export const MultipleTextsEditor = ({
  texts,
  document,
}: MultipleTextsEditorProps) => {
  const { emit } = useContext()

  const textsWithoutRecontentId = texts.filter(
    text => text.recontentId === null,
  )

  const requestBatchCreate = async () => {
    const textsToCreate = [...textsWithoutRecontentId]
    // const phrases = await mutateAsync({
    //   document_id: document.id,
    //   texts: textsToCreate.map(text => text.content),
    // })

    // emit({
    //   type: 'batchPhraseCreated',
    //   data: phrases.map((phrase, index) => ({
    //     figmaId: textsToCreate[index].figmaId,
    //     recontentId: phrase.id,
    //     key: phrase.phrase_key,
    //   })),
    // })
  }

  const isLoading = false

  return (
    <Stack direction="column" spacing="$medium">
      <Section title={`${texts.length} selected texts`} />

      <Stack
        paddingX="$medium"
        width="100%"
        direction="column"
        spacing="$small"
      >
        <Button
          fullWidth
          onClick={requestBatchCreate}
          loading={isLoading}
          disabled={textsWithoutRecontentId.length === 0}
        >
          Create{' '}
          {textsWithoutRecontentId.length > 0
            ? textsWithoutRecontentId.length
            : ''}{' '}
          phrases on Recontent.app
        </Button>
        {textsWithoutRecontentId.length !== texts.length && (
          <Muted>
            Some texts are already attached to phrases on Recontent.app.
          </Muted>
        )}
      </Stack>
    </Stack>
  )
}
