import { Controller } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'

@Controller('figma-plugin')
export class FigmaPluginController {
  constructor(private readonly configService: ConfigService<Config>) {}
}
