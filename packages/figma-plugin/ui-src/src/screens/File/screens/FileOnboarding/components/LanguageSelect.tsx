import { SelectField, Option } from 'design-system'
import { useListLanguages } from '../../../../../generated/reactQuery'

interface LanguageSelectProps {
  projectId: string
  value: string | undefined
  onSelect: (option: Option) => void
}

export const LanguageSelect = ({
  projectId,
  value,
  onSelect,
}: LanguageSelectProps) => {
  const { data } = useListLanguages({
    queryParams: {
      projectId,
    },
  })

  return (
    <SelectField
      onChange={option => {
        if (!option) {
          return
        }
        onSelect(option)
      }}
      value={value}
      label="Language"
      placeholder="Select a language"
      options={(data?.items ?? []).map(i => ({
        label: i.name,
        value: i.id,
      }))}
    />
  )
}
