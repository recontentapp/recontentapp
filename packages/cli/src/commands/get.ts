import { Command } from 'commander'
import { getEnvironment } from '../utils/environment'
import { getAPIClient } from '../generated/apiClient'
import { AsciiTable3 } from 'ascii-table3'

interface Flags {
  project?: string
}

type Resource = 'projects' | 'languages' | 'workspace'

const isValidResource = (resource: string): resource is Resource => {
  return ['projects', 'languages', 'workspace'].includes(resource)
}

const getCommand = new Command('get')
  .summary('Display one or many resources')
  .description(
    'Prints a table of the most important information about the specified resources.',
  )
  .argument('<resource>', 'projects, languages or workspace')
  .option('-p, --project <id>')
  .action(async (resource: string, flags: Flags, command: Command) => {
    if (!isValidResource(resource)) {
      command.error(
        'Invalid resource, please use projects, languages or workspace.',
      )
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

    const items: Array<{ id: string; label: string }> = []

    switch (resource) {
      case 'projects': {
        const res = await apiClient.listProjects({ queryParams: {} })
        if (!res.ok) {
          command.error('Failed to fetch projects.')
        }
        res.data.items.forEach(project => {
          items.push({ id: project.id, label: project.name })
        })
        break
      }
      case 'languages': {
        const res = await apiClient.listLanguages({
          queryParams: {
            projectId: flags.project,
          },
        })
        if (!res.ok) {
          command.error('Failed to fetch languages.')
        }
        res.data.items.forEach(project => {
          items.push({ id: project.id, label: project.name })
        })
        break
      }
      case 'workspace': {
        const res = await apiClient.getWorkspace()
        if (!res.ok) {
          command.error('Failed to fetch workspace.')
        }
        items.push({ id: res.data.id, label: res.data.name })
      }
    }

    const table = new AsciiTable3()
      .setHeading('ID', 'Label')
      .setStyle('compact')
    items.forEach(item => {
      table.addRow(item.id, item.label)
    })
    console.log(table.toString())
  })

export default getCommand
