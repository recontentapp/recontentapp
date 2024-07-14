import {
  Workspace,
  WorkspaceAccount,
  WorkspaceBillingSettings,
} from '@prisma/client'
import { WorkspaceAccess } from './requester.object'

const getWorkspace = (data?: Partial<Workspace>): Workspace => ({
  id: '1',
  key: 'acme',
  name: 'ACME inc',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: '1',
  updatedBy: null,
  ...data,
})

const getWorkspaceAccount = (
  data?: Partial<WorkspaceAccount>,
): WorkspaceAccount => ({
  id: '1',
  workspaceId: '1',
  type: 'human',
  role: 'owner',
  userId: '1',
  serviceId: null,
  apiKey: null,
  invitedBy: null,
  blockedBy: null,
  blockedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...data,
})

const getWorkspaceBillingSettings = (
  data?: Partial<WorkspaceBillingSettings>,
): WorkspaceBillingSettings => ({
  id: '1',
  workspaceId: '1',
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  plan: 'free',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: '1',
  updatedBy: null,
  ...data,
})

describe('WorkspaceAccess', () => {
  describe('Self-hosted', () => {
    const selfHostedAppConfig = {
      version: '0.0.0',
      distribution: 'self-hosted',
      workspaceInviteOnly: false,
      serveStaticFiles: false,
    } as const

    it('does not allow write for API keys', () => {
      const access = new WorkspaceAccess(
        {
          app: selfHostedAppConfig,
          ai: {
            available: false,
            googleGeminiApiKey: undefined,
          },
        },
        getWorkspaceAccount({
          userId: null,
          serviceId: '1',
          apiKey: '123',
          role: 'member',
        }),
        getWorkspace(),
        getWorkspaceBillingSettings(),
      )

      expect(access.getAbilities()).not.toContain('workspace:write')
    })

    it('does not allow auto translation if no provider', () => {
      const access = new WorkspaceAccess(
        {
          app: selfHostedAppConfig,
          ai: {
            available: false,
            googleGeminiApiKey: undefined,
          },
        },
        getWorkspaceAccount({ role: 'biller' }),
        getWorkspace(),
        getWorkspaceBillingSettings(),
      )

      expect(access.getAbilities()).not.toContain('ai:use')
    })

    it('allows auto translation if a provider is defined', () => {
      const access = new WorkspaceAccess(
        {
          app: selfHostedAppConfig,
          ai: {
            available: true,
            googleGeminiApiKey: '123456',
          },
        },
        getWorkspaceAccount({ role: 'biller' }),
        getWorkspace(),
        getWorkspaceBillingSettings(),
      )

      expect(access.getAbilities()).toContain('ai:use')
    })
  })

  describe('Cloud', () => {
    const cloudAppConfig = {
      version: '0.0.0',
      distribution: 'cloud',
      workspaceInviteOnly: false,
      serveStaticFiles: false,
    } as const

    it('does not allow auto translation on free plan', () => {
      const access = new WorkspaceAccess(
        {
          app: cloudAppConfig,
          ai: {
            available: true,
            googleGeminiApiKey: '123456',
          },
        },
        getWorkspaceAccount({ role: 'biller' }),
        getWorkspace(),
        getWorkspaceBillingSettings({ plan: 'free' }),
      )

      expect(access.getAbilities()).not.toContain('ai:use')
    })

    it('allows auto translation on pro plan', () => {
      const access = new WorkspaceAccess(
        {
          app: cloudAppConfig,
          ai: {
            available: true,
            googleGeminiApiKey: '123456',
          },
        },
        getWorkspaceAccount({ role: 'biller' }),
        getWorkspace(),
        getWorkspaceBillingSettings({ plan: 'pro' }),
      )

      expect(access.getAbilities()).toContain('ai:use')
    })
  })
})
