import { Box, Button, IconButton, Stack, TextField } from 'design-system'
import { Dispatch, SetStateAction } from 'react'
import { Variable } from '../../types'

interface Props {
  variables: Variable[]
  setVariables: Dispatch<SetStateAction<Variable[]>>
  addVariable: () => void
}

export const Template = ({ variables, setVariables, addVariable }: Props) => {
  return (
    <Stack
      paddingTop="$space80"
      width="100%"
      direction="column"
      spacing="$space200"
    >
      {variables.map((variable, index) => (
        <Stack
          alignItems="flex-end"
          spacing="$space80"
          direction="row"
          key={index}
        >
          <TextField
            value={variable.key}
            label="Key"
            placeholder="title"
            onChange={value => {
              setVariables([
                ...variables.slice(0, index),
                { ...variable, key: value },
                ...variables.slice(index + 1),
              ])
            }}
          />

          <Box flexGrow={1}>
            <TextField
              width="100%"
              value={variable.defaultContent}
              label="Default content"
              placeholder="Hello World"
              onChange={value => {
                setVariables([
                  ...variables.slice(0, index),
                  { ...variable, defaultContent: value },
                  ...variables.slice(index + 1),
                ])
              }}
            />
          </Box>

          <Box paddingBottom="$space40">
            <IconButton
              src="delete"
              type="button"
              onAction={() => {
                setVariables([
                  ...variables.slice(0, index),
                  ...variables.slice(index + 1),
                ])
              }}
            />
          </Box>
        </Stack>
      ))}

      <Box>
        <Button
          icon="add"
          type="button"
          variation="primary"
          onAction={addVariable}
        >
          Add variable
        </Button>
      </Box>
    </Stack>
  )
}
