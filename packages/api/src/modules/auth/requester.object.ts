import { BadRequestException, ForbiddenException } from '@nestjs/common'
import {
  WorkspaceAccount as PrismaWorkspaceAccount,
  Workspace as PrismaWorkspace,
  WorkspaceBillingSettings as PrismaWorkspaceBillingSettings,
} from '@prisma/client'
import { Components } from 'src/generated/typeDefinitions'
import { HumanRequestUser, ServiceRequestUser } from './types'

export interface Requester {
  getLoggingAttributes: () => Record<string, string>
  getWorkspaceAccessOrThrow: (workspaceId: string) => WorkspaceAccess
}

export class WorkspaceAccess {
  private abilities: Components.Schemas.WorkspaceAbility[] = []

  private resolveAbilities() {
    // TODO: Implement this
  }

  constructor(
    private workspaceAccount: PrismaWorkspaceAccount,
    private workspace: PrismaWorkspace,
    private workspaceBillingSettings: PrismaWorkspaceBillingSettings,
  ) {
    this.resolveAbilities()
  }

  getAccountID() {
    return this.workspaceAccount.id
  }

  hasAbilityOrThrow(ability: Components.Schemas.WorkspaceAbility) {
    if (!this.abilities.includes(ability)) {
      throw new ForbiddenException('User do not have required ability')
    }
  }

  getWorkspaceDetails() {
    const { id, name, key } = this.workspace

    return {
      id,
      key,
      name,
    }
  }
}

export class HumanRequester implements Requester {
  constructor(private requestUser: HumanRequestUser) {}

  getLoggingAttributes() {
    return {
      userId: this.requestUser.user.id,
    }
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
      serviceAccountId: this.requestUser.account.id,
    }
  }

  getWorkspaceAccessOrThrow(workspaceId: string) {
    if (workspaceId !== this.requestUser.account.workspaceId) {
      throw new ForbiddenException('User do not have access to workspace')
    }

    if (!this.requestUser.account.workspace.billingSettings) {
      throw new BadRequestException('Workspace do not have billing settings')
    }

    return new WorkspaceAccess(
      this.requestUser.account,
      this.requestUser.account.workspace,
      this.requestUser.account.workspace.billingSettings,
    )
  }
}
