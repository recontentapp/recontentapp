import { Controller, Get } from '@nestjs/common'

@Controller('public-api')
export class PublicApiController {
  constructor() {}

  @Get('/workspaces/me')
  async getMyWorkspaces() {
    return 'Hello World'
  }
}
