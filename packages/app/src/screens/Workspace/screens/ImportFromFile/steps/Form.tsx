import { Dispatch, SetStateAction, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DEFAULT_REVISION,
  fileFormatAccept,
  useLanguagesByProject,
  useListRevisionsInProject,
} from '../../../../../api'
import {
  Banner,
  Box,
  Button,
  FileUpload,
  SelectField,
  Stack,
} from '../../../../../components/primitives'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { toProjectSettings } from '../../../routes'
import { State } from '../types'
import {
  getCSVPreviewData,
  getExcelPreviewData,
  getFileType,
} from '../../../../../utils/files'

interface Props {
  projectId: string
  state: State
  updateState: Dispatch<SetStateAction<State>>
  canMoveToNextStep: boolean
  isLoading: boolean
  onSubmit: () => void
}

export const Form = ({
  projectId,
  state,
  updateState,
  isLoading,
  canMoveToNextStep,
  onSubmit,
}: Props) => {
  const navigate = useNavigate()
  const { key: workspaceKey } = useCurrentWorkspace()
  const { data: revisions = [] } = useListRevisionsInProject(projectId, true)
  const { data: languages = [], isLoading: isLoadingLanguages } =
    useLanguagesByProject(projectId)

  useEffect(() => {
    if (languages && !state.locale) {
      updateState(state => ({
        ...state,
        locale: languages[0]?.locale,
        languageName: languages[0]?.name,
      }))
    }
  }, [languages])

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
      {languages.length === 0 && !isLoadingLanguages && (
        <Banner
          variation="warning"
          description="You need to add languages to your project to import translations for them."
          action={{
            label: 'Go to settings',
            onAction: () =>
              navigate(toProjectSettings(workspaceKey, projectId)),
          }}
        />
      )}

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
              options={languages.map(language => ({
                label: language.name,
                value: language.locale,
              }))}
              label="Language"
              placeholder="Choose a language"
              value={state.locale}
              onChange={option => {
                updateState(state => ({
                  ...state,
                  locale: option?.value,
                  languageName: option?.label,
                }))
              }}
            />

            <SelectField
              width="100%"
              options={revisions
                .map(revision => ({
                  label: revision.name,
                  value: revision.id,
                }))
                .concat([
                  {
                    label: 'Master',
                    value: DEFAULT_REVISION,
                  },
                ])}
              label="Revision"
              value={state.revisionId}
              onChange={option => {
                updateState(state => ({
                  ...state,
                  revisionId: option?.value ?? DEFAULT_REVISION,
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
