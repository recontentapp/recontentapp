import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { HumanRequester } from 'src/utils/requester'
import { PaginationParams } from 'src/utils/pagination'
import { isValidHexColor } from 'src/utils/colors'

interface ListProjectTagsParams {
  projectId: string
  pagination: PaginationParams
  requester: HumanRequester
}

interface CreateTagParams {
  projectId: string
  key: string
  value: string
  color: string
  description?: string
  requester: HumanRequester
}

interface UpdateTagParams {
  id: string
  key: string
  value: string
  color: string
  description?: string
  requester: HumanRequester
}

interface DeleteTagParams {
  id: string
  requester: HumanRequester
}

interface ApplyTagParams {
  tagId: string
  recordIds: string[]
  recordType: 'phrase'
  requester: HumanRequester
}

@Injectable()
export class TagService {
  constructor(private prismaService: PrismaService) {}

  async listProjectTags({
    projectId,
    pagination,
    requester,
  }: ListProjectTagsParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: { id: projectId },
    })

    if (!requester.canAccessWorkspace(project.workspaceId)) {
      throw new ForbiddenException('You do not have access to this project')
    }

    const { limit, offset, pageSize, page } = pagination
    const [tags, count] = await Promise.all([
      this.prismaService.tag.findMany({
        where: {
          projectId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.phrase.count({
        where: {
          projectId,
        },
      }),
    ])

    return {
      items: tags,
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  async createTag({
    projectId,
    key,
    value,
    color,
    description,
    requester,
  }: CreateTagParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: { id: projectId },
    })

    if (!requester.canAccessWorkspace(project.workspaceId)) {
      throw new ForbiddenException('You do not have access to this project')
    }

    if (key.length > 255) {
      throw new BadRequestException('Key is too long')
    }

    if (value.length > 255) {
      throw new BadRequestException('Key is too long')
    }

    if (!isValidHexColor(color)) {
      throw new BadRequestException('Color is not valid')
    }

    const tag = await this.prismaService.tag.create({
      data: {
        projectId,
        key,
        value,
        color,
        description,
        workspaceId: project.workspaceId,
        createdBy: requester.getAccountIDForWorkspace(project.workspaceId)!,
      },
    })

    return tag
  }

  async updateTag({
    id,
    key,
    value,
    color,
    description,
    requester,
  }: UpdateTagParams) {
    const tag = await this.prismaService.tag.findUniqueOrThrow({
      where: { id },
    })

    if (!requester.canAccessWorkspace(tag.workspaceId)) {
      throw new ForbiddenException('You do not have access to this tag')
    }

    if (key.length > 255) {
      throw new BadRequestException('Key is too long')
    }

    if (value.length > 255) {
      throw new BadRequestException('Key is too long')
    }

    if (!isValidHexColor(color)) {
      throw new BadRequestException('Color is not valid')
    }

    const updatedTag = await this.prismaService.tag.update({
      where: { id },
      data: {
        key,
        value,
        color,
        description,
        updatedBy: requester.getAccountIDForWorkspace(tag.workspaceId)!,
      },
    })

    return updatedTag
  }

  async deleteTag({ id, requester }: DeleteTagParams) {
    const tag = await this.prismaService.tag.findUniqueOrThrow({
      where: { id },
    })

    if (!requester.canAccessWorkspace(tag.workspaceId)) {
      throw new ForbiddenException('You do not have access to this tag')
    }

    await this.prismaService.$transaction(async t => {
      await t.taggable.deleteMany({
        where: {
          tagId: id,
        },
      })

      await t.tag.delete({
        where: { id },
      })
    })
  }

  async applyTag({ tagId, recordIds, requester }: ApplyTagParams) {
    const tag = await this.prismaService.tag.findUniqueOrThrow({
      where: { id: tagId },
    })

    if (!requester.canAccessWorkspace(tag.workspaceId)) {
      throw new ForbiddenException('You do not have access to this tag')
    }

    const phrasesCountWithinWorkspace = await this.prismaService.phrase.count({
      where: {
        id: {
          in: recordIds,
        },
        projectId: tag.projectId,
      },
    })

    if (phrasesCountWithinWorkspace !== recordIds.length) {
      throw new BadRequestException(
        'Some phrases do not belong to this project',
      )
    }

    await this.prismaService.$transaction(async t => {
      await t.taggable.deleteMany({
        where: {
          tagId,
          recordId: { in: recordIds },
        },
      })

      await t.taggable.createMany({
        data: recordIds.map(recordId => ({
          tagId,
          recordId,
          recordType: 'phrase',
          workspaceId: tag.workspaceId,
          createdBy: requester.getAccountIDForWorkspace(tag.workspaceId)!,
        })),
      })
    })
  }
}
