import { Button, Spinner, Stack, TextField } from 'design-system'
import { useMemo, useRef, useState } from 'react'
import { useGetGlossary } from '../../../../../../../generated/reactQuery'
import { Components } from '../../../../../../../generated/typeDefinitions'
import { useDebouncedValue } from '../../../../../../../hooks/debouncedEffect'
import { useInfiniteListGlossaryTerms } from '../../../../Glossary/hooks'
import {
  ShowGlossaryTermModal,
  ShowGlossaryTermModalRef,
} from '../../ShowGlossaryTermModal'

interface Props {
  glossaryId: string
  project: Components.Schemas.Project
}

interface ListProps {
  glossaryId: string
  searchTerm: string
}

const List = ({ glossaryId, searchTerm }: ListProps) => {
  const showGlossaryTermModalRef = useRef<ShowGlossaryTermModalRef>(null!)
  const { data: glossary } = useGetGlossary({ queryParams: { id: glossaryId } })
  const { data, isPending } = useInfiniteListGlossaryTerms({
    glossaryId,
    query: searchTerm.length > 0 ? searchTerm : undefined,
    pageSize: 100,
  })

  const terms = useMemo(() => {
    return data?.pages.flatMap(page => page.items) ?? []
  }, [data])

  return (
    <Stack direction="column">
      {isPending && <Spinner size={16} color="$gray11" />}

      <Stack direction="column" spacing="$space40" renderAs="ul">
        {terms.map(term => (
          <li key={term.id}>
            <Button
              size="small"
              variation="secondary"
              isFullwidth
              onAction={() => {
                if (!glossary) {
                  return
                }
                showGlossaryTermModalRef.current.open(glossary, term)
              }}
            >
              {term.name}
            </Button>
          </li>
        ))}
      </Stack>

      <ShowGlossaryTermModal ref={showGlossaryTermModalRef} />
    </Stack>
  )
}

export const Glossary = ({ glossaryId }: Props) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500)

  return (
    <Stack
      direction="column"
      spacing="$space100"
      paddingX="$space100"
      paddingY="$space100"
    >
      <TextField
        label="Search"
        hideLabel
        placeholder="Search term..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      <List searchTerm={debouncedSearchTerm} glossaryId={glossaryId} />
    </Stack>
  )
}
