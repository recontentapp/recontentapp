import {
  Service as PrismaService,
  User as PrismaUser,
  Workspace as PrismaWorkspace,
  WorkspaceAccount as PrismaWorkspaceAccount,
  WorkspaceBillingSettings as PrismaWorkspaceBillingSettings,
} from '@prisma/client'

export interface TokenContent {
  userId: string
}

export type ScopedHumanRequestUser = {
  type: 'scoped-human'
  account: PrismaWorkspaceAccount & {
    user: PrismaUser | null
    workspace: PrismaWorkspace & {
      billingSettings: PrismaWorkspaceBillingSettings | null
    }
  }
}

export type HumanRequestUser = {
  type: 'human'
  user: PrismaUser & {
    accounts: Array<
      PrismaWorkspaceAccount & {
        workspace: PrismaWorkspace & {
          billingSettings: PrismaWorkspaceBillingSettings | null
        }
      }
    >
  }
}

export type ServiceRequestUser = {
  type: 'service'
  account: PrismaWorkspaceAccount & {
    service: PrismaService | null
    workspace: PrismaWorkspace & {
      billingSettings: PrismaWorkspaceBillingSettings | null
    }
  }
}

export type RequestUser =
  | HumanRequestUser
  | ScopedHumanRequestUser
  | ServiceRequestUser
