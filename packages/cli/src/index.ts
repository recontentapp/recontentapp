#!/usr/bin/env node
import { Command, program } from 'commander'
import getCommand from './commands/get'
import exportCommand from './commands/export'
import { API_KEY_ENV, getEnvironment } from './utils/environment'

program
  .name('recontentapp')
  .description('Ship localized content faster without loosing engineers time')
  .version('0.4.3')
  .hook('preAction', (command: Command) => {
    const { apiKey } = getEnvironment()
    if (!apiKey) {
      command.error(`${API_KEY_ENV} environment variable is required.`)
    }
  })
  .addCommand(getCommand)
  .addCommand(exportCommand)

program.parse()
