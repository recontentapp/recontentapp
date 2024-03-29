import * as bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'

const roundsOfHashing = 10

export const generateAPIKey = () => {
  const buffer = randomBytes(100)
  const apiKey = buffer
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 32)

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
