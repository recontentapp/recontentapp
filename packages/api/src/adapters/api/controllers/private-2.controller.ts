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
import { GlossaryService } from 'src/modules/ux-writing/glossary.service'
import { PromptService } from 'src/modules/ux-writing/prompt.service'
import { Pagination, PaginationParams } from 'src/utils/pagination'
import { RequiredQuery } from 'src/utils/required-query'
import {
  CreateGlossaryDto,
  CreateGlossaryTermDto,
  DeleteGlossaryDto,
  DeleteGlossaryTermDto,
  LinkGlossaryWithProjectDto,
  UnlinkGlossaryFromProjectDto,
  UpdateGlossaryDto,
  UpdateGlossaryTermDto,
} from '../dto/private/glossary.dto'
import {
  CreatePromptDto,
  DeletePromptDto,
  LinkPromptWithProjectDto,
  UnlinkPromptFromProjectDto,
  UpdatePromptDto,
} from '../dto/private/prompt.dto'
import { PrivateFormatter } from '../formatters/private.formatter'

@Controller('private')
@UseGuards(JwtAuthGuard)
export class Private2ApiController {
  constructor(
    private readonly glossaryService: GlossaryService,
    private readonly promptService: PromptService,
  ) {}

  @Get('/ListGlossaries')
  async listGlossaries(
    @RequiredQuery('workspaceId') workspaceId: string,
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
  ): Promise<Paths.ListGlossaries.Responses.$200> {
    const result = await this.glossaryService.listGlossaries({
      workspaceId,
      requester,
      pagination,
    })

    return {
      items: result.items.map(PrivateFormatter.formatGlossary),
      pagination: result.pagination,
    }
  }

