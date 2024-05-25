import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator'
import { Components } from 'src/generated/typeDefinitions'
import { WorkspaceBillingPlanValidator } from './domain.dto'
import { ID_LENGTH, TEXT_LENGTH } from '../constants'

export class SetupBillingSettingsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  email: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  workspaceId: string
}

export class GenerateBillingPortalSessionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  workspaceId: string
}

export class SubscribeToBillingPlanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  workspaceId: string

  @Validate(WorkspaceBillingPlanValidator)
  @IsNotEmpty()
  plan: Components.Schemas.WorkspaceBillingPlan
}

export class ResetBillingSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  workspaceId: string
}
