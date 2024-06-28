import { isValidFileFormat } from '@recontentapp/file-formats'
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { isValidPlan } from 'src/modules/cloud/billing/plan'
import { isValidDestinationSyncFrequency } from 'src/modules/phrase/destinations'
import {
  isValidPromptLength,
  isValidPromptTone,
} from 'src/modules/ux-writing/prompt'
import { isValidLanguageLocale } from 'src/modules/workspace/locale'

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

@ValidatorConstraint({ name: 'promptTone', async: false })
export class PromptToneValidator implements ValidatorConstraintInterface {
  validate(tone: string) {
    return isValidPromptTone(tone)
  }

  defaultMessage() {
    return 'Prompt tone "$value" is not valid'
  }
}

@ValidatorConstraint({ name: 'promptLength', async: false })
export class PromptLengthValidator implements ValidatorConstraintInterface {
  validate(length: string) {
    return isValidPromptLength(length)
  }

  defaultMessage() {
    return 'Prompt length "$value" is not valid'
  }
}
