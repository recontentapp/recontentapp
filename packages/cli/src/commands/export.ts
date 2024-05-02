import { Command } from 'commander'
import path from 'path'
import { getApiClient } from '../utils/environment'
import { writeFile } from '../utils/fs'
import {
  renderCSV,
  renderJSON,
  renderNestedJSON,
  renderNestedYAML,
  renderYAML,
  fileFormatContentTypes,
  isValidFileFormat,
} from 'file-formats'

interface Flags {
  project: string
  language?: string
  format?: string
  output?: string
}

type Resource = 'phrases'

const isValidResource = (resource: string): resource is Resource => {
  return ['phrases'].includes(resource)
}

const exportCommand = new Command('export')
  .summary('Export phrases')
  .description(
    'Downloads phrase translations and outputs them in a chosen format.',
  )
  .argument('<resource>', 'phrases')
  .requiredOption('-p, --project <id>')
  .option('-l --language <id>', 'Language ID')
  .option('-f --format <format>', 'Output format', 'json')
  .option('-o --output <path>', 'Output directory', '.')
  .action(async (resource: string, flags: Flags, command: Command) => {
    if (!isValidResource(resource)) {
      command.error('Invalid resource, please use phrases.')
    }

    const format = String(flags.format)

    if (!isValidFileFormat(format)) {
      command.error(
        'Invalid format, please use json, nested-json, csv, yaml or nested-yaml.',
      )
    }

    const apiClient = getApiClient(command)
    const languages = await apiClient.listLanguages({
      queryParams: {
        projectId: flags.project,
      },
    })
    if (!languages.ok) {
      command.error('Failed to fetch languages.')
    }

    const languagesToExport: Array<{ id: string; name: string }> = []
    if (flags.language) {
      const language = languages.data.items.find(
        language => language.id === flags.language,
      )
      if (!language) {
        command.error('Language not found.')
      }
      languagesToExport.push(language)
    } else {
      languagesToExport.push(...languages.data.items)
    }

    const project = await apiClient.getProject({
      pathParams: { id: flags.project },
    })
    if (!project.ok) {
      command.error('Failed to fetch project.')
    }

    const files = await Promise.allSettled(
      languagesToExport.map(({ id }) =>
        apiClient.exportPhrases({
          body: {
            revisionId: project.data.masterRevisionId,
            languageId: id,
          },
        }),
      ),
    )

    const fileExtension = fileFormatContentTypes[format]

    for (const [index, file] of files.entries()) {
      if (file.status !== 'fulfilled' || !file.value.ok) {
        command.error('Failed to export phrases.')
      }

      const fileName = [languagesToExport[index].name, fileExtension].join('')

      let output = Buffer.from('')

      switch (format) {
        case 'json':
          output = await renderJSON(file.value.data.data)
          break
        case 'nested-json':
          output = await renderNestedJSON(file.value.data.data)
          break
        case 'csv':
          output = await renderCSV(file.value.data.data)
          break
        case 'yaml':
          output = await renderYAML(file.value.data.data)
          break
        case 'nested-yaml':
          output = await renderNestedYAML(file.value.data.data)
          break
      }

      writeFile(
        path.resolve(process.cwd(), String(flags.output), fileName),
        output.toString(),
      )
    }
  })

export default exportCommand
