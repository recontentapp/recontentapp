import { Button, SelectField, Stack } from 'design-system'
import { useBridge } from '../../../../../contexts/Bridge'
import {
  useGetFigmaFile,
  useListLanguages,
  useUpdateFigmaFile,
} from '../../../../../generated/reactQuery'
import { FullpageSpinner } from '../../../../../components/FullpageSpinner'
import { useState } from 'react'
import { useCurrentCredentials } from '../../../../../contexts/CurrentCredentials'

interface UpdateLanguageProps {
  onRequestSync: () => void
  onClose: () => void
}

export const UpdateLanguage = ({
  onClose,
  onRequestSync,
}: UpdateLanguageProps) => {
  const [languageId, setLanguageId] = useState<string | undefined>(undefined)
  const { file, emit } = useBridge()
  const { mutateAsync, isPending } = useUpdateFigmaFile()
  const { currentCredentials } = useCurrentCredentials()
  const { data } = useGetFigmaFile(
    {
      pathParams: {
        id: file.config!.id,
      },
    },
    {
      staleTime: 1000 * 60 * 60,
    },
  )
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
      spacing="$space300"
      paddingX="$space80"
      paddingY="$space80"
    >
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

      <Button variation="primary" onAction={onSubmit}>
        Update
      </Button>
      <Button variation="secondary" onAction={onClose}>
        Close
      </Button>
    </Stack>
  )
}