  @Get('/GetGlossary')
  async getGlossary(
    @RequiredQuery('id') id: string,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetGlossary.Responses.$200> {
    const glossary = await this.glossaryService.getGlossary({
      id,
      requester,
    })

    return PrivateFormatter.formatGlossary(glossary)
  }

  @Post('/CreateGlossary')
  async createGlossary(
    @Body() { name, description, workspaceId }: CreateGlossaryDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.CreateGlossary.Responses.$201> {
    const glossary = await this.glossaryService.createGlossary({
      name,
      description,
      workspaceId,
      requester,
    })

    return PrivateFormatter.formatGlossary(glossary)
  }

  @Post('/UpdateGlossary')
  async updateGlossary(
    @Body() { name, description, id }: UpdateGlossaryDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.UpdateGlossary.Responses.$200> {
    const glossary = await this.glossaryService.updateGlossary({
      name,
      description,
      id,
      requester,
    })

    return PrivateFormatter.formatGlossary(glossary)
  }

  @Post('/LinkGlossaryWithProject')
  async linkGlossaryWithProject(
    @Body() { glossaryId, projectId }: LinkGlossaryWithProjectDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.LinkGlossaryWithProject.Responses.$204> {
    await this.glossaryService.linkGlossaryWithProject({
      glossaryId,
      projectId,
      requester,
    })

    return {}
  }

  @Post('/UnlinkGlossaryFromProject')
  async unlinkGlossaryFromProject(
    @Body() { glossaryId, projectId }: UnlinkGlossaryFromProjectDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.UnlinkGlossaryFromProject.Responses.$204> {
    await this.glossaryService.unlinkGlossaryFromProject({
      glossaryId,
      projectId,
      requester,
    })

    return {}
  }

  @Delete('/DeleteGlossary')
  async deleteGlossary(
    @Body() { glossaryId }: DeleteGlossaryDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.DeleteGlossary.Responses.$204> {
    await this.glossaryService.deleteGlossary({
      id: glossaryId,
      requester,
    })

    return {}
  }

  @Get('/ListGlossaryTerms')
  async listGlossaryTerms(
    @RequiredQuery('glossaryId') glossaryId: string,
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
  ): Promise<Paths.ListGlossaryTerms.Responses.$200> {
    const result = await this.glossaryService.listGlossaryTerms({
      glossaryId,
      requester,
      pagination,
    })

    return {
      items: result.items.map(PrivateFormatter.formatGlossaryTerm),
      pagination: result.pagination,
    }
  }

  @Post('/CreateGlossaryTerm')
  async batchCreateGlossaryTerms(
    @Body()
    {
      glossaryId,
      name,
      description,
      forbidden,
      nonTranslatable,
      caseSensitive,
      translations,
    }: CreateGlossaryTermDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.CreateGlossaryTerm.Responses.$201> {
    await this.glossaryService.createGlossaryTerm({
      glossaryId,
      requester,
      name,
      description,
      forbidden,
      nonTranslatable,
      caseSensitive,
      translations,
    })

    return {}
  }

  @Post('/UpdateGlossaryTerm')
  async batchUpdateGlossaryTerms(
    @Body()
    {
      id,
      name,
      description,
      forbidden,
      nonTranslatable,
      caseSensitive,
      translations,
    }: UpdateGlossaryTermDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.UpdateGlossaryTerm.Responses.$204> {
    await this.glossaryService.updateGlossaryTerm({
      id,
      name,
      description,
      forbidden,
      nonTranslatable,
      caseSensitive,
      translations,
      requester,
    })

    return {}
  }

  @Post('/DeleteGlossaryTerm')
  async batchDeleteGlossaryTerms(
    @Body() { id }: DeleteGlossaryTermDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.BatchDeleteGlossaryTerms.Responses.$204> {
    await this.glossaryService.deleteGlossaryTerm({
      id,
      requester,
    })

    return {}
  }

  @Get('/ListPrompts')
  async listPrompts(
    @RequiredQuery('workspaceId') workspaceId: string,
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
    @Query('projectId') projectId?: string,
  ): Promise<Paths.ListPrompts.Responses.$200> {
    const result = await this.promptService.listPrompts({
      workspaceId,
      projectId,
      requester,
      pagination,
    })

    return {
      items: result.items.map(PrivateFormatter.formatPrompt),
      pagination: result.pagination,
    }
  }

  @Post('/CreatePrompt')
  async createPrompt(
    @Body()
    {
      name,
      description,
      workspaceId,
      glossaryId,
      tone,
      length,
      customInstructions,
    }: CreatePromptDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.CreatePrompt.Responses.$201> {
    const prompt = await this.promptService.createPrompt({
      name,
      description,
      workspaceId,
      glossaryId,
      tone,
      length,
      customInstructions,
      requester,
    })

    return PrivateFormatter.formatPrompt(prompt)
  }

  @Post('/UpdatePrompt')
  async updatePrompt(
    @Body()
    {
      name,
      description,
      id,
      glossaryId,
      tone,
      length,
      customInstructions,
    }: UpdatePromptDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.UpdateGlossary.Responses.$200> {
    const prompt = await this.promptService.updatePrompt({
      name,
      description,
      id,
      glossaryId,
      tone,
      length,
      customInstructions,
      requester,
    })

    return PrivateFormatter.formatPrompt(prompt)
  }

  @Post('/LinkPromptWithProject')
  async linkPromptWithProject(
    @Body() { promptId, projectId }: LinkPromptWithProjectDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.LinkGlossaryWithProject.Responses.$204> {
    await this.promptService.linkPromptWithProject({
      promptId,
      projectId,
      requester,
    })

    return {}
  }

  @Post('/UnlinkPromptFromProject')
  async unlinkPromptFromProject(
    @Body() { promptId, projectId }: UnlinkPromptFromProjectDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.UnlinkGlossaryFromProject.Responses.$204> {
    await this.promptService.unlinkPromptFromProject({
      promptId,
      projectId,
      requester,
    })

    return {}
  }

  @Delete('/DeletePrompt')
  async deletePrompt(
    @Body() { promptId }: DeletePromptDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.DeleteGlossary.Responses.$204> {
    await this.promptService.deletePrompt({
      id: promptId,
      requester,
    })

    return {}
  }
}
