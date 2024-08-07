import { MinimalButton, Stack, Text } from 'design-system'
import { Dispatch, SetStateAction, useRef } from 'react'
import { Panel, PanelResizeHandle } from 'react-resizable-panels'
import { MonacoEditor, MonacoEditorRef } from '../../../components/MonacoEditor'
import { Variable } from '../types'
import { SubToolbar } from './Toolbars'
import {
  VariablesConfigModal,
  VariablesConfigModalRef,
} from './VariablesConfigModal/VariablesConfigModal'

interface Props {
  value: string
  setValue: (value: string) => void
  layoutVariables: Variable[]
  variables: Variable[]
  setVariables: Dispatch<SetStateAction<Variable[]>>
}

export const CodePanel = ({
  layoutVariables,
  value,
  setValue,
  variables,
  setVariables,
}: Props) => {
  const variablesConfigModalRef = useRef<VariablesConfigModalRef>(null)
  const monacoEditorRef = useRef<MonacoEditorRef>(null)

  return (
    <>
      <Panel id="code" order={1} defaultSize={50} minSize={20}>
        <Stack height="100%" width="100%" direction="column" flexWrap="nowrap">
          <SubToolbar>
            <Stack
              width="100%"
              alignItems="center"
              direction="row"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing="$space40" alignItems="center">
                <Text size="$size80" variation="semiBold" color="$gray14">
                  Code editor
                </Text>

                <MinimalButton
                  size="xsmall"
                  icon="database"
                  onAction={() => variablesConfigModalRef.current?.open()}
                >
                  Variables
                </MinimalButton>
              </Stack>

              <Stack direction="row" spacing="$space60" alignItems="center">
                <MinimalButton
                  size="xsmall"
                  icon="code"
                  onAction={() => monacoEditorRef.current?.format()}
                >
                  Format code
                </MinimalButton>
              </Stack>
            </Stack>
          </SubToolbar>

          <MonacoEditor
            ref={monacoEditorRef}
            loadingState={<div />}
            initialValue={value}
            onChange={setValue}
            onSave={() => {}}
          />

          <VariablesConfigModal
            ref={variablesConfigModalRef}
            variables={variables}
            onChange={setVariables}
            layoutVariables={layoutVariables}
          />
        </Stack>
      </Panel>
      <PanelResizeHandle />
    </>
  )
}
