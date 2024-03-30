import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack } from '../../../../../components/primitives'
import { ImportCard } from '../components/ImportCard'

export const Import: FC = () => {
  const navigate = useNavigate()

  return (
    <Stack width="100%" direction="column" spacing="$space300">
      <Stack direction="row" spacing="$space100">
        <ImportCard
          variation="secondary"
          title="From a file"
          description="JSON, Yaml, CSV, Excel"
          icon="file"
          onAction={() => navigate('/')}
        />
      </Stack>
    </Stack>
  )
}
