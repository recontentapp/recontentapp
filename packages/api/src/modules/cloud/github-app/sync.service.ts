import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'
import { PrismaService } from 'src/utils/prisma.service'
import { escapeLeadingSlash } from 'src/utils/strings'

export interface Addition {
  path: string
  content: Buffer
}

interface SyncParams {
  destinationId: string
  additions: Addition[]
}

interface GetLatestBranchCommitObjectIDParams {
  installationId: number
  repositoryOwner: string
  repositoryName: string
  branch: string
}

interface CreateBranchParams {
  installationId: number
  name: string
  repositoryId: string
  commitObjectId: string
}

interface CreateCommitParams {
  installationId: number
  repositoryOwner: string
  repositoryName: string
  branchName: string
  message: string
  additions: Addition[]
  expectedHeadCommitObjectId: string
}

interface CreatePullRequestParams {
  installationId: number
  repositoryId: string
  baseBranchName: string
  headBranchName: string
  title: string
  body: string
}

@Injectable()
export class GitHubAppSyncService {
  constructor(
    private readonly configService: ConfigService<Config, true>,
    private readonly prismaService: PrismaService,
  ) {}

  private async getOctokit(installationId: number) {
    const config = this.configService.get('githubApp', { infer: true })
    if (!config.available) {
      throw new BadRequestException('GitHub App is not available')
    }

    // Native ESM modules need to be imported dynamically
    const createAppAuth = (await import('@octokit/auth-app')).createAppAuth
    const GithubApp = (await import('octokit')).Octokit

    return new GithubApp({
      authStrategy: createAppAuth,
      auth: {
        appId: config.appId,
        privateKey: config.privateKey,
        installationId,
      },
    })
  }

  private static generateBranchName() {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `recontent/sync-${year}${month}${day}-${hours}${minutes}${seconds}`
  }

  private static getQualifiedRef(branch: string) {
    const prefix = 'refs/heads/'

    if (branch.startsWith(prefix)) {
      return branch
    }

    return [prefix, escapeLeadingSlash(branch)].join('')
  }

  private async getLatestBranchCommitObjectID({
    installationId,
    repositoryOwner,
    repositoryName,
    branch,
  }: GetLatestBranchCommitObjectIDParams) {
    const octokit = await this.getOctokit(installationId)

    interface Response {
      repository: {
        id: string
        ref: {
          target: {
            history: {
              nodes: {
                oid: string
              }[]
            }
          }
        }
      }
    }

    const response = await octokit.graphql<Response>(
      `query (
        $repositoryName: String!,
        $repositoryOwner: String!,
        $refQualifiedName: String!
      ) {
        repository(name: $repositoryName, owner: $repositoryOwner) {
          id
          ref(qualifiedName: $refQualifiedName) {
            target {
              ... on Commit {
                history(first: 1) {
                  nodes {
                    oid
                  }
                }
              }
            }
          }
        }
	    }
    `,
      {
        repositoryName,
        repositoryOwner,
        refQualifiedName: GitHubAppSyncService.getQualifiedRef(branch),
      },
    )

    return {
      repositoryId: response.repository.id,
      commitObjectId: response.repository.ref.target.history.nodes.at(0)?.oid,
    }
  }

  private async createBranch({
    installationId,
    name,
    repositoryId,
    commitObjectId,
  }: CreateBranchParams) {
    const octokit = await this.getOctokit(installationId)

    interface Response {
      createRef: {
        ref: {
          id: string
        }
      }
    }

    const response = await octokit.graphql<Response>(
      `mutation (
        $name: String!,
        $repositoryId: ID!,
        $commitObjectId: GitObjectID! 
      ) {
        createRef(
          input: {
            name: $name,
            oid: $commitObjectId,
            repositoryId: $repositoryId
          }
        ) {
          ref {
            id
          }
        }
      }
    `,
      {
        name: GitHubAppSyncService.getQualifiedRef(name),
        repositoryId,
        commitObjectId,
      },
    )

    return response.createRef.ref.id
  }

