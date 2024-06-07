import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Requester } from 'src/modules/auth/requester.object'
import { Config } from 'src/utils/config'
import { PrismaService } from 'src/utils/prisma.service'
import { escapeTrailingSlash } from 'src/utils/strings'
import Stripe from 'stripe'

interface GetSettingsParams {
  workspaceId: string
  requester: Requester
}

interface GetStatusParams {
  workspaceId: string
  requester: Requester
}

interface GeneratePortalSessionParams {
  workspaceId: string
  requester: Requester
}

interface ListInvoicesParams {
  workspaceId: string
  requester: Requester
}

interface SetupSettingsParams {
  workspaceId: string
  requester: Requester
  email: string
  name: string
}

interface Settings {
  id: string
  name: string | null
  email: string | null
  address: {
    city: string | null
    country: string | null
    line1: string | null
    line2: string | null
    postalCode: string | null
    state: string | null
  } | null
  hasPaymentMethod: boolean
}

interface CustomerMetadata extends Stripe.MetadataParam {
  workspaceId: string
}

@Injectable()
export class SettingsService {
  private stripe: Stripe | null
  private static notAvailableMessage: string =
    'Billing is not available for self-hosted distribution'

  constructor(
    private readonly configService: ConfigService<Config, true>,
    private readonly prismaService: PrismaService,
  ) {
    const distribution = this.configService.get('app.distribution', {
      infer: true,
    })
    const stripeAPIKey = this.configService.get('billing.stripeKey', {
      infer: true,
    })
    if (!stripeAPIKey || distribution !== 'cloud') {
      return
    }

    this.stripe = new Stripe(stripeAPIKey, {
      typescript: true,
      apiVersion: '2024-04-10',
    })
  }

  async setup({ workspaceId, email, name, requester }: SetupSettingsParams) {
    if (!this.stripe) {
      throw new BadRequestException(SettingsService.notAvailableMessage)
    }

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('billing:manage')

    const workspaceBillingSettings =
      await this.prismaService.workspaceBillingSettings.findUniqueOrThrow({
        where: {
          workspaceId,
        },
      })

    // Can only set up billing again if existing customer is deleted
    if (workspaceBillingSettings.stripeCustomerId) {
      const customer = await this.stripe.customers.retrieve(
        workspaceBillingSettings.stripeCustomerId,
      )
      if (!customer.deleted) {
        throw new BadRequestException('Billing is already set up')
      }
    }

    const testClockId = this.configService.get('billing.stripeTestClockId', {
      infer: true,
    })

    const metadata: CustomerMetadata = {
      workspaceId,
    }

    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata,
      test_clock: testClockId,
    })

    await this.prismaService.workspaceBillingSettings.update({
      where: {
        id: workspaceBillingSettings.id,
      },
      data: {
        stripeCustomerId: customer.id,
        stripeSubscriptionId: null,
      },
    })
  }

  async generatePortalSession({
    workspaceId,
    requester,
  }: GeneratePortalSessionParams) {
    if (!this.stripe) {
      throw new BadRequestException(SettingsService.notAvailableMessage)
    }

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('billing:manage')

    const { key: workspaceKey } = workspaceAccess.getWorkspaceDetails()

    const config =
      await this.prismaService.workspaceBillingSettings.findUniqueOrThrow({
        where: {
          workspaceId,
        },
      })

    if (!config.stripeCustomerId) {
      throw new BadRequestException('Billing is not yet set up')
    }

    const appUrl = this.configService.get('urls.app', { infer: true })

    const session = await this.stripe.billingPortal.sessions.create({
      customer: config.stripeCustomerId,
      return_url: `${escapeTrailingSlash(
        appUrl,
      )}/${workspaceKey}/settings/billing`,
    })

    return { url: session.url }
  }

  async getStatus({ workspaceId, requester }: GetStatusParams) {
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const config =
      await this.prismaService.workspaceBillingSettings.findUniqueOrThrow({
        where: {
          workspaceId,
        },
      })

    return {
      plan: config.plan,
      status: config.status,
    }
  }

  async get({ workspaceId, requester }: GetSettingsParams): Promise<Settings> {
    if (!this.stripe) {
      throw new BadRequestException(SettingsService.notAvailableMessage)
    }

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('billing:manage')

    const config =
      await this.prismaService.workspaceBillingSettings.findUniqueOrThrow({
        where: {
          workspaceId,
        },
      })

    if (!config.stripeCustomerId) {
      throw new BadRequestException('Billing is not yet set up')
    }

    const customer = await this.stripe.customers
      .retrieve(config.stripeCustomerId)
      .catch(() => null)

    if (!customer || customer.deleted) {
      throw new BadRequestException('Billing is not yet set up')
    }

    return {
      id: customer.id,
      hasPaymentMethod: Boolean(
        customer.invoice_settings.default_payment_method,
      ),
      name: customer.name ?? null,
      email: customer.email,
      address: customer.address
        ? {
            city: customer.address.city,
            country: customer.address.country,
            line1: customer.address.line1,
            line2: customer.address.line2,
            postalCode: customer.address.postal_code,
            state: customer.address.state,
          }
        : null,
    }
  }

  async listInvoices({ workspaceId, requester }: ListInvoicesParams) {
    if (!this.stripe) {
      throw new BadRequestException(SettingsService.notAvailableMessage)
    }

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('billing:manage')

    const config =
      await this.prismaService.workspaceBillingSettings.findUniqueOrThrow({
        where: {
          workspaceId,
        },
      })

    if (!config.stripeCustomerId) {
      throw new BadRequestException('Billing is not yet set up')
    }

    const invoices = await this.stripe.invoices.list({
      customer: config.stripeCustomerId,
      limit: 50,
    })

    return invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number ?? 'Unknown',
      paid: invoice.paid,
      dueDate: invoice.effective_at
        ? new Date(invoice.effective_at * 1000).toISOString()
        : null,
      status: invoice.status,
      amount: invoice.amount_due,
      currency: invoice.currency,
      url: invoice.hosted_invoice_url ?? null,
    }))
  }
}
