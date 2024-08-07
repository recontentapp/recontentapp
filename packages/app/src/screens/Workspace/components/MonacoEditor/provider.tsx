import loader, { Monaco } from '@monaco-editor/loader'
import { emmetHTML } from 'emmet-monaco-es'
import { languages } from 'monaco-editor'
import {
  createContext,
  FC,
  PropsWithChildren,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { attributes } from './mjml/mjmlAttributes'
import { snippets } from './mjml/mjmlSnippets'

const monacoProviderContext = createContext<Monaco>(null!)

interface MonacoProviderProps extends PropsWithChildren {
  loadingState: ReactElement
}

export const MonacoProvider: FC<MonacoProviderProps> = ({
  loadingState,
  children,
}) => {
  const [isReady, setIsReady] = useState(false)
  const monacoRef = useRef<Monaco>(null!)

  useEffect(() => {
    const cancelable = loader.init()

    cancelable
      .then(monaco => {
        const data: languages.html.HTMLDataV1 = {
          version: 1.1,
          tags: Object.entries(attributes).map(([tag, possibleAttributes]) => ({
            name: tag,
            attributes: possibleAttributes.map(possibleAttribute => ({
              name: possibleAttribute,
            })),
          })),
        }

        monaco.languages.html.htmlDefaults.setOptions({
          // @ts-expect-error
          data: { useDefaultDataProvider: false, dataProviders: [data] },
        })

        monaco.languages.registerCompletionItemProvider('html', {
          provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position)

            return {
              suggestions: snippets.map(snippet => ({
                label: snippet.label,
                detail: 'MJML abbreviation',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: {
                  startLineNumber: position.lineNumber,
                  endLineNumber: position.lineNumber,
                  startColumn: word.startColumn,
                  endColumn: word.endColumn,
                },
                insertText: snippet.value,
              })),
            }
          },
        })

        emmetHTML(monaco)
        monacoRef.current = monaco
        setIsReady(true)
      })
      .catch(error => {
        console.error('Monaco initialization: error:', error)
      })

    return () => cancelable.cancel()
  }, [])

  if (!isReady) {
    return loadingState
  }

  return (
    <monacoProviderContext.Provider value={monacoRef.current}>
      {children}
    </monacoProviderContext.Provider>
  )
}

export const useMonaco = () => useContext(monacoProviderContext)
