import { Command } from 'commander'
import path from 'path'
import { getApiClient } from '../../utils/environment'
import { writeFile } from '../../utils/fs'
import { EMAIL_TEMPLATES_DEFAULT_EXPORT_OUTPUT } from './constants'
import { Flags } from './types'
import { formatOutputPath } from './utils'

interface ExportEmailTemplatesParams {
  id: string
  command: Command
  flags: Flags
}

const fileFormats = ['html', 'mjml']

const isValidFileFormat = (format: string): format is 'html' | 'mjml' => {
  return fileFormats.includes(format)
}

const fileExtensions = {
  html: '.html',
  mjml: '.mjml',
}

export const exportEmailTemplates = async ({
  id,
  flags,
  command,
}: ExportEmailTemplatesParams) => {
  const format = String(flags.format)

  if (!isValidFileFormat(format)) {
    command.error(`Invalid format, possible values: ${fileFormats.join(', ')}`)
    return
  }

  const languageIds = flags.languages?.split(',') ?? []

  const apiClient = getApiClient(command)

  const res = await apiClient.exportEmailTemplates({
    body: {
      id,
      languageIds,
      format,
    },
  })
  if (!res.ok) {
    command.error('Failed to fetch email templates.')
    return
  }

  if (languageIds.length === 0) {
    const filePath = formatOutputPath({
      template: flags.output ?? EMAIL_TEMPLATES_DEFAULT_EXPORT_OUTPUT,
      variables: {
        fileExtension: fileExtensions[format],
        language: {
          name: 'default',
          locale: 'default',
        },
        key: res.data.key,
      },
    })
    if (!filePath) {
      command.error('Failed to format output path.')
      return
    }

    writeFile(
      path.resolve(process.cwd(), filePath),
      res.data.default.content ?? '',
    )
  }

  for (const translation of res.data.translations) {
    const filePath = formatOutputPath({
      template: flags.output ?? EMAIL_TEMPLATES_DEFAULT_EXPORT_OUTPUT,
      variables: {
        fileExtension: fileExtensions[format],
        language: translation.language,
        key: res.data.key,
      },
    })
    if (!filePath) {
      command.error('Failed to format output path.')
      return
    }

    writeFile(
      path.resolve(process.cwd(), filePath),
      res.data.default.content ?? '',
    )
  }
}
