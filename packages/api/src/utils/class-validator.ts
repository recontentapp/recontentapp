import { ClassConstructor, plainToInstance, Type } from 'class-transformer'
import {
  registerDecorator,
  ValidateIf,
  validateSync,
  ValidationOptions,
} from 'class-validator'

export const IsNullable = (validationOptions?: ValidationOptions) => {
  return ValidateIf((_object, value) => value !== null, validationOptions)
}

// Inspired by https://github.com/typestack/class-validator/issues/616#issuecomment-1312218606
export function OneOf(
  types: Exclude<Parameters<typeof Type>[0], undefined>[],
): PropertyDecorator {
  return function (target: object, propertyName: PropertyKey) {
    registerDecorator({
      name: 'OneOf',
      target: target.constructor,
      propertyName: propertyName.toString(),
      options: {},
      validator: {
        validate(arg: object | Array<object>) {
          let objects: Array<object>

          if (Array.isArray(arg)) objects = arg
          else objects = [arg]

          for (const somethingToTransform of objects) {
            const isValid = types.some(t => {
              const classType = t() as ClassConstructor<object>

              let object: object

              if (typeof somethingToTransform === 'string') {
                object = JSON.parse(somethingToTransform)
              } else if (
                somethingToTransform != null &&
                typeof somethingToTransform === 'object'
              ) {
                object = somethingToTransform
              } else {
                throw new Error(
                  'Incorrect object param type! Only string or objects are allowed.',
                )
              }

              const instance = plainToInstance(classType, object, undefined)

              try {
                const errors = validateSync(instance)

                if (errors.length) return false
                else return true
              } catch (error) {
                return false
              }
            })

            if (!isValid) return false
          }

          return true
        },
        defaultMessage() {
          if (types.length === 0) {
            return ''
          } else if (types.length === 1) {
            const type = types[0]()
            return `Has to be of type ${type.name}.`
          } else {
            const lastType = types.pop()!()
            return `Can only be of types ${types
              .map(t => {
                const type = t()
                return type.name
              })
              .join(', ')}, or ${lastType.name}.`
          }
        },
      },
    })
  }
}
