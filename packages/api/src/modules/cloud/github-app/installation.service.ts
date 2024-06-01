import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Requester } from 'src/modules/auth/requester.object'
import { Config } from 'src/utils/config'
import { PrismaService } from 'src/utils/prisma.service'

interface CreateInstallationParams {
  requester: Requester
  installationId: number
  workspaceId: string
}

interface ListInstallationsParams {
  requester: Requester
  workspaceId: string
}

@Injectable()
export class GitHubAppInstallationService {
  constructor(
    private readonly configService: ConfigService<Config, true>,
    private readonly prismaService: PrismaService,
  ) {}

  async getGithubInstallation(installationId: number) {
    const config = this.configService.get('githubApp', { infer: true })
    if (!config.available) {
      throw new BadRequestException('GitHub App is not available')
    }

    // Native ESM modules need to be imported dynamically
    const createAppAuth = (await import('@octokit/auth-app')).createAppAuth
    const GithubApp = (await import('octokit')).Octokit

    const githubApp = new GithubApp({
      authStrategy: createAppAuth,
      auth: {
        appId: config.appId,
        privateKey: config.privateKey,
      },
    })

    const response = await githubApp.rest.apps
      .getInstallation({
        installation_id: installationId,
      })
      .catch(() => null)

    if (!response) {
      return null
    }

    return response.data
  }

  async createInstallation({
    requester,
    installationId,
    workspaceId,
  }: CreateInstallationParams) {
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('integrations:manage')

    const githubInstallation = await this.getGithubInstallation(installationId)
    if (!githubInstallation?.account) {
      throw new BadRequestException('Invalid installation id')
    }

    const existingInstallation =
      await this.prismaService.githubInstallation.findUnique({
        where: {
          githubId: installationId,
        },
      })
    if (existingInstallation) {
      if (existingInstallation.workspaceId !== workspaceId) {
        throw new BadRequestException(
          'Installation already used in another workspace',
        )
      }

      return {}
    }

    await this.prismaService.githubInstallation.create({
      data: {
        githubId: installationId,
        githubAccount:
          'login' in githubInstallation.account
            ? // Simple user
              githubInstallation.account.login
            : // Enterprise
              githubInstallation.account.slug,
        workspaceId,
        createdBy: workspaceAccess.getAccountID(),
      },
    })
  }

  async onWebhookInstallationDeleted(githubId: number) {
    const impactedDestinations = await this.prismaService.destination.findMany({
      select: {
        id: true,
      },
      where: {
        configGithub: {
          installation: {
            githubId,
          },
        },
      },
    })

    await this.prismaService.$transaction(async t => {
      await t.destinationConfigGithub.deleteMany({
        where: {
          destinationId: {
            in: impactedDestinations.map(d => d.id),
          },
        },
      })

      await t.destination.deleteMany({
        where: {
          id: {
            in: impactedDestinations.map(d => d.id),
          },
        },
      })

      await t.githubInstallation.delete({
        where: {
          githubId,
        },
      })
    })
  }

  async listInstallations({ requester, workspaceId }: ListInstallationsParams) {
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('projects:destinations:manage')

    const installations = await this.prismaService.githubInstallation.findMany({
      where: {
        workspaceId,
      },
    })

    return installations
  }
}
