import { FC, forwardRef, useImperativeHandle, useRef, useState } from 'react'

import {
  Modal,
  ModalContent,
  ModalRef,
  SelectField,
  Stack,
  TextField,
} from 'design-system'
import { useListEmailLayouts } from '../../../../../generated/reactQuery'
import { Paths } from '../../../../../generated/typeDefinitions'

type PartialTemplate = Pick<
  Paths.UpdateEmailTemplate.RequestBody,
  'key' | 'description' | 'layoutId'
>

export interface UpdateEmailTemplateModalRef {
  open: (template: PartialTemplate) => void
}

interface UpdateEmailTemplateModalProps {
  projectId: string
  onSubmit: (state: State) => void
}

interface ContentProps extends UpdateEmailTemplateModalProps {
  template: PartialTemplate
}

interface State {
  key: string
  description: string | null
  layoutId: string | null
}

const Content: FC<ContentProps> = ({ onSubmit, template, projectId }) => {
  const { data } = useListEmailLayouts({
    queryParams: {
      projectId,
      page: 1,
      pageSize: 50,
    },
  })
  const [state, setState] = useState({
    key: template.key,
    description: template.description,
    layoutId: template.layoutId,
  })

  return (
    <ModalContent
      asForm
      title="Edit email template"
      contextTitle={template.key}
      primaryAction={{
        label: 'Save changes',
        onAction: () =>
          onSubmit({
            key: state.key,
            description: state.description || null,
            layoutId: state.layoutId,
          }),
      }}
    >
      <Stack direction="column" spacing="$space100" paddingBottom="$space300">
        <TextField
          width="100%"
          value={state.key}
          autoFocus
          label="Key"
          onChange={value => {
            setState(state => ({ ...state, key: value }))
          }}
        />

        <TextField
          width="100%"
          value={state.description ?? ''}
          label="Description"
          isOptional
          onChange={value => {
            setState(state => ({ ...state, description: value }))
          }}
        />

        <SelectField
          label="Email layout"
          isOptional
          options={
            data?.items.map(item => ({
              label: item.key,
              value: item.id,
            })) ?? []
          }
          value={state.layoutId ?? undefined}
          onChange={option => {
            if (!option) {
              setState(state => ({ ...state, layoutId: null }))
              return
            }

            setState(state => ({ ...state, layoutId: option.value }))
          }}
        />
      </Stack>
    </ModalContent>
  )
}

export const UpdateEmailTemplateModal = forwardRef<
  UpdateEmailTemplateModalRef,
  UpdateEmailTemplateModalProps
>(({ onSubmit, projectId }, ref) => {
  const modalRef = useRef<ModalRef>(null!)
  const [template, setTemplate] = useState<PartialTemplate | null>(null)

  useImperativeHandle(ref, () => ({
    open: (props: PartialTemplate) => {
      setTemplate(props)
      modalRef.current.open()
    },
  }))

  return (
    <Modal ref={modalRef}>
      {template && (
        <Content
          template={template}
          projectId={projectId}
          onSubmit={values => {
            onSubmit(values)
            modalRef.current.close()
          }}
        />
      )}
    </Modal>
  )
})
