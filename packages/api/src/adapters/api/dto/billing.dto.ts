import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator'
import { WorkspaceBillingPlanValidator } from './domain.dto'
import { Components } from 'src/generated/typeDefinitions'

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
  plan: Components.Schemas.WorkspaceBillingPlan
}

export class ResetBillingSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  workspaceId: string
}
