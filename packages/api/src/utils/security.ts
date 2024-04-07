import * as bcrypt from 'bcrypt'
import {
  randomBytes,
  createCipheriv,
  createHash,
  createDecipheriv,
} from 'crypto'

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

export const encrypt = (text: string, secretKey: string) => {
  const cipher = createCipheriv(
    'aes-256-cbc',
    createHash('sha256').update(secretKey).digest(),
    Buffer.alloc(16, 0),
  )

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return encrypted
}

export const decrypt = (encryptedText: string, secretKey: string) => {
  const decipher = createDecipheriv(
    'aes-256-cbc',
    createHash('sha256').update(secretKey).digest(),
    Buffer.alloc(16, 0),
  )

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
