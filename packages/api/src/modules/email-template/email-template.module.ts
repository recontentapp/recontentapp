import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { EmailLayoutService } from './email-layout.service'
import { EmailTemplateService } from './email-template.service'

@Module({
  providers: [PrismaService, EmailTemplateService, EmailLayoutService],
  exports: [EmailTemplateService, EmailLayoutService],
})
export class EmailTemplateModule {}
