import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Components } from 'src/generated/typeDefinitions'
import { PaginationParams } from 'src/utils/pagination'
import { PrismaService } from 'src/utils/prisma.service'
import { Requester } from '../auth/requester.object'

interface ListPromptsParams {
  workspaceId: string
  projectId?: string
  pagination: PaginationParams
  requester: Requester
}

interface CreatePromptParams {
  workspaceId: string
  name: string
  glossaryId?: string
  description?: string
  tone?: Components.Schemas.PromptTone
  length?: Components.Schemas.PromptLength
  customInstructions: string[]
  requester: Requester
}

interface UpdatePromptParams {
  id: string
  name: string
  glossaryId?: string
  description?: string
  tone?: Components.Schemas.PromptTone
  length?: Components.Schemas.PromptLength
  customInstructions: string[]
  requester: Requester
}

interface DeletePromptParams {
  id: string
  requester: Requester
}

interface LinkPromptWithProjectParams {
  promptId: string
  projectId: string
  requester: Requester
}

interface UnlinkPromptFromProjectParams {
  promptId: string
  projectId: string
  requester: Requester
}

@Injectable()
export class PromptService {
  constructor(private prismaService: PrismaService) {}

  async listPrompts({
    workspaceId,
    projectId,
    pagination,
    requester,
  }: ListPromptsParams) {
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    if (projectId) {
      const project = await this.prismaService.project.findUniqueOrThrow({
        where: { id: projectId },
      })
      if (project.workspaceId !== workspaceId) {
        throw new BadRequestException(
          'Project does not belong to the specified workspace',
        )
      }
    }

    const where: Prisma.PromptWhereInput = {
      workspaceId,
      ...(projectId ? { projects: { some: { id: projectId } } } : {}),
    }

    const { limit, offset, pageSize, page } = pagination
    const [prompts, count] = await Promise.all([
      this.prismaService.prompt.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.prompt.count({
        where,
      }),
    ])

    return {
      items: prompts,
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  async createPrompt({
    name,
    description,
    glossaryId,
    tone,
    length,
    customInstructions,
    workspaceId,
    requester,
  }: CreatePromptParams) {
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('prompts:manage')

    if (glossaryId) {
      const glossary = await this.prismaService.glossary.findUniqueOrThrow({
        where: { id: glossaryId },
      })

      if (glossary.workspaceId !== workspaceId) {
        throw new BadRequestException(
          'Glossary does not belong to the specified workspace',
        )
      }
    }

    const prompt = await this.prismaService.prompt.create({
      data: {
        name,
        description,
        glossaryId,
        tone,
        length,
        customInstructions,
        workspaceId,
        createdBy: workspaceAccess.getAccountID(),
      },
    })

    return prompt
  }

  async updatePrompt({
    id,
    name,
    glossaryId,
    description,
    tone,
    length,
    customInstructions,
    requester,
  }: UpdatePromptParams) {
    const prompt = await this.prismaService.prompt.findUniqueOrThrow({
      where: { id },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      prompt.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('prompts:manage')

    if (glossaryId) {
      const glossary = await this.prismaService.glossary.findUniqueOrThrow({
        where: { id: glossaryId },
      })

      if (glossary.workspaceId !== prompt.workspaceId) {
        throw new BadRequestException(
          'Glossary does not belong to the specified workspace',
        )
      }
    }

    const updatedPrompt = await this.prismaService.prompt.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        glossaryId,
        tone,
        length,
        customInstructions,
        updatedBy: workspaceAccess.getAccountID(),
      },
    })

    return updatedPrompt
  }

  async deletePrompt({ id, requester }: DeletePromptParams) {
    const prompt = await this.prismaService.prompt.findUniqueOrThrow({
      where: { id },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      prompt.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('prompts:manage')

    await this.prismaService.prompt.delete({
      where: { id },
    })
  }

  async linkPromptWithProject({
    promptId,
    projectId,
    requester,
  }: LinkPromptWithProjectParams) {
    const prompt = await this.prismaService.prompt.findUniqueOrThrow({
      where: { id: promptId },
    })
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: { id: projectId },
    })

    if (prompt.workspaceId !== project.workspaceId) {
      throw new BadRequestException(
        'Glossary and project do not belong to the same workspace',
      )
    }

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      prompt.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('prompts:manage')

    await this.prismaService.prompt.update({
      where: { id: promptId },
      data: {
        projects: {
          connect: {
            id: projectId,
          },
        },
      },
    })
  }

  async unlinkPromptFromProject({
    promptId,
    projectId,
    requester,
  }: UnlinkPromptFromProjectParams) {
    const prompt = await this.prismaService.prompt.findUniqueOrThrow({
      where: { id: promptId },
    })
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: { id: projectId },
    })

    if (prompt.workspaceId !== project.workspaceId) {
      throw new BadRequestException(
        'Glossary and project do not belong to the same workspace',
      )
    }

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      prompt.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('prompts:manage')

    await this.prismaService.prompt.update({
      where: { id: promptId },
      data: {
        projects: {
          disconnect: {
            id: projectId,
          },
        },
      },
    })
  }
}
