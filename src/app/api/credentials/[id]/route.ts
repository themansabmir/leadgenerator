import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/db/mongodb'
import { createCredentialRepository } from '@/db/repositories/CredentialRepository'
import { deleteCredential } from '@/lib/services/credential/CredentialService'
import { credentialIdParamSchema } from '@/lib/validators/credential.validators'
import { extractTokenFromCookies, validateTokenPipeline } from '@/lib/auth/tokenManager'

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const token = await extractTokenFromCookies()
    const payload = validateTokenPipeline(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = credentialIdParamSchema.safeParse(context.params)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid credential id' }, { status: 400 })
    }

    await connectDB()
    const repo = createCredentialRepository()
    const ok = await deleteCredential({ repo, encrypt: (s) => s }, parsed.data.id)

    if (!ok) {
      // idempotent: return 204 even if nothing deleted (or choose 404 if you prefer strict)
      return NextResponse.json({ success: true }, { status: 204 })
    }

    return NextResponse.json({ success: true }, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/credentials/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
