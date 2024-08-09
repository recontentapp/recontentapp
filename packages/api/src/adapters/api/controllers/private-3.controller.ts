import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { Paths } from 'src/generated/typeDefinitions'
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard'
import { AuthenticatedRequester } from 'src/modules/auth/requester.decorator'
import { Requester } from 'src/modules/auth/requester.object'
import { EmailLayoutService } from 'src/modules/email-template/email-layout.service'
import { EmailTemplateService } from 'src/modules/email-template/email-template.service'
import { Pagination, PaginationParams } from 'src/utils/pagination'
import { RequiredQuery } from 'src/utils/required-query'
import {
  CreateLayoutDto,
  CreateTemplateDto,
  DeleteLayoutDto,
  DeleteTemplateDto,
  UpdateLayoutDto,
  UpdateTemplateDto,
} from '../dto/private/email-template.dto'
import { PrivateFormatter } from '../formatters/private.formatter'

@Controller('private')
@UseGuards(JwtAuthGuard)
export class Private3ApiController {
  constructor(
    private readonly emailLayoutService: EmailLayoutService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  @Get('/ListEmailLayouts')
  async listEmailLayouts(
    @RequiredQuery('projectId') projectId: string,
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
    @Query('key') key?: string,
  ): Promise<Paths.ListEmailLayouts.Responses.$200> {
    const result = await this.emailLayoutService.listLayouts({
      projectId,
      key,
      requester,
      pagination,
    })

    return {
      items: result.items.map(PrivateFormatter.formatEmailLayout),
      pagination: result.pagination,
    }
  }

  @Get('/GetEmailLayout')
  async getEmailLayout(
    @RequiredQuery('id') id: string,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetEmailLayout.Responses.$200> {
    const layout = await this.emailLayoutService.getLayout({
      id,
      requester,
    })

    return PrivateFormatter.formatEmailLayoutWithVariables(layout)
  }

  @Post('/CreateEmailLayout')
  async createEmailLayout(
    @Body()
    { projectId, key, description, content, variables }: CreateLayoutDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.CreateEmailLayout.Responses.$201> {
    const layout = await this.emailLayoutService.createLayout({
      projectId,
      key,
      description,
      content,
      variables,
      requester,
    })

    return PrivateFormatter.formatEmailLayout(layout)
  }

  @Post('/UpdateEmailLayout')
  async updateEmailLayout(
    @Body() { id, key, description, content, variables }: UpdateLayoutDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.UpdateEmailLayout.Responses.$200> {
    const layout = await this.emailLayoutService.updateLayout({
      id,
      key,
      description,
      content,
      variables,
      requester,
    })

    return PrivateFormatter.formatEmailLayout(layout)
  }

  @Delete('/DeleteEmailLayout')
  async deleteEmailLayout(
    @Body() { id }: DeleteLayoutDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.DeleteGlossary.Responses.$204> {
    await this.emailLayoutService.deleteLayout({
      id,
      requester,
    })

    return {}
  }

  @Get('/ListEmailTemplates')
  async listEmailTemplates(
    @RequiredQuery('projectId') projectId: string,
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
    @Query('key') key?: string,
  ): Promise<Paths.ListEmailTemplates.Responses.$200> {
    const result = await this.emailTemplateService.listTemplates({
      projectId,
      key,
      requester,
      pagination,
    })

    return {
      items: result.items.map(PrivateFormatter.formatEmailTemplate),
      pagination: result.pagination,
    }
  }

  @Get('/GetEmailTemplate')
  async getEmailTemplate(
    @RequiredQuery('id') id: string,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetEmailTemplate.Responses.$200> {
    const layout = await this.emailTemplateService.getTemplate({
      id,
      requester,
    })

    return PrivateFormatter.formatEmailTemplateWithVariables(layout)
  }

  @Post('/CreateEmailTemplate')
  async createEmailTemplate(
    @Body()
    {
      projectId,
      key,
      layoutId,
      description,
      content,
      variables,
    }: CreateTemplateDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.CreateEmailTemplate.Responses.$201> {
    const layout = await this.emailTemplateService.createTemplate({
      projectId,
      key,
      layoutId,
      description,
      content,
      variables,
      requester,
    })

    return PrivateFormatter.formatEmailTemplate(layout)
  }

  @Post('/UpdateEmailTemplate')
  async updateEmailTemplate(
    @Body()
    { id, key, layoutId, description, content, variables }: UpdateTemplateDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.UpdateEmailTemplate.Responses.$200> {
    const layout = await this.emailTemplateService.updateTemplate({
      id,
      key,
      layoutId,
      description,
      content,
      variables,
      requester,
    })

    return PrivateFormatter.formatEmailTemplate(layout)
  }

  @Delete('/DeleteEmailTemplate')
  async deleteEmailTemplate(
    @Body() { id }: DeleteTemplateDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.DeleteEmailTemplate.Responses.$204> {
    await this.emailTemplateService.deleteTemplate({
      id,
      requester,
    })

    return {}
  }
}
