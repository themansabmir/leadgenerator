import crypto from 'crypto'

const getKey = () => {
  const secret = process.env.ENCRYPTION_KEY || 'encruptionkey'
  if (!secret || secret.length === 0) {
    throw new Error('ENCRYPTION_KEY is not set')
  }
  return crypto.createHash('sha256').update(secret).digest()
}

export const encrypt = (plaintext: string): string => {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, ciphertext]).toString('base64')
}

export const decrypt = (payload: string): string => {
  const key = getKey()
  const buf = Buffer.from(payload, 'base64')
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const data = buf.subarray(28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()])
  return plaintext.toString('utf8')
}
