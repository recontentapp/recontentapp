import { Controller, Get, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APIKeyGuard } from 'src/modules/auth/api-key.guard'
import { AuthenticatedRequester } from 'src/modules/auth/requester.decorator'
import { Requester } from 'src/modules/auth/requester.object'
import { Config } from 'src/utils/config'

@Controller('figma-plugin')
@UseGuards(APIKeyGuard)
export class FigmaPluginController {
  constructor(private readonly configService: ConfigService<Config>) {}

  @Get('/Ping')
  async ping(@AuthenticatedRequester() requester: Requester) {
    const defaultWorkspaceId = requester.getDefaultWorkspaceID()

    const workspaceAccess =
      requester.getWorkspaceAccessOrThrow(defaultWorkspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    return {
      name: requester.getUserName(),
    }
  }
}
