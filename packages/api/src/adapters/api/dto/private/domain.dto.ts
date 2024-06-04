import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { isValidFileFormat } from '@recontentapp/file-formats'
import { isValidPlan } from 'src/modules/cloud/billing/plan'
import { isValidLanguageLocale } from 'src/modules/workspace/locale'
import { isValidDestinationSyncFrequency } from 'src/modules/phrase/destinations'

@ValidatorConstraint({ name: 'languageLocale', async: false })
export class LanguageLocaleValidator implements ValidatorConstraintInterface {
  validate(locale: string) {
    return isValidLanguageLocale(locale)
  }

  defaultMessage() {
    return 'Locale "$value" is not valid'
  }
}

@ValidatorConstraint({ name: 'fileFormat', async: false })
export class FileFormatValidator implements ValidatorConstraintInterface {
  validate(format: string) {
    return isValidFileFormat(format)
  }

  defaultMessage() {
    return 'File format "$value" is not valid'
  }
}

@ValidatorConstraint({ name: 'workspaceBillingPlan', async: false })
export class WorkspaceBillingPlanValidator
  implements ValidatorConstraintInterface
{
  validate(format: string) {
    return isValidPlan(format)
  }

  defaultMessage() {
    return 'Workspace billing plan "$value" is not valid'
  }
}

@ValidatorConstraint({ name: 'destinationSyncFrequency', async: false })
export class DestinationSyncFrequencyValidator
  implements ValidatorConstraintInterface
{
  validate(frequency: string) {
    return isValidDestinationSyncFrequency(frequency)
  }

  defaultMessage() {
    return 'Destination sync frequency "$value" is not valid'
  }
}
