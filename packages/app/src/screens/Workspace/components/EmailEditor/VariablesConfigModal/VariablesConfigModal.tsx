import { FC, forwardRef, useImperativeHandle, useRef, useState } from 'react'

import {
  Banner,
  Box,
  Modal,
  ModalContent,
  ModalRef,
  Stack,
  Tabs,
} from 'design-system'
import { getVariableFallback } from 'email-renderer'
import { Variable } from '../types'
import { Layout } from './Layout'
import { Tag } from './Tag'
import { Template } from './Template'

export interface VariablesConfigModalRef {
  open: () => void
  close: () => void
}

interface ContentProps {
  layoutVariables?: Variable[]
  variables: Variable[]
  onChange: (variables: Variable[]) => void
  onRequestClose: () => void
}

const DEFAULT_VARIABLE = {
  key: '',
  defaultContent: '',
  translations: {},
}

type Tab = 'template' | 'layout'

const Content: FC<ContentProps> = ({
  layoutVariables,
  variables: initialVariables,
  onChange,
  onRequestClose,
}) => {
  const [currentTab, setCurrentTab] = useState<Tab>('template')
  const [variables, setVariables] = useState(
    initialVariables.length > 0 ? initialVariables : [DEFAULT_VARIABLE],
  )
  const addVariable = () => {
    setVariables([...variables, DEFAULT_VARIABLE])
  }
  const isValid = variables.every(
    variable => variable.key && variable.defaultContent,
  )

  return (
    <ModalContent
      asForm
      title="Configure variables"
      primaryAction={{
        label: 'Save configuration',
        isDisabled: !isValid,
        onAction: () => {
          onRequestClose()
          onChange(variables)
        },
      }}
    >
      <Box width="100%" paddingBottom="$space200" minHeight={122}>
        <Stack width="100%" direction="column" spacing="$space200">
          <Banner
            variation="info"
            description={
              <span>
                Variables allow you to localize an email template by making
                product copy editable. Replace hardcoded content by{' '}
                <Tag>{getVariableFallback('title')}</Tag> tags & start
                localizing.
              </span>
            }
          />

          <Stack direction="column" spacing="$space60">
            {layoutVariables !== undefined && (
              <Tabs<Tab>
                label="Tabs"
                currentTab={currentTab}
                onSelect={setCurrentTab}
                tabs={[
                  { label: 'Local variables', value: 'template' },
                  { label: 'Layout variables', value: 'layout' },
                ]}
              />
            )}

            {currentTab === 'template' && (
              <Template
                variables={variables}
                setVariables={setVariables}
                addVariable={addVariable}
              />
            )}

            {currentTab === 'layout' && layoutVariables !== undefined && (
              <Layout variables={layoutVariables} />
            )}
          </Stack>
        </Stack>
      </Box>
    </ModalContent>
  )
}

export const VariablesConfigModal = forwardRef<
  VariablesConfigModalRef,
  Pick<ContentProps, 'variables' | 'onChange' | 'layoutVariables'>
>(({ layoutVariables, variables, onChange }, ref) => {
  const modalRef = useRef<ModalRef>(null!)

  useImperativeHandle(ref, () => ({
    open: () => {
      modalRef.current.open()
    },
    close: () => {
      modalRef.current.close()
    },
  }))

  return (
    <Modal ref={modalRef} onClose={() => {}}>
      <Content
        layoutVariables={layoutVariables}
        variables={variables}
        onChange={onChange}
        onRequestClose={() => {
          modalRef.current.close()
        }}
      />
    </Modal>
  )
})
