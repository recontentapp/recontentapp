import {
  FC,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useQueryClient } from '@tanstack/react-query'
import {
  Badge,
  Heading,
  Modal,
  ModalContent,
  ModalRef,
  Stack,
  Table,
  Text,
} from 'design-system'
import { useListWorkspaceLanguages } from '../../../../../generated/reactQuery'
import { Components } from '../../../../../generated/typeDefinitions'

export interface ShowGlossaryTermModalRef {
  open: (
    glossary: Components.Schemas.Glossary,
    term: Components.Schemas.GlossaryTerm,
  ) => void
  close: () => void
}

interface ContentProps {
  glossary: Components.Schemas.Glossary
  term: Components.Schemas.GlossaryTerm
  close: () => void
}

const Content: FC<ContentProps> = ({ glossary, term, close }) => {
  const queryClient = useQueryClient()
  const { data } = useListWorkspaceLanguages({
    queryParams: {
      workspaceId: glossary.workspaceId,
    },
  })

  const languagesMap = useMemo(() => {
    if (!data) {
      return {}
    }

    return data.reduce<Record<string, Components.Schemas.Language>>(
      (acc, language) => {
        acc[language.id] = language
        return acc
      },
      {},
    )
  }, [data])

  const shouldShowMetadata =
    term.caseSensitive || term.forbidden || term.nonTranslatable

  return (
    <ModalContent contextTitle={glossary.name} title={term.name}>
      <Stack direction="column" spacing="$space100" paddingBottom="$space500">
        <Stack direction="column" spacing="$space60">
          <Heading renderAs="h2" size="$size200" color="$gray14">
            {term.name}
          </Heading>

          {term.description && (
            <Text size="$size80" color="$gray14">
              {term.description}
            </Text>
          )}

          {shouldShowMetadata && (
            <Stack direction="row" spacing="$space80">
              {term.caseSensitive && (
                <Badge size="small" variation="primary">
                  Case sensitive
                </Badge>
              )}
              {term.forbidden && (
                <Badge size="small" variation="primary">
                  Forbidden
                </Badge>
              )}
              {term.nonTranslatable && (
                <Badge size="small" variation="primary">
                  Non translatable
                </Badge>
              )}
            </Stack>
          )}
        </Stack>

        {term.translations.length > 0 && (
          <Table
            columns={[
              {
                key: 'language',
                headerCell: 'Language',
                bodyCell: item => item.language,
                isPrimary: true,
                width: 80,
              },
              {
                key: 'content',
                headerCell: 'Translation',
                bodyCell: item => item.content,
              },
            ]}
            items={term.translations.map(translation => ({
              language: languagesMap[translation.languageId].name,
              content: translation.content,
            }))}
          />
        )}
      </Stack>
    </ModalContent>
  )
}

export const ShowGlossaryTermModal = forwardRef<ShowGlossaryTermModalRef>(
  (_props, ref) => {
    const [glossary, setGlossary] =
      useState<Components.Schemas.Glossary | null>(null)
    const [term, setTerm] = useState<Components.Schemas.GlossaryTerm | null>(
      null,
    )
    const modalRef = useRef<ModalRef>(null!)

    useImperativeHandle(ref, () => ({
      open: (glossary, term) => {
        setGlossary(glossary)
        setTerm(term)
        modalRef.current.open()
      },
      close: () => {
        modalRef.current.close()
      },
    }))

    const close = useCallback(() => {
      modalRef.current.close()
    }, [])

    return (
      <Modal ref={modalRef}>
        {glossary && term && (
          <Content glossary={glossary} term={term} close={close} />
        )}
      </Modal>
    )
  },
)