  private async createCommit({
    installationId,
    repositoryName,
    repositoryOwner,
    branchName,
    message,
    additions,
    expectedHeadCommitObjectId,
  }: CreateCommitParams) {
    const octokit = await this.getOctokit(installationId)

    interface CreateCommitOnBranchInput {
      branch: {
        repositoryNameWithOwner: string
        branchName: string
      }
      message: {
        headline: string
      }
      fileChanges: {
        additions: Array<{
          path: string
          contents: string
        }>
      }
      expectedHeadOid: string
    }

    const input: CreateCommitOnBranchInput = {
      branch: {
        repositoryNameWithOwner: [repositoryOwner, repositoryName].join('/'),
        branchName: GitHubAppSyncService.getQualifiedRef(branchName),
      },
      message: {
        headline: message,
      },
      fileChanges: {
        additions: additions.map(({ path, content }) => ({
          path,
          contents: content.toString('base64'),
        })),
      },
      expectedHeadOid: expectedHeadCommitObjectId,
    }

    await octokit.graphql(
      `
      mutation ($input: CreateCommitOnBranchInput!) {
        createCommitOnBranch(input: $input) {
          commit {
            url
          }
        }
      }
    `,
      { input },
    )
  }

  private async createPullRequest({
    installationId,
    repositoryId,
    baseBranchName,
    headBranchName,
    title,
    body,
  }: CreatePullRequestParams) {
    const octokit = await this.getOctokit(installationId)
    await octokit.graphql(
      `mutation (
        $repositoryId: ID!
        $baseRefName: String!
        $headRefName: String!
        $title: String!
        $body: String
      ) {
        createPullRequest(input: {
          repositoryId: $repositoryId,
          baseRefName: $baseRefName,
          headRefName: $headRefName,
          title: $title,
          body: $body
        }) {
          pullRequest {
            url
          }
        }
      }
      `,
      {
        repositoryId,
        baseRefName: GitHubAppSyncService.getQualifiedRef(baseBranchName),
        headRefName: GitHubAppSyncService.getQualifiedRef(headBranchName),
        title,
        body,
      },
    )
  }

  async sync({ destinationId, additions }: SyncParams) {
    const config = this.configService.get('githubApp', { infer: true })
    if (!config.available) {
      throw new BadRequestException('GitHub App is not available')
    }

    const destination = await this.prismaService.destination.findUniqueOrThrow({
      where: { id: destinationId },
      include: {
        workspace: true,
        revision: true,
        configGithub: { include: { installation: true } },
      },
    })

    if (!destination.configGithub || !destination.configGithub.installation) {
      throw new NotFoundException('GitHub destination not found')
    }

    if (!destination.configGithub.installation.active) {
      throw new BadRequestException('GitHub installation is not active')
    }

    const baseBranchDetails = await this.getLatestBranchCommitObjectID({
      installationId: destination.configGithub.installation.githubId,
      repositoryOwner: destination.configGithub.repositoryOwner,
      repositoryName: destination.configGithub.repositoryName,
      branch: destination.configGithub.baseBranchName,
    })

    if (!baseBranchDetails.commitObjectId) {
      throw new NotFoundException('Base branch not found')
    }

    const headBranchName = GitHubAppSyncService.generateBranchName()

    await this.createBranch({
      installationId: destination.configGithub.installation.githubId,
      name: headBranchName,
      repositoryId: baseBranchDetails.repositoryId,
      commitObjectId: baseBranchDetails.commitObjectId,
    })

    const headBranchDetails = await this.getLatestBranchCommitObjectID({
      installationId: destination.configGithub.installation.githubId,
      repositoryOwner: destination.configGithub.repositoryOwner,
      repositoryName: destination.configGithub.repositoryName,
      branch: headBranchName,
    })

    if (!headBranchDetails.commitObjectId) {
      throw new NotFoundException('Head branch not found')
    }

    await this.createCommit({
      installationId: destination.configGithub.installation.githubId,
      repositoryOwner: destination.configGithub.repositoryOwner,
      repositoryName: destination.configGithub.repositoryName,
      branchName: headBranchName,
      message: 'Sync Recontent.app content',
      additions,
      expectedHeadCommitObjectId: headBranchDetails.commitObjectId,
    })

    await this.createPullRequest({
      installationId: destination.configGithub.installation.githubId,
      repositoryId: baseBranchDetails.repositoryId,
      baseBranchName: destination.configGithub.baseBranchName,
      headBranchName,
      title: 'Sync Recontent.app content',
      body: `This PR syncs content between your repository & Recontent.app based on your [GitHub destination](https://app.recontent.app/${destination.workspace.key}/projects/${destination.revision.projectId}/destinations/${destination.id}) configuration.

If you wish to change the frequency of created pull requests or stop syncing your content, head to your [Recontent.app workspace](https://app.recontent.app/${destination.workspace.key}).`,
    })
  }
}
