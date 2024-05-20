import { Dispatch, SetStateAction, useCallback, useEffect } from 'react'
import {
  Box,
  Button,
  ComboboxField,
  FileUpload,
  SelectField,
  Stack,
} from 'design-system'
import { State } from '../types'
import {
  ExcelSheetPreviewData,
  fileFormatAccept,
  getCSVPreviewData,
  getFileType,
} from '../../../../../utils/files'
import { Components } from '../../../../../generated/typeDefinitions'
import { useListProjectTags } from '../../../../../generated/reactQuery'

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
  const { data: tagsData } = useListProjectTags({
    queryParams: { projectId: project.id },
  })
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

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles.at(0)
      if (!file) {
        return
      }

      const fileType = getFileType(file)
      if (!fileType) {
        return
      }

      const csvPreviewData =
        fileType === 'csv' ? await getCSVPreviewData(file) : undefined
      let excelPreviewData: ExcelSheetPreviewData[] | undefined = undefined

      if (fileType === 'excel') {
        const xlsx = await import('../../../../../utils/xlsx')
        const result = await xlsx.getExcelPreviewData(file)
        excelPreviewData = result
      }

      updateState(state => {
        const newState = {
          ...state,
          file,
          fileFormat: fileType,
        }

        if (fileType === 'csv') {
          newState.csvPreviewData = csvPreviewData
          newState.mapping = {
            sheetName: undefined,
            rowStartIndex: 0,
            keyColumnIndex: 0,
            translationColumnIndex: 1,
          }
        }

        if (fileType === 'excel') {
          newState.excelPreviewData = excelPreviewData
          newState.mapping = {
            sheetName: excelPreviewData!.at(0)?.name,
            rowStartIndex: 0,
            keyColumnIndex: 0,
            translationColumnIndex: 1,
          }
        }

        return newState
      })
    },
    [updateState],
  )

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

            <ComboboxField
              width="100%"
              label="Tags"
              placeholder="Choose tags..."
              isMultiple
              options={(tagsData?.items ?? []).map(tag => ({
                label: `${tag.key}:${tag.value}`,
                value: tag.id,
              }))}
              onChange={tagIds =>
                updateState(state => ({
                  ...state,
                  tagIds,
                }))
              }
              value={state.tagIds}
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
