import { Command } from 'commander'
import path from 'path'
import { getEnvironment } from '../utils/environment'
import { getAPIClient } from '../generated/apiClient'
import { writeFile } from '../utils/fs'

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

type Format = 'json' | 'nested-json'
const isValidFormat = (format: string): format is Format => {
  return ['json', 'nested-json'].includes(format)
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
  .option('-o --output <path>', 'Output directory')
  .action(async (resource: string, flags: Flags, command: Command) => {
    if (!isValidResource(resource)) {
      command.error('Invalid resource, please use phrases.')
    }

    if (!isValidFormat(String(flags.format))) {
      command.error('Invalid format, please use json or nested-json.')
    }

    const { apiKey, apiUrl } = getEnvironment()
    const apiClient = getAPIClient({
      baseUrl: apiUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      onError: () => {
        command.error('API request failed.')
      },
    })

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

    for (const [index, file] of files.entries()) {
      if (file.status !== 'fulfilled' || !file.value.ok) {
        command.error('Failed to export phrases.')
      }

      const fileName = `${languagesToExport[index].name}.json`

      writeFile(
        path.resolve(process.cwd(), fileName),
        JSON.stringify(file.value.data.data, null, 2),
      )
    }
  })

export default exportCommand
