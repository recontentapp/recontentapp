import { ValidationOptions, ValidateIf } from 'class-validator'

export const IsNullable = (validationOptions?: ValidationOptions) => {
  return ValidateIf((_object, value) => value !== null, validationOptions)
}
