import PasswordValidator from 'password-validator'

const getValidator = (): PasswordValidator => {
  const schema = new PasswordValidator()

  schema
    .is()
    .min(8)
    .is()
    .max(40)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits(1)
    .has()
    .not()
    .spaces()

  return schema
}

export const passwordConfig = getValidator()
