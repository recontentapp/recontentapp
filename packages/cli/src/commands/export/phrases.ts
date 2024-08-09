import {
  fileFormatExtensions,
  fileFormats,
  isValidFileFormat,
  renderAndroidXML,
  renderAppleStrings,
  renderCSV,
  renderExcel,
  renderJSON,
  renderNestedJSON,
  renderNestedYAML,
  renderPHPArrays,
  renderYAML,
} from '@recontentapp/file-formats'
import { Command } from 'commander'
import path from 'path'
import { getApiClient } from '../../utils/environment'
import { writeFile } from '../../utils/fs'
import { DEFAULT_EXPORT_OUTPUT } from './constants'
import { Flags } from './types'
import { formatOutputPath } from './utils'

interface ExportPhrasesParams {
  command: Command
  flags: Flags
}

export const exportPhrases = async ({
  flags,
  command,
}: ExportPhrasesParams) => {
  const format = String(flags.format)

  if (!isValidFileFormat(format)) {
    command.error(`Invalid format, possible values: ${fileFormats.join(', ')}`)
    return
  }

  if (!flags.project) {
    command.error('Project is required.')
    return
  }

  const apiClient = getApiClient(command)

  const languages = await apiClient.listLanguages({
    queryParams: {
      projectId: flags.project,
    },
  })

  if (!languages.ok) {
    command.error('Failed to fetch languages.')
    return
  }

  let languagesToExport: string[] = []
  if (flags.languages) {
    const requestedLanguageIds = flags.languages.split(',')
    const existingLanguageIds = languages.data.items.filter(language =>
      requestedLanguageIds.includes(language.id),
    )

    if (existingLanguageIds.length !== requestedLanguageIds.length) {
      command.error('Some requested languages could not be found.')
      return
    }

    languagesToExport = requestedLanguageIds
  } else {
    languagesToExport = languages.data.items.map(language => language.id)
  }

  const project = await apiClient.getProject({
    pathParams: { id: flags.project },
  })

  if (!project.ok) {
    command.error('Failed to fetch project.')
    return
  }

  const files = await Promise.allSettled(
    languagesToExport.map(id =>
      apiClient.exportPhrases({
        body: {
          revisionId: project.data.masterRevisionId,
          languageId: id,
        },
      }),
    ),
  )

  const fileExtension = fileFormatExtensions[format]

  for (const file of files) {
    if (file.status !== 'fulfilled' || !file.value.ok) {
      command.error('Failed to export phrases.')
      return
    }

    let output = Buffer.from('')

    switch (format) {
      case 'json':
        output = await renderJSON(file.value.data.data)
        break
      case 'nested_json':
        output = await renderNestedJSON(file.value.data.data)
        break
      case 'csv':
        output = await renderCSV(file.value.data.data)
        break
      case 'yaml':
        output = await renderYAML(file.value.data.data)
        break
      case 'nested_yaml':
        output = await renderNestedYAML(file.value.data.data)
        break
      case 'excel':
        output = await renderExcel(file.value.data.data)
        break
      case 'android_xml':
        output = await renderAndroidXML(file.value.data.data)
        break
      case 'apple_strings':
        output = await renderAppleStrings(file.value.data.data)
        break
      case 'php_arrays':
        output = await renderPHPArrays(file.value.data.data)
        break
    }

    const filePath = formatOutputPath({
      template: flags.output ?? DEFAULT_EXPORT_OUTPUT,
      variables: {
        fileExtension,
        language: file.value.data.language,
        key: project.data.id,
      },
    })
    if (!filePath) {
      command.error('Failed to format output path.')
      return
    }

    writeFile(path.resolve(process.cwd(), filePath), output.toString())
  }
}
