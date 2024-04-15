import {
  User as PrismaUser,
  WorkspaceAccount as PrismaWorkspaceAccount,
  Service as PrismaService,
  Workspace as PrismaWorkspace,
  WorkspaceBillingSettings as PrismaWorkspaceBillingSettings,
} from '@prisma/client'

export interface TokenContent {
  userId: string
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

export type RequestUser = HumanRequestUser | ServiceRequestUser
