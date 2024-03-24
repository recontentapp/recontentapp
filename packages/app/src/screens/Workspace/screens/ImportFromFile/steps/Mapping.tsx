import { Dispatch, SetStateAction, useMemo } from 'react'
import { State } from '../types'
import {
  Banner,
  Box,
  Button,
  Heading,
  SelectField,
  Stack,
  Table,
} from '../../../../../components/primitives'

interface Props {
  state: State
  updateState: Dispatch<SetStateAction<State>>
  onSubmit: () => void
  isLoading: boolean
}

export const Mapping = ({ state, updateState, onSubmit, isLoading }: Props) => {
  const { rowStartIndex, sheetIndex, keyColumnIndex, translationColumnIndex } =
    state.mapping!

  const data: string[][] = useMemo(() => {
    if (state.csvPreviewData) {
      return state.csvPreviewData.slice(rowStartIndex)
    }

    if (state.excelPreviewData) {
      return (state.excelPreviewData.at(sheetIndex)?.data ?? []).slice(
        rowStartIndex,
      )
    }

    return []
  }, [state, sheetIndex, rowStartIndex])

  const canBeSubmitted =
    keyColumnIndex !== undefined && translationColumnIndex !== undefined

  const onLocalSubmit = () => {
    if (!canBeSubmitted) {
      return
    }

    onSubmit()
  }

  return (
    <Stack direction="column" spacing="$space300">
      <Banner
        variation="info"
        title="How should your data be imported?"
        description="Select which columns should be used to determine the key & translation. Rows with empty values will be ignored. If a key already exists, its content will be replaced by the one in this import."
      />
      <Stack direction="row" spacing="$space100">
        <SelectField
          label="Content starts at row"
          options={Array.from({ length: 10 }).map((_, index) => ({
            label: `Row ${index + 1}`,
            value: String(index),
          }))}
          value={String(rowStartIndex)}
          onChange={option => {
            if (!option) {
              return
            }

            updateState(state => ({
              ...state,
              mapping: {
                ...state.mapping!,
                rowStartIndex: Number(option.value),
              },
            }))
          }}
        />

        {state.excelPreviewData && state.excelPreviewData.length > 1 && (
          <SelectField
            label="Sheet"
            onChange={option => {
              if (!option) {
                return
              }

              updateState(state => ({
                ...state,
                mapping: {
                  ...state.mapping!,
                  sheetIndex: Number(option.value),
                },
              }))
            }}
            value={String(sheetIndex)}
            options={state.excelPreviewData.map((item, index) => ({
              label: item.name,
              value: String(index),
            }))}
          />
        )}
      </Stack>

      <Stack direction="column" spacing="$space80">
        <Heading renderAs="h2" size="$size100">
          Preview first rows
        </Heading>

        <Table<string[], string>
          items={data}
          columns={Array.from({ length: data[0].length }).map((_, index) => ({
            key: String(index),
            headerCell: (
              <Box paddingY="$space60">
                <SelectField
                  width="calc(100% - 8px)"
                  label="What is it?"
                  hideLabel
                  onChange={option => {
                    if (!option) {
                      return
                    }

                    if (option.value === 'key') {
                      updateState(state => ({
                        ...state,
                        mapping: {
                          ...state.mapping!,
                          keyColumnIndex: index,
                        },
                      }))
                    } else if (option.value === 'translation') {
                      updateState(state => ({
                        ...state,
                        mapping: {
                          ...state.mapping!,
                          translationColumnIndex: index,
                        },
                      }))
                    }
                  }}
                  placeholder="Column mapping"
                  value={
                    index === keyColumnIndex
                      ? 'key'
                      : index === translationColumnIndex
                        ? 'translation'
                        : undefined
                  }
                  options={[
                    { label: 'Key', value: 'key' },
                    {
                      label: `"${state.languageName}" translation`,
                      value: 'translation',
                    },
                  ]}
                />
              </Box>
            ),
            bodyCell: arr => (
              <span
                title={arr[index]}
                style={{
                  width: '100%',
                  display: 'inline-block',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {arr[index]}
              </span>
            ),
          }))}
        />
      </Stack>

      <Box>
        <Button
          onAction={onLocalSubmit}
          type="submit"
          variation="primary"
          isDisabled={!canBeSubmitted}
          isLoading={isLoading}
        >
          Add phrases
        </Button>
      </Box>
    </Stack>
  )
}
