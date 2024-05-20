import { FC, useMemo, useState } from 'react'

import { Box, Button, SelectField, Stack, toast } from 'design-system'
import {
  getGetProjectQueryKey,
  useAddLanguagesToProject,
  useListWorkspaceLanguages,
} from '../../../../../generated/reactQuery'
import { Components } from '../../../../../generated/typeDefinitions'
import { useQueryClient } from '@tanstack/react-query'

export interface State {
  name: string
  locale: string
}

interface AddLanguageFormProps {
  project: Components.Schemas.Project
}

export const AddLanguageForm: FC<AddLanguageFormProps> = ({ project }) => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending: isAddingLanguage } = useAddLanguagesToProject(
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetProjectQueryKey({
            queryParams: { id: project.id },
          }),
        })
      },
    },
  )
  const { data: languages, isLoading } = useListWorkspaceLanguages({
    queryParams: { workspaceId: project.workspaceId },
  })
  const [selectedLanguageId, setSelectedLanguageId] = useState<
    string | undefined
  >(undefined)

  const selectableLanguages = useMemo(() => {
    if (!languages) {
      return []
    }

    const projectLanguageIds = project.languages.map(language => language.id)

    return languages.filter(
      language => !projectLanguageIds.includes(language.id),
    )
  }, [languages, project.languages])

  const onSubmitAll = () => {
    if (!languages) {
      return
    }

    mutateAsync({
      body: {
        projectId: project.id,
        languageIds: languages.map(language => language.id),
      },
    })
      .then(() => {
        toast('success', {
          title: 'Languages added to project',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not add languages to project',
        })
      })
  }

  const onSubmit = () => {
    if (!selectedLanguageId) {
      return
    }

    mutateAsync({
      body: {
        projectId: project.id,
        languageIds: [selectedLanguageId],
      },
    })
      .then(() => {
        toast('success', {
          title: 'Languages added to project',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not add languages to project',
        })
      })
  }

  if (isLoading) {
    return null
  }

  return (
    <Box paddingTop="$space60" paddingBottom="$space60">
      <Stack direction="row" alignItems="flex-start" spacing="$space60">
        <SelectField
          hideLabel
          label="Language"
          placeholder="Choose a language"
          value={undefined}
          options={selectableLanguages.map(language => ({
            label: language.name,
            value: language.id,
          }))}
          onChange={option => setSelectedLanguageId(option?.value ?? undefined)}
        />

        <Button
          variation="primary"
          isLoading={isAddingLanguage}
          isDisabled={selectedLanguageId === undefined}
          onAction={onSubmit}
        >
          Add
        </Button>
        <Button
          variation="secondary"
          isLoading={isAddingLanguage}
          onAction={onSubmitAll}
        >
          Add all workspace languages
        </Button>
      </Stack>
    </Box>
  )
}
