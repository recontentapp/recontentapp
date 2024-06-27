import { Button, Stack, Text } from 'design-system'
import { useRef } from 'react'
import { useHasAbility } from '../../../../../hooks/workspace'
import { LinkGlossaryModal, LinkGlossaryModalRef } from './LinkGlossaryModal'

interface Props {
  projectId: string
}

export const LinkGlossary = ({ projectId }: Props) => {
  const canManageGlossaries = useHasAbility('glossaries:manage')
  const linkGlossaryModalRef = useRef<LinkGlossaryModalRef>(null!)

  if (!canManageGlossaries) {
    return (
      <Text size="$size100" color="$gray14">
        Your project does not have any glossary linked to it. Contact an admin
        to add one.
      </Text>
    )
  }

  return (
    <Stack direction="column">
      <Button
        variation="primary"
        onAction={() => linkGlossaryModalRef.current.open(projectId)}
      >
        Link glossary
      </Button>

      <LinkGlossaryModal ref={linkGlossaryModalRef} />
    </Stack>
  )
}
