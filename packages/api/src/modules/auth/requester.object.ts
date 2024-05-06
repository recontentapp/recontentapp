import { BadRequestException, ForbiddenException } from '@nestjs/common'
import {
  WorkspaceAccount as PrismaWorkspaceAccount,
  Workspace as PrismaWorkspace,
  WorkspaceBillingSettings as PrismaWorkspaceBillingSettings,
} from '@prisma/client'
import { Components } from 'src/generated/typeDefinitions'
import { HumanRequestUser, ServiceRequestUser } from './types'
import getConfig, { Config } from 'src/utils/config'

export interface Requester {
  getDefaultWorkspaceID: () => string
  getLoggingAttributes: () => Record<string, string>
  getWorkspaceAccessOrThrow: (workspaceId: string) => WorkspaceAccess
  getUserID: () => string
  getUserEmail: () => string
}

interface Limits {
  projectsCount: number
  phrasesCount: number
}

export class WorkspaceAccess {
  private limits: Limits
  private abilities: Components.Schemas.WorkspaceAbility[] = []

  private resolveAbilities() {
    const abilities: Components.Schemas.WorkspaceAbility[] = ['workspace:read']

    if (this.workspaceAccount.userId !== null) {
      abilities.push('workspace:write')
    }

    if (
      this.systemConfig.app.distribution === 'cloud' &&
      ['owner', 'biller'].includes(this.workspaceAccount.role)
    ) {
      abilities.push('billing:manage')
    }

    if (this.workspaceAccount.role === 'owner') {
      abilities.push(
        'members:manage',
        'languages:manage',
        'api_keys:manage',
        'projects:destinations:manage',
      )
    }

    if (this.systemConfig.autoTranslate.provider !== null) {
      if (this.systemConfig.app.distribution === 'self-hosted') {
        abilities.push('auto_translation:use')
      }

      if (
        this.systemConfig.app.distribution === 'cloud' &&
        this.workspaceBillingSettings.plan === 'pro'
      ) {
        abilities.push('auto_translation:use')
      }
    }

    return abilities
  }

  private resolveLimits() {
    if (this.systemConfig.app.distribution === 'self-hosted') {
      return {
        projectsCount: Infinity,
        phrasesCount: Infinity,
      }
    }

    if (this.workspaceBillingSettings.plan === 'free') {
      return {
        projectsCount: 1,
        phrasesCount: 1000,
      }
    }

    return {
      projectsCount: Infinity,
      phrasesCount: Infinity,
    }
  }

  constructor(
    private systemConfig: Pick<Config, 'autoTranslate' | 'app'>,
    private workspaceAccount: PrismaWorkspaceAccount,
    private workspace: PrismaWorkspace,
    private workspaceBillingSettings: PrismaWorkspaceBillingSettings,
  ) {
    this.abilities = this.resolveAbilities()
    this.limits = this.resolveLimits()
  }

  getLimits() {
    return this.limits
  }

  getAbilities() {
    return this.abilities
  }

  getAccountID() {
    return this.workspaceAccount.id
  }

  getWorkspaceID() {
    return this.workspace.id
  }

  getWorkspaceDetails() {
    const { id, name, key } = this.workspace

    return {
      id,
      key,
      name,
    }
  }

  hasAbility(ability: Components.Schemas.WorkspaceAbility) {
    return this.abilities.includes(ability)
  }

  hasAbilityOrThrow(ability: Components.Schemas.WorkspaceAbility) {
    if (!this.abilities.includes(ability)) {
      throw new ForbiddenException(
        `User do not have required ability: "${ability}"`,
      )
    }
  }
}

export class HumanRequester implements Requester {
  constructor(private requestUser: HumanRequestUser) {}

  getLoggingAttributes() {
    return {
      requesterType: 'human',
      userId: this.requestUser.user.id,
    }
  }

  getUserID() {
    return this.requestUser.user.id
  }

  getUserEmail() {
    return this.requestUser.user.email
  }

  getDefaultWorkspaceID() {
    const account = this.requestUser.user.accounts.at(0)

    if (!account) {
      throw new ForbiddenException('User do not have access to workspace')
    }

    return account.workspaceId
  }

  getWorkspaceAccessOrThrow(workspaceId: string) {
    const account = this.requestUser.user.accounts.find(
      account => account.workspaceId === workspaceId,
    )

    if (!account) {
      throw new ForbiddenException('User do not have access to workspace')
    }

    if (!account.workspace.billingSettings) {
      throw new BadRequestException('Workspace do not have billing settings')
    }

    return new WorkspaceAccess(
      getConfig(),
      account,
      account.workspace,
      account.workspace.billingSettings,
    )
  }
}

export class ServiceRequester implements Requester {
  constructor(private requestUser: ServiceRequestUser) {}

  getLoggingAttributes() {
    return {
      requesterType: 'service',
      serviceAccountId: this.requestUser.account.id,
    }
  }

  getUserID() {
    throw new BadRequestException('Service account do not have user id')

    return ''
  }

  getUserEmail() {
    throw new BadRequestException('Service account do not have user email')

    return ''
  }

  getDefaultWorkspaceID() {
    return this.requestUser.account.workspaceId
  }

  getWorkspaceAccessOrThrow(workspaceId: string) {
    if (workspaceId !== this.requestUser.account.workspaceId) {
      throw new ForbiddenException('User do not have access to workspace')
    }

    if (!this.requestUser.account.workspace.billingSettings) {
      throw new BadRequestException('Workspace do not have billing settings')
    }

    return new WorkspaceAccess(
      getConfig(),
      this.requestUser.account,
      this.requestUser.account.workspace,
      this.requestUser.account.workspace.billingSettings,
    )
  }
}
