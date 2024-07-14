import { Heading, Stack } from 'design-system'
import { useRef } from 'react'
import { useHasAbility } from '../../../../../hooks/workspace'
import { AddCard } from '../../../components/AddCard'
import { LinkGlossaryModal, LinkGlossaryModalRef } from './LinkGlossaryModal'

interface Props {
  projectId: string
}

export const LinkGlossary = ({ projectId }: Props) => {
  const canManageGlossaries = useHasAbility('glossaries:manage')
  const linkGlossaryModalRef = useRef<LinkGlossaryModalRef>(null!)

  if (!canManageGlossaries) {
    return null
  }

  return (
    <Stack width="100%" direction="column" spacing="$space80">
      <Stack direction="row" alignItems="center" spacing="$space60">
        <Heading size="$size100" color="$gray14" renderAs="h2">
          Glossary
        </Heading>
      </Stack>

      <AddCard
        title="Link a glossary"
        description="Once a glossary in attached to a project, it is displayed in the phrase editor & used for autotranslation."
        icon="link"
        onAction={() => linkGlossaryModalRef.current.open(projectId)}
      />

      <LinkGlossaryModal ref={linkGlossaryModalRef} />
    </Stack>
  )
}
