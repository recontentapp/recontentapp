import { Heading, Icon, Stack, Text } from 'design-system'
import { ComponentType } from 'react'
import { Components } from '../generated/typeDefinitions'
import { useHasAbility } from '../hooks/workspace'

interface Props {
  component: ComponentType
  ability: Components.Schemas.WorkspaceAbility
}

const Forbidden = () => {
  return (
    <Stack
      direction="column"
      width="100%"
      spacing="$space100"
      alignItems="center"
      paddingY="$space200"
      justifyContent="center"
    >
      <Icon src="close" size={24} color="$purple800" />
      <Heading textAlign="center" size="$size200" color="$gray14" renderAs="h2">
        Access denied
      </Heading>
      <Text
        textAlign="center"
        lineHeight="$lineHeight200"
        maxWidth={400}
        size="$size100"
        color="$gray11"
      >
        Unfortunately, you do not have access to this page. Please contact one
        of your admins.
      </Text>
    </Stack>
  )
}

export const ProtectedRouteElement = ({
  component: Component,
  ability,
}: Props) => {
  const hasAbility = useHasAbility(ability)

  if (!hasAbility) {
    return <Forbidden />
  }

  return <Component />
}
