import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { HumanRequester } from 'src/modules/auth/requester'
import { PaginationParams } from 'src/utils/pagination'
import { isValidHexColor } from 'src/utils/colors'

interface ListProjectTagsParams {
  projectId: string
  pagination: PaginationParams
  requester: HumanRequester
}

interface GetReferenceableTagsParams {
  projectId: string
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

interface BatchApplyTagParams {
  tagIds: string[]
  recordIds: string[]
  recordType: 'phrase'
  requester: HumanRequester
}

interface ApplyTagsToPhraseParams {
  phraseId: string
  tagIds: string[]
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
      this.prismaService.tag.count({
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

  async getReferenceableTags({
    projectId,
    requester,
  }: GetReferenceableTagsParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: { id: projectId },
    })

    if (!requester.canAccessWorkspace(project.workspaceId)) {
      throw new ForbiddenException('You do not have access to this project')
    }

    const tags = await this.prismaService.tag.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        key: true,
        value: true,
        color: true,
      },
    })

    return tags.reduce<Record<string, { label: string; color: string }>>(
      (acc, tag) => {
        acc[tag.id] = {
          label: `${tag.key}:${tag.value}`,
          color: tag.color,
        }
        return acc
      },
      {},
    )
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

    const tagsCount = await this.prismaService.tag.count({
      where: {
        projectId,
      },
    })

    if (tagsCount >= 500) {
      throw new BadRequestException('You have reached the limit of tags')
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

  async applyTagsToPhrase({
    tagIds,
    phraseId,
    requester,
  }: ApplyTagsToPhraseParams) {
    const phrase = await this.prismaService.phrase.findUniqueOrThrow({
      where: { id: phraseId },
    })

    if (!requester.canAccessWorkspace(phrase.workspaceId)) {
      throw new ForbiddenException('You do not have access to this phrase')
    }

    const tagsCount = await this.prismaService.tag.count({
      where: {
        id: { in: tagIds },
        workspaceId: phrase.workspaceId,
      },
    })

    if (tagsCount !== tagIds.length) {
      throw new BadRequestException('Some tags do not belong to this workspace')
    }

    await this.prismaService.$transaction(async t => {
      await t.taggable.deleteMany({
        where: {
          recordId: phraseId,
        },
      })

      await t.taggable.createMany({
        data: tagIds.map(tagId => ({
          tagId,
          recordId: phraseId,
          recordType: 'phrase',
          workspaceId: phrase.workspaceId,
          createdBy: requester.getAccountIDForWorkspace(phrase.workspaceId)!,
        })),
      })
    })
  }

  async batchApplyTag({ tagIds, recordIds, requester }: BatchApplyTagParams) {
    if (tagIds.length === 0) {
      const phrases = await this.prismaService.phrase.findMany({
        where: { id: { in: recordIds } },
      })
      const allPhrasesBelongToSameWorkspace = phrases.every(
        phrase => phrase.workspaceId === phrases[0].workspaceId,
      )

      if (!allPhrasesBelongToSameWorkspace) {
        throw new BadRequestException(
          'Phrases do not belong to the same workspace',
        )
      }

      if (!requester.canAccessWorkspace(phrases[0].workspaceId)) {
        throw new ForbiddenException('You do not have access to these phrases')
      }

      await this.prismaService.$transaction(async t => {
        await t.taggable.deleteMany({
          where: {
            recordId: { in: recordIds },
          },
        })
      })
      return
    }

    const tags = await this.prismaService.tag.findMany({
      where: { id: { in: tagIds } },
    })
    const allTagsBelongToSameWorkspace = tags.every(
      tag => tag.workspaceId === tags[0].workspaceId,
    )
    if (!allTagsBelongToSameWorkspace) {
      throw new BadRequestException('Tags do not belong to the same workspace')
    }
    if (!requester.canAccessWorkspace(tags[0].workspaceId)) {
      throw new ForbiddenException('You do not have access to this tag')
    }

    const phrasesCountWithinProject = await this.prismaService.phrase.count({
      where: {
        id: {
          in: recordIds,
        },
        projectId: tags[0].projectId,
      },
    })

    if (phrasesCountWithinProject !== recordIds.length) {
      throw new BadRequestException(
        'Some phrases do not belong to this project',
      )
    }

    await this.prismaService.$transaction(async t => {
      await t.taggable.deleteMany({
        where: {
          recordId: { in: recordIds },
        },
      })

      await t.taggable.createMany({
        data: recordIds
          .map(recordId => {
            return tagIds.map(tagId => ({
              tagId,
              recordId,
              recordType: 'phrase' as const,
              workspaceId: tags[0].workspaceId,
              createdBy: requester.getAccountIDForWorkspace(
                tags[0].workspaceId,
              )!,
            }))
          })
          .flat(),
      })
    })
  }
}
