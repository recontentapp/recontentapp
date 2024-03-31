import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { isValidFileFormat } from 'src/modules/io/fileFormat'
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
