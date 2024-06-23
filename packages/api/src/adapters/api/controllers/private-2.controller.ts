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
import { Pagination, PaginationParams } from 'src/utils/pagination'
import { RequiredQuery } from 'src/utils/required-query'
import {
  BatchCreateGlossaryTermsDto,
  BatchDeleteGlossaryTermsDto,
  BatchUpdateGlossaryTermsDto,
  CreateGlossaryDto,
  DeleteGlossaryDto,
  LinkGlossaryWithProjectDto,
  UnlinkGlossaryFromProjectDto,
  UpdateGlossaryDto,
} from '../dto/private/glossary.dto'
import { PrivateFormatter } from '../formatters/private.formatter'

@Controller('private')
@UseGuards(JwtAuthGuard)
export class Private2ApiController {
  constructor(private readonly glossaryService: GlossaryService) {}

  @Get('/ListGlossaries')
  async listWorkspaceInvitations(
    @RequiredQuery('workspaceId') workspaceId: string,
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
    @Query('projectId') projectId?: string,
  ): Promise<Paths.ListGlossaries.Responses.$200> {
    const result = await this.glossaryService.listGlossaries({
      workspaceId,
      projectId,
      requester,
      pagination,
    })

    return {
      items: result.items.map(PrivateFormatter.formatGlossary),
      pagination: result.pagination,
    }
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
    @Query('languageId') languageId?: string,
    @Query('groupId') groupId?: string,
  ): Promise<Paths.ListGlossaryTerms.Responses.$200> {
    const result = await this.glossaryService.listGlossaryTerms({
      glossaryId,
      languageId,
      groupId,
      requester,
      pagination,
    })

    return {
      items: result.items.map(PrivateFormatter.formatGlossaryTerm),
      pagination: result.pagination,
    }
  }

  @Post('/BatchCreateGlossaryTerms')
  async batchCreateGlossaryTerms(
    @Body() { glossaryId, terms }: BatchCreateGlossaryTermsDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.BatchCreateGlossaryTerms.Responses.$201> {
    await this.glossaryService.batchCreateGlossaryTerm({
      glossaryId,
      terms,
      requester,
    })

    return {}
  }

  @Post('/BatchUpdateGlossaryTerms')
  async batchUpdateGlossaryTerms(
    @Body() { glossaryId, terms }: BatchUpdateGlossaryTermsDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.BatchUpdateGlossaryTerms.Responses.$204> {
    await this.glossaryService.batchUpdateGlossaryTerm({
      glossaryId,
      terms,
      requester,
    })

    return {}
  }

  @Post('/BatchDeleteGlossaryTerms')
  async batchDeleteGlossaryTerms(
    @Body() { glossaryId, ids }: BatchDeleteGlossaryTermsDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.BatchDeleteGlossaryTerms.Responses.$204> {
    await this.glossaryService.batchDeleteGlossaryTerms({
      glossaryId,
      ids,
      requester,
    })

    return {}
  }
}
