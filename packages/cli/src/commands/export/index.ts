import { Command } from 'commander'
import { exportEmailTemplates } from './email-template'
import { exportPhrases } from './phrases'
import { Flags } from './types'

type Resource = 'phrases' | 'email-templates'

const isValidResource = (resource: string): resource is Resource => {
  return ['phrases', 'email-templates'].includes(resource)
}

const exportCommand = new Command('export')
  .summary('Export resources')
  .description(
    'Downloads phrase translations or email templates and outputs them in a chosen format.',
  )
  .addHelpText(
    'after',
    `
Export phrases:
$ recontentapp export phrases -p <project_id> -f json -o './translations/{{ languageName }}{{ fileExtension }}'    
$ recontentapp export phrases -p <project_id> -f json -o './{{ languageName }}_{{ languageLocale }}{{ fileExtension }}'    

Export email templates:
$ recontentapp export email-templates <email_template_id> -f html -o './email-templates/{{ key }}/{{ languageName }}{{ fileExtension }}'
$ recontentapp export email-templates <email_template_id> -f mjml -o './email-templates/{{ key }}-{{ languageName }}{{ fileExtension }}'
`,
  )
  .argument('<resource>', 'phrases, email-template')
  .argument('[id]', 'Resource ID')
  .option('-p, --project <id>')
  .option('-l --languages <id>,<id>', 'Language IDs')
  .option('-f --format <format>', 'Output format', 'json')
  .option('-o --output <path>', 'Output path')
  .action(
    async (
      resource: string,
      resourceId: string | undefined,
      flags: Flags,
      command: Command,
    ) => {
      if (!isValidResource(resource)) {
        command.error(
          'Invalid resource, please use phrases or email-templates.',
        )
      }

      if (resource === 'email-templates' && !resourceId) {
        command.error('An id must be provided for email templates.')
      }

      switch (resource) {
        case 'phrases': {
          await exportPhrases({ flags, command })
          break
        }

        case 'email-templates': {
          await exportEmailTemplates({ id: resourceId!, flags, command })
          break
        }
      }
    },
  )

export default exportCommand
