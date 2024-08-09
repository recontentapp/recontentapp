import { Command } from 'commander'
import { getApiClient } from '../utils/environment'
import { renderTable } from '../utils/stdout'

interface Flags {
  project?: string
}

type Resource = 'projects' | 'languages' | 'workspace' | 'email-templates'

const isValidResource = (resource: string): resource is Resource => {
  return ['projects', 'languages', 'workspace', 'email-templates'].includes(
    resource,
  )
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

    if (resource === 'email-templates' && !flags.project) {
      command.error('A project must be specified to get email-templates.')
    }

    const apiClient = getApiClient(command)
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
      case 'email-templates': {
        const res = await apiClient.listEmailTemplates({
          queryParams: {
            projectId: flags.project!,
          },
        })
        if (!res.ok) {
          command.error('Failed to fetch email-templates.')
        }
        res.data.items.forEach(project => {
          items.push({ id: project.id, label: project.key })
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

    renderTable({
      headers: ['ID', 'Label'],
      rows: items.map(item => [item.id, item.label]),
    })
  })

export default getCommand
