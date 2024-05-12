import { $emit, $on } from './src/io'
import { getSelectedTraversedTextNodes } from './src/selection'
import { getUserConfig } from './src/storage/config'
import { getFileConfig } from './src/storage/file'
import { Emittable, Receivable } from './src/types'

figma.skipInvisibleInstanceChildren = true
figma.showUI(__html__, { themeColors: true, height: 340 })

const emit = $emit<Emittable>()

$on<Receivable>({
  'file-config-reset-requested': () => {},
  'user-config-reset-requested': () => {},
})

const app = async () => {
  const userConfig = await getUserConfig()
  const fileConfig = getFileConfig()

  emit({
    type: 'plugin-initialized',
    data: {
      userConfig,
      fileConfig,
      fileName: figma.root.name,
      selection: {
        texts: [],
        traversed: false,
      },
    },
  })
}

void app()

figma.on('selectionchange', () => {
  console.log(getSelectedTraversedTextNodes())
})
