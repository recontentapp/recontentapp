import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { Paths } from 'src/generated/public/typeDefinitions'
import { APIKeyGuard } from 'src/modules/auth/api-key.guard'
import { AuthenticatedRequester } from 'src/modules/auth/requester.decorator'
import { Requester } from 'src/modules/auth/requester.object'
import { PhraseService } from 'src/modules/phrase/phrase.service'
import { possibleLocales } from 'src/modules/workspace/locale'
import { Pagination, PaginationParams } from 'src/utils/pagination'
import { PrismaService } from 'src/utils/prisma.service'
import { RequiredQuery } from 'src/utils/required-query'
import { CreatePhraseExportDto } from '../dto/public/phrase.dto'
import { PublicFormatter } from '../formatters/public.formatter'

@Controller('public')
@Throttle({ default: { limit: 10, ttl: 1000 } })
@UseGuards(APIKeyGuard)
export class PublicApiController {
  constructor(
    private readonly phraseService: PhraseService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get('/workspaces/me')
  async getWorkspacesMe(
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetWorkspace.Responses.$200> {
    const workspaceId = requester.getDefaultWorkspaceID()
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const workspace = await this.prismaService.workspace.findUniqueOrThrow({
      where: {
        id: workspaceId,
      },
    })

    return PublicFormatter.formatWorkspace(workspace)
  }

  @Get('/languages')
  async getLanguages(
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
    @Query('projectId') projectId?: string,
  ): Promise<Paths.ListLanguages.Responses.$200> {
    const workspaceId = requester.getDefaultWorkspaceID()
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const { page, pageSize, limit, offset } = pagination
    const [languages, count] = await Promise.all([
      this.prismaService.language.findMany({
        where: {
          workspaceId,
          projects: projectId ? { some: { id: projectId } } : undefined,
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.language.count({
        where: {
          workspaceId,
          projects: projectId ? { some: { id: projectId } } : undefined,
        },
      }),
    ])

    return {
      items: languages.map(PublicFormatter.formatLanguage),
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  @Get('/projects')
  async getProjects(
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
  ): Promise<Paths.ListProjects.Responses.$200> {
    const workspaceId = requester.getDefaultWorkspaceID()
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const { page, pageSize, limit, offset } = pagination
    const [projects, count] = await Promise.all([
      this.prismaService.project.findMany({
        where: {
          workspaceId,
        },
        include: {
          revisions: {
            where: { isMaster: true },
          },
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.project.count({
        where: {
          workspaceId,
        },
      }),
    ])

    return {
      items: projects.map(PublicFormatter.formatProject),
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  @Get('/projects/:id')
  async getProject(
    @AuthenticatedRequester() requester: Requester,
    @Param('id') id: string,
  ): Promise<Paths.GetProject.Responses.$200> {
    const workspaceId = requester.getDefaultWorkspaceID()
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const project = await this.prismaService.project.findUniqueOrThrow({
      where: {
        id,
        workspaceId,
      },
      include: {
        revisions: {
          where: { isMaster: true },
        },
      },
    })

    return PublicFormatter.formatProject(project)
  }

  @Get('/phrases')
  async getPhrases(
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
    @RequiredQuery('revisionId') revisionId: string,
  ): Promise<Paths.ListPhrases.Responses.$200> {
    const result = await this.phraseService.listPhrases({
      revisionId,
      requester,
      pagination,
    })

    return {
      items: result.items.map(PublicFormatter.formatPhraseItem),
      pagination: result.pagination,
    }
  }

  @Get('/phrases/:id')
  async getPhrase(
    @AuthenticatedRequester() requester: Requester,
    @Param('id') id: string,
  ): Promise<Paths.GetPhrase.Responses.$200> {
    const phrase = await this.phraseService.getPhrase({
      phraseId: id,
      requester,
    })

    return PublicFormatter.formatPhrase(phrase)
  }

  @Get('/possible-locales')
  async getPossibleLocales(): Promise<Paths.ListPossibleLocales.Responses.$200> {
    return {
      items: possibleLocales.map(key => ({
        key,
        label: key,
      })),
    }
  }

  @Post('/phrase-exports')
  async createPhraseExport(
    @AuthenticatedRequester() requester: Requester,
    @Body() { revisionId, languageId, containsTagIds }: CreatePhraseExportDto,
  ): Promise<Paths.ExportPhrases.Responses.$200> {
    const workspaceId = requester.getDefaultWorkspaceID()
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const phrases = await this.prismaService.phrase.findMany({
      where: {
        revisionId,
        workspaceId,
        ...(containsTagIds &&
          containsTagIds.length > 0 && {
            taggables: {
              some: {
                tagId: {
                  in: containsTagIds,
                },
              },
            },
          }),
      },
      select: {
        key: true,
        translations: {
          where: { languageId },
          select: {
            content: true,
          },
        },
      },
    })

    return {
      data: phrases.reduce(
        (acc, phrase) => {
          acc[phrase.key] = phrase.translations.at(0)?.content ?? ''
          return acc
        },
        {} as Record<string, string>,
      ),
    }
  }
}
