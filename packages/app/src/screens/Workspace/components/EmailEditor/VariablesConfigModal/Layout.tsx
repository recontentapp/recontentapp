import { Stack, Text } from 'design-system'
import { styled } from '../../../../../theme'
import { Variable } from '../types'
import { Tag } from './Tag'

interface Props {
  variables: Variable[]
}

const Table = styled('table', {
  width: '100%',
  borderCollapse: 'collapse',
  borderSpacing: 0,
  marginTop: '$space40',
  marginBottom: '$space40',
  '& th': {
    textAlign: 'left',
    padding: '$space40',
    borderBottom: '1px solid $gray6',
    paddingY: '$space60',
  },
  '& td': {
    padding: '$space40',
    borderBottom: '1px solid $gray6',
    paddingY: '$space60',
  },
})

export const Layout = ({ variables }: Props) => {
  return (
    <Stack direction="column">
      {variables.length === 0 ? (
        <Text size="$size80" color="$gray11">
          The layout used by this template does not contain any available
          variable.
        </Text>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>
                <Text size="$size80" variation="semiBold" color="$gray14">
                  Variable
                </Text>
              </th>
              <th>
                <Text size="$size80" variation="semiBold" color="$gray14">
                  Default content
                </Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {variables.map(variable => (
              <tr key={variable.key}>
                <td>
                  <Tag css={{ paddingY: '$space40' }}>{variable.key}</Tag>
                </td>
                <td>
                  <Text color="$gray14" size="$size100">
                    {variable.defaultContent}
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Stack>
  )
}
