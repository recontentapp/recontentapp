import { Command } from 'commander'
import { getEnvironment } from '../utils/environment'
import { getAPIClient } from '../generated/apiClient'

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
  .argument('<resource>', 'string to split')
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

    switch (resource) {
      case 'projects':
        apiClient.listProjects({ queryParams: {} })
        break
      case 'languages':
        console.log('Getting languages...')
        break
      case 'workspace':
        console.log('Getting workspace...')
        break
    }
  })

export default getCommand
