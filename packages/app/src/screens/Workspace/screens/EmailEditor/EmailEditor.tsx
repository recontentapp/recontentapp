import { Button, MinimalButton, Stack, Text } from 'design-system'
import { useMemo, useState } from 'react'
import { PanelGroup } from 'react-resizable-panels'
import { useParams } from 'react-router-dom'
import { useGetProject } from '../../../../generated/reactQuery'
import { CodePanel } from './components/CodePanel'
import { ContentPanel } from './components/ContentPanel'
import { PreviewPanel } from './components/PreviewPanel'
import { Mode, Switch } from './components/Switch'
import { TOOLBAR_HEIGHT, Toolbar } from './components/Toolbars'
import { useEmailPreview } from './hooks'
import { Variable } from './types'

const layout = `<mjml version="3.3.3">
  <mj-body background-color="#F4F4F4" color="#55575d" font-family="Arial, sans-serif">
    <mj-section background-color="#C1272D" background-repeat="repeat" padding="20px 0" text-align="center" vertical-align="top">
      <mj-column>
      </mj-column>
    </mj-section>

    {{{ content }}}

    <mj-section background-color="#C1272D" background-repeat="repeat" padding="20px 0" text-align="center" vertical-align="top">
      <mj-column>
        <mj-text align="center" color="#ffffff" font-family="Arial, sans-serif" font-size="13px" line-height="22px" padding="10px 25px">Simply created&nbsp;on&nbsp;<a style="color:#ffffff" href="http://www.mailjet.com"><b>Mailjet Passport</b></a></mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-repeat="repeat" background-size="auto" padding="20px 0px 20px 0px" text-align="center" vertical-align="top">
      <mj-column>
        <mj-text align="center" color="#55575d" font-family="Arial, sans-serif" font-size="11px" line-height="22px" padding="0px 20px">[[DELIVERY_INFO]]</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`

const initialTemplate = `<mj-section background-color="#ffffff" background-repeat="repeat" padding="20px 0" text-align="center" vertical-align="top">
  <mj-column>
    <mj-image align="center" alt="Happy New Year!" container-background-color="#ffffff" padding="10px 25px" src="http://gkq4.mjt.lu/img/gkq4/b/18rxz/1hlvp.png" width="399px"></mj-image>
  </mj-column>
</mj-section>
<mj-section background-color="#ffffff" background-repeat="repeat" background-size="auto" padding="20px 0px 20px 0px" text-align="center" vertical-align="top">
  <mj-column>
    <mj-text align="center" color="#55575d" font-family="Arial, sans-serif" font-size="14px" line-height="28px" padding="0px 25px 0px 25px">New dreams, new hopes, new experiences and new joys, we wish you all the best for this New Year to come in 2018!</mj-text>
    <mj-image align="center" alt="Best wishes from all the Clothes Team!" padding="10px 25px" src="http://gkq4.mjt.lu/img/gkq4/b/18rxz/1hlv8.png" width="142px"></mj-image>
  </mj-column>
</mj-section>
`

export const EmailEditor = () => {
  const params = useParams<'projectId'>()
  const { data: project } = useGetProject({
    queryParams: {
      id: params.projectId!,
    },
  })
  const languages =
    project?.languages.map(l => ({
      value: l.id,
      label: l.name,
    })) ?? []
  const [mode, setMode] = useState<Mode>('code')
  const layoutVariables: Variable[] = useMemo(
    () => [
      { key: 'backgroundColor', defaultContent: '#ff0000', translations: {} },
    ],
    [],
  )
  const {
    preview,
    value,
    setValue,
    variables,
    setVariables,
    onChangePreviewOption,
  } = useEmailPreview({
    layout,
    layoutVariables,
    initialValue: initialTemplate,
    initialVariables: [],
  })

  return (
    <Stack direction="column" flexWrap="nowrap">
      <Toolbar>
        <Stack
          width="100%"
          alignItems="center"
          direction="row"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing="$space60">
            <Text size="$size100" variation="semiBold" color="$gray14">
              My awesome template
            </Text>

            <MinimalButton icon="settings" onAction={() => {}}>
              Settings
            </MinimalButton>
          </Stack>

          <Stack direction="row" alignItems="center" spacing="$space100">
            <Switch value={mode} onChange={setMode} />

            <Button variation="primary" onAction={() => {}}>
              Save changes
            </Button>
          </Stack>
        </Stack>
      </Toolbar>

      <PanelGroup
        direction="horizontal"
        style={{ height: `calc(100vh - ${TOOLBAR_HEIGHT}px)` }}
      >
        {mode === 'code' && (
          <CodePanel
            value={value}
            setValue={setValue}
            variables={variables}
            setVariables={setVariables}
            layoutVariables={layoutVariables}
          />
        )}

        {mode === 'content' && (
          <ContentPanel
            variables={variables}
            setVariables={setVariables}
            languages={languages}
          />
        )}

        <PreviewPanel
          preview={preview}
          previewOptions={languages}
          onChangePreviewOption={onChangePreviewOption}
        />
      </PanelGroup>
    </Stack>
  )
}
