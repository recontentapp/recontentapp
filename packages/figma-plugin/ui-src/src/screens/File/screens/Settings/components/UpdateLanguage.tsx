import { useQueryClient } from '@tanstack/react-query'
import { Banner, Button, SelectField, Stack } from 'design-system'
import { useState } from 'react'
import { FullpageSpinner } from '../../../../../components/FullpageSpinner'
import { useBridge } from '../../../../../contexts/Bridge'
import { useCurrentCredentials } from '../../../../../contexts/CurrentCredentials'
import {
  getGetFigmaFileQueryKey,
  useListLanguages,
  useUpdateFigmaFile,
} from '../../../../../generated/reactQuery'
import { useFile } from '../../../hooks'

interface UpdateLanguageProps {
  onRequestSync: () => void
  onClose: () => void
}

export const UpdateLanguage = ({
  onClose,
  onRequestSync,
}: UpdateLanguageProps) => {
  const queryClient = useQueryClient()
  const [languageId, setLanguageId] = useState<string | undefined>(undefined)
  const { file, emit } = useBridge()
  const { mutateAsync, isPending } = useUpdateFigmaFile()
  const { currentCredentials } = useCurrentCredentials()
  const { data } = useFile()
  const { data: languagesData } = useListLanguages(
    {
      queryParams: {
        projectId: String(data?.projectId),
      },
    },
    {
      enabled: Boolean(data?.projectId),
    },
  )

  const onSubmit = () => {
    if (isPending || !file.config || !languageId) {
      return
    }

    mutateAsync({
      pathParams: {
        id: file.config.id,
      },
      body: {
        languageId,
      },
    }).then(res => {
      queryClient.invalidateQueries({
        queryKey: getGetFigmaFileQueryKey({
          pathParams: {
            id: res.id,
          },
        }),
      })
      emit({
        type: 'file-config-set',
        data: {
          id: res.id,
          languageId: res.languageId,
          revisionId: res.revisionId,
          workspaceId: res.workspaceId,
          workspaceKey: currentCredentials.workspaceKey,
          customOrigin: currentCredentials.customOrigin,
        },
      })
      onClose()
      onRequestSync()
    })
  }

  if (!languagesData) {
    return <FullpageSpinner />
  }

  return (
    <Stack
      direction="column"
      spacing="$space100"
      paddingX="$space80"
      paddingY="$space80"
    >
      <Banner
        variation="info"
        description="All texts synced with Recontent.app will be updated. Make sure to sync all other pages too."
      />

      <SelectField
        label="New language"
        placeholder="Choose a language"
        onChange={option => {
          if (!option) {
            return
          }

          setLanguageId(option.value)
        }}
        value={languageId}
        options={languagesData.items.map(i => ({
          label: i.name,
          value: i.id,
        }))}
      />

      <Stack direction="row" spacing="$space60">
        <Button
          size="xsmall"
          isDisabled={!languageId}
          variation="primary"
          onAction={onSubmit}
        >
          Update language
        </Button>

        <Button size="xsmall" variation="secondary" onAction={onClose}>
          Cancel
        </Button>
      </Stack>
    </Stack>
  )
}
