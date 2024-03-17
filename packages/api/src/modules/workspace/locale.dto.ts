import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { isValidLanguageLocale } from './locale'

@ValidatorConstraint({ name: 'customText', async: false })
export class LanguageLocaleValidator implements ValidatorConstraintInterface {
  validate(locale: string) {
    return isValidLanguageLocale(locale)
  }

  defaultMessage() {
    return 'Locale "$value" is not valid'
  }
}
