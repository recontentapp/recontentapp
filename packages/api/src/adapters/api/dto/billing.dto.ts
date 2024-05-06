import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator'
import { Plan } from 'src/modules/billing/plan'
import { WorkspaceBillingPlanValidator } from './domain.dto'

export class SetupBillingSettingsDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  workspaceId: string
}

export class GenerateBillingPortalSessionDto {
  @IsString()
  @IsNotEmpty()
  workspaceId: string
}

export class SubscribeToBillingPlanDto {
  @IsString()
  @IsNotEmpty()
  workspaceId: string

  @Validate(WorkspaceBillingPlanValidator)
  @IsNotEmpty()
  plan: Plan
}

export class UnsubscribeFromBillingPlanDto {
  @IsString()
  @IsNotEmpty()
  workspaceId: string
}

export class ResetBillingSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  workspaceId: string
}
