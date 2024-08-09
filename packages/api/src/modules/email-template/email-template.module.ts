import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { EmailLayoutService } from './email-layout.service'
import { EmailRenderService } from './email-render.service'
import { EmailTemplateService } from './email-template.service'

@Module({
  providers: [
    PrismaService,
    EmailTemplateService,
    EmailLayoutService,
    EmailRenderService,
  ],
  exports: [EmailTemplateService, EmailLayoutService, EmailRenderService],
})
export class EmailTemplateModule {}
