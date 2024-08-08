import { Box, Heading, Stack, Text } from 'design-system'
import { Dispatch, SetStateAction, useMemo } from 'react'
import { Panel, PanelResizeHandle } from 'react-resizable-panels'
import { PhraseEditor } from '../../../../components/PhraseEditor'
import { SubToolbar } from './SubToolbar'
import { Variable } from './types'

interface Props {
  variables: Variable[]
  setVariables: Dispatch<SetStateAction<Variable[]>>
  languages: Array<{ label: string; value: string }>
}

export const ContentPanel = ({ variables, setVariables, languages }: Props) => {
  const initialVariables = useMemo(() => variables, [])

  return (
    <>
      <Panel
        id="content"
        order={1}
        defaultSize={50}
        minSize={20}
        style={{ overflowY: 'auto' }}
      >
        <SubToolbar>
          <Text size="$size80" variation="semiBold" color="$gray14">
            Content editor
          </Text>
        </SubToolbar>

        {variables.length === 0 && (
          <Box
            width="100%"
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Stack maxWidth={400} direction="column" spacing="$space40">
              <Heading textAlign="center" renderAs="h2" size="$size100">
                No content to edit
              </Heading>
              <Text
                lineHeight="$lineHeight200"
                textAlign="center"
                size="$size100"
                color="$gray11"
              >
                Start by creating variables & use them in your template to
                localize content.
              </Text>
            </Stack>
          </Box>
        )}

        {variables.length > 0 && (
          <Stack
            width="100%"
            direction="column"
            paddingX="$space100"
            paddingTop="$space100"
            paddingBottom="$space300"
            spacing="$space300"
          >
            {variables.map((variable, index) => (
              <Stack direction="column" spacing="$space100" key={index}>
                <Heading size="$size200" renderAs="h2">
                  {variable.key}
                </Heading>

                <PhraseEditor
                  label="Default value"
                  initialValue={variable.defaultContent}
                  onChange={val => {
                    setVariables(variables =>
                      variables.map((v, i) =>
                        i === index ? { ...v, defaultContent: val } : v,
                      ),
                    )
                  }}
                />

                {languages.map((language, languageIndex) => (
                  <PhraseEditor
                    key={languageIndex}
                    label={language.label}
                    initialValue={
                      initialVariables[index]?.translations[language.value]
                    }
                    onChange={val => {
                      setVariables(variables => {
                        const newVariables = [...variables]

                        newVariables[index] = {
                          ...newVariables[index],
                          translations: {
                            ...(newVariables[index].translations ?? {}),
                            [language.value]: val,
                          },
                        }

                        return newVariables
                      })
                    }}
                  />
                ))}
              </Stack>
            ))}
          </Stack>
        )}
      </Panel>

      <PanelResizeHandle />
    </>
  )
}
