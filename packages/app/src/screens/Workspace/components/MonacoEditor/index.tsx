import { editor, Uri } from 'monaco-editor'
import {
  forwardRef,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { styled } from '../../../../theme'
import { MonacoProvider, useMonaco } from './provider'
import { useUpdateEffect } from './utils'

interface EditorProps {
  initialValue: string
  onChange: (value: string) => void
  onSave: () => void
}

const Container = styled('div', {
  width: '100%',
  height: '100%',
  '& *': {
    fontFamily: 'Menlo, Consolas, "Liberation Mono", monospace',
  },
})

const Editor = forwardRef<MonacoEditorRef, EditorProps>(
  ({ initialValue, onChange, onSave }, ref) => {
    const monaco = useMonaco()
    const [value, setValue] = useState(initialValue)
    const [onSaveCount, setOnSaveCount] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null!)
    const editorRef = useRef<editor.IStandaloneCodeEditor>(null!)

    useImperativeHandle(ref, () => ({
      format: () =>
        editorRef.current.getAction('editor.action.formatDocument')?.run(),
    }))

    useUpdateEffect(() => {
      onChange(value)
    }, [value])

    useUpdateEffect(() => {
      onSave()
    }, [onSaveCount])

    useUpdateEffect(() => {
      const value = editorRef.current.getValue()

      if (initialValue !== value) {
        editorRef.current.setValue(initialValue)
      }
    }, [initialValue])

    useEffect(() => {
      editorRef.current = monaco.editor.create(containerRef.current, {
        model: monaco.editor.createModel(
          value,
          'html',
          new Uri().with({ path: '/' }),
        ),
        automaticLayout: true,
        contextmenu: false,
        autoIndent: 'full',
        fontSize: 13,
        scrollbar: {
          useShadows: false,
        },
        lineHeight: 18,
        guides: {
          indentation: false,
        },
        tabSize: 2,
        renderWhitespace: 'none',
        minimap: {
          enabled: false,
        },
      })

      editorRef.current.onDidChangeModelContent(() => {
        const value = editorRef.current.getValue()
        setValue(value)
      })

      editorRef.current.addCommand(
        // @ts-expect-error
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
        () => {
          setOnSaveCount(value => value + 1)
        },
      )

      const listener = () => {
        editorRef.current.layout()
      }

      window.addEventListener('resize', listener)

      return () => {
        editorRef.current.getModel()?.dispose()
        editorRef.current.dispose()
        window.removeEventListener('resize', listener)
      }
    }, [])

    return <Container ref={containerRef} />
  },
)

export interface MonacoEditorRef {
  format: () => void
}

interface MonacoEditorProps extends EditorProps {
  loadingState: ReactElement
}

export const MonacoEditor = forwardRef<MonacoEditorRef, MonacoEditorProps>(
  ({ loadingState, ...props }, ref) => (
    <MonacoProvider loadingState={loadingState}>
      <Editor ref={ref} {...props} />
    </MonacoProvider>
  ),
)
