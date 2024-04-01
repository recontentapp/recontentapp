import { Dispatch, SetStateAction, useCallback, useEffect } from 'react'
import {
  Box,
  Button,
  FileUpload,
  SelectField,
  Stack,
} from '../../../../../components/primitives'
import { State } from '../types'
import {
  fileFormatAccept,
  getCSVPreviewData,
  getExcelPreviewData,
  getFileType,
} from '../../../../../utils/files'
import { Components } from '../../../../../generated/typeDefinitions'

interface Props {
  project: Components.Schemas.Project
  state: State
  updateState: Dispatch<SetStateAction<State>>
  canMoveToNextStep: boolean
  isLoading: boolean
  onSubmit: () => void
}

export const Form = ({
  project,
  state,
  updateState,
  isLoading,
  canMoveToNextStep,
  onSubmit,
}: Props) => {
  useEffect(() => {
    if (state.language || project.languages.length === 0) {
      return
    }

    updateState(state => ({
      ...state,
      language: {
        id: project.languages[0].id,
        name: project.languages[0].name,
      },
    }))
  }, [state.language])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles.at(0)
    updateState(state => ({
      ...state,
      file,
      ...(!file && {
        excelPreviewData: undefined,
        csvPreviewData: undefined,
      }),
    }))

    if (!file) {
      return
    }

    const fileType = getFileType(file)
    if (!fileType) {
      return
    }

    switch (fileType) {
      case 'yaml': {
        updateState(state => ({
          ...state,
          fileFormat: 'yaml',
        }))
        break
      }
      case 'csv': {
        const csvPreviewData = await getCSVPreviewData(file)
        updateState(state => ({
          ...state,
          fileFormat: 'csv',
          csvPreviewData,
        }))
        break
      }
      case 'json': {
        updateState(state => ({
          ...state,
          fileFormat: 'json',
        }))
        break
      }
      case 'excel': {
        const excelPreviewData = await getExcelPreviewData(file)
        updateState(state => ({
          ...state,
          excelPreviewData,
          fileFormat: 'excel',
        }))
        break
      }
    }
  }, [])

  const nextLabel =
    ['excel', 'csv'].includes(state.fileFormat) && !state.mapping
      ? 'Configure import'
      : 'Import phrases'

  return (
    <Stack direction="column" spacing="$space200" width="100%">
      <Stack direction="column" spacing="$space200" width="100%">
        <Stack direction="column" spacing="$space200">
          <Stack
            direction="row"
            spacing="$space100"
            width="100%"
            flexWrap="nowrap"
          >
            <SelectField
              width="100%"
              options={project.languages.map(language => ({
                label: language.name,
                value: language.id,
              }))}
              label="Language"
              placeholder="Choose a language"
              value={state.language?.id}
              onChange={option => {
                if (!option) {
                  return
                }

                updateState(state => ({
                  ...state,
                  language: {
                    id: option.value,
                    name: option.label,
                  },
                }))
              }}
            />
          </Stack>

          <FileUpload
            onChange={onDrop}
            maxFiles={1}
            accept={fileFormatAccept}
          />
        </Stack>

        <Box>
          <Button
            isDisabled={!canMoveToNextStep}
            variation="primary"
            onAction={onSubmit}
            isLoading={isLoading}
          >
            {nextLabel}
          </Button>
        </Box>
      </Stack>
    </Stack>
  )
}
