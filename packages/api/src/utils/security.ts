import * as bcrypt from 'bcrypt'
import { randomBytes } from 'node:crypto'

const roundsOfHashing = 10

export const generateAPIKey = () => {
  const buffer = randomBytes(32)
  const apiKey = buffer.toString('utf-8')

  return apiKey
}

export const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, roundsOfHashing)
  return hashedPassword
}

export const isPasswordValid = async (
  password: string,
  hashedPassword: string,
) => {
  const isPasswordValid = await bcrypt.compare(password, hashedPassword)
  return isPasswordValid
}

export const escapeFileName = (filename: string) => {
  return filename.replace(/[^a-z0-9]/gi, '_')
}

export const escapeForExcel = (cellContent: string) => {
  /**
   * Avoid Excel from interpreting the content
   * as a formula for security reasons
   */
  if (/^[=+@-]/.test(cellContent)) {
    return `'${cellContent}`
  }

  return cellContent
}
