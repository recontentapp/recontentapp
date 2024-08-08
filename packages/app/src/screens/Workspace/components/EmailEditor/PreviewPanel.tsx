import {
  Box,
  Heading,
  Icon,
  MinimalButton,
  SelectField,
  Stack,
  Text,
} from 'design-system'
import { HTMLRenderResult } from 'email-renderer'
import { ElementRef, useCallback, useMemo, useRef, useState } from 'react'
import { Panel } from 'react-resizable-panels'
import useDebouncedCallback from '../../../../hooks/debouncedCallback'
import { SubToolbar } from './SubToolbar'

interface Props {
  preview: HTMLRenderResult | null
  previewOptions: Array<{ label: string; value: string }>
  onChangePreviewOption: (value: string | null) => void
}

const EMPTY_VALUE = '__null__'

export const PreviewPanel = ({
  preview,
  previewOptions,
  onChangePreviewOption,
}: Props) => {
  const [size, setSize] = useState<'desktop' | 'mobile'>('desktop')
  const [value, setValue] = useState(EMPTY_VALUE)
  const iframeRef = useRef<ElementRef<'iframe'>>(null)
  const onResize = useDebouncedCallback(() => {
    console.log('COUCOU')
    iframeRef.current?.contentWindow?.location.reload()
  }, 100)

  const finalPreviewOptions = useMemo(
    () => [
      {
        label: 'Default values',
        value: EMPTY_VALUE,
      },
      ...previewOptions,
    ],
    [previewOptions],
  )

  const onChange = useCallback(
    (value: string) => {
      setValue(value)

      if (value === EMPTY_VALUE) {
        onChangePreviewOption(null)
        return
      }

      onChangePreviewOption(value)
    },
    [onChangePreviewOption],
  )

  return (
    <Panel
      id="preview"
      order={2}
      defaultSize={50}
      minSize={20}
      onResize={onResize}
    >
      <Stack width="100%" height="100%" direction="column" flexWrap="nowrap">
        <SubToolbar css={{ borderLeft: '1px solid $gray7' }}>
          <Stack
            width="100%"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing="$space80">
              <Text size="$size80" variation="semiBold" color="$gray14">
                Preview
              </Text>

              <SelectField
                label="Choose preview mode"
                size="small"
                hideLabel
                value={value}
                options={finalPreviewOptions}
                onChange={option => {
                  if (!option) {
                    return
                  }

                  onChange(option.value)
                }}
              />
            </Stack>

            <Stack direction="row">
              <MinimalButton
                size="xsmall"
                isActive={size === 'desktop'}
                onAction={() => setSize('desktop')}
                icon="desktop"
              >
                Desktop
              </MinimalButton>

              <MinimalButton
                size="xsmall"
                isActive={size === 'mobile'}
                onAction={() => setSize('mobile')}
                icon="mobile"
              >
                Mobile
              </MinimalButton>
            </Stack>
          </Stack>
        </SubToolbar>

        <Box width="100%" height="100%" display="flex" justifyContent="center">
          {preview?.html ? (
            <iframe
              ref={iframeRef}
              style={{
                width: size === 'mobile' ? 320 : '100%',
                height: '100%',
                overflowY: 'hidden',
              }}
              srcDoc={preview.html}
            />
          ) : (
            <Box
              width="100%"
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Stack
                maxWidth={360}
                direction="column"
                spacing="$space60"
                alignItems="center"
              >
                <Icon src="error" size={32} color="$orange400" />
                <Heading textAlign="center" renderAs="h2" size="$size100">
                  Preview not available
                </Heading>
                <Text
                  lineHeight="$lineHeight200"
                  textAlign="center"
                  size="$size100"
                  color="$gray11"
                >
                  Update your template to use valid syntax to see a preview.
                </Text>
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>
    </Panel>
  )
}
