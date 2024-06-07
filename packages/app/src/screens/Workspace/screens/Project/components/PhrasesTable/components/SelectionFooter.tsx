import { QueryKey, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  ConfirmationModal,
  ConfirmationModalRef,
  Stack,
  Text,
  Tooltip,
  toast,
} from 'design-system'
import { useRef } from 'react'
import { useBatchDeletePhrase } from '../../../../../../../generated/reactQuery'
import { Components } from '../../../../../../../generated/typeDefinitions'
import { ApplyTagsModal, ApplyTagsModalRef } from '../../ApplyTagsModal'

interface Props {
  projectId: string
  selectedPhrases: Components.Schemas.PhraseItem[]
  phrasesQueryKey: QueryKey
  onBatchSuccess: () => void
}

export const SelectionFooter = ({
  projectId,
  selectedPhrases,
  phrasesQueryKey,
  onBatchSuccess,
}: Props) => {
  const queryClient = useQueryClient()
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)
  const applyTagsModalRef = useRef<ApplyTagsModalRef>(null!)

  const { mutateAsync: batchDeletePhrases } = useBatchDeletePhrase({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: phrasesQueryKey,
      })
    },
  })

  const onRequestBatchDeletePhrases = (ids: string[]) => {
    confirmationModalRef.current.confirm().then(result => {
      if (!result) {
        return
      }

      batchDeletePhrases({
        body: { ids },
      })
        .then(() => {
          toast('success', {
            title: 'Phrases deleted',
          })
          onBatchSuccess()
        })
        .catch(() => {
          toast('error', {
            title: 'Could not delete phrases',
            description: 'Feel free to try later or contact us',
          })
        })
    })
  }

  const canBatch = selectedPhrases.length <= 50

  return (
    <Box paddingY="$space60" paddingX="$space80">
      <Stack
        direction="row"
        width="100%"
        spacing="$space100"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text size="$size80" color="$white" variation="bold">
          {selectedPhrases.length} selected phrase(s)
        </Text>

        <Tooltip
          title="Batch actions can be performed on 50 items max."
          position="top"
          wrap
          isDisabled={canBatch}
        >
          <Stack direction="row" spacing="$space60" alignItems="center">
            <Button
              variation="primary"
              icon="local_offer"
              size="xsmall"
              isDisabled={!canBatch}
              isLoading={false}
              onAction={() =>
                applyTagsModalRef.current.open(
                  selectedPhrases.map(phrase => phrase.id),
                )
              }
            >
              Apply tags
            </Button>
            <Button
              variation="danger"
              icon="delete"
              size="xsmall"
              isDisabled={!canBatch}
              isLoading={false}
              onAction={() =>
                onRequestBatchDeletePhrases(
                  selectedPhrases.map(phrase => phrase.id),
                )
              }
            >
              Delete
            </Button>
          </Stack>
        </Tooltip>
      </Stack>

      <ConfirmationModal
        ref={confirmationModalRef}
        title="Are you sure about deleting these phrases"
        description="Once deleted, phrases can not be recovered."
        variation="danger"
      />

      <ApplyTagsModal
        ref={applyTagsModalRef}
        projectId={projectId}
        onApply={onBatchSuccess}
      />
    </Box>
  )
}
