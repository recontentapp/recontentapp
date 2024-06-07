import { useBridge } from '../../../../contexts/Bridge'
import { ExistingTextForm } from './components/ExistingTextForm'
import { MultipleTextsForm } from './components/MultipleTextsForm'
import { NewTextForm } from './components/NewTextForm'
import { Placeholder } from './components/Placeholder'

export const Inspect = () => {
  const { selection } = useBridge()

  if (selection.texts.length === 0) {
    return <Placeholder />
  }

  if (selection.texts.length === 1) {
    const text = selection.texts[0]

    return text.app === null ? (
      <NewTextForm text={text} />
    ) : (
      <ExistingTextForm text={text} />
    )
  }

  return <MultipleTextsForm texts={selection.texts} />
}
