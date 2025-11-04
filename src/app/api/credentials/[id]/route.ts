import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/db/mongodb'
import { createCredentialRepository } from '@/db/repositories/CredentialRepository'
import { deleteCredential } from '@/lib/services/credential/CredentialService'
import { credentialIdParamSchema } from '@/lib/validators/credential.validators'
import { extractTokenFromCookies, validateTokenPipeline } from '@/lib/auth/tokenManager'

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const token = await extractTokenFromCookies()
    const payload = validateTokenPipeline(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const parsed = credentialIdParamSchema.safeParse(params)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid credential id' }, { status: 400 })
    }

    await connectDB()
    const repo = createCredentialRepository()
    const ok = await deleteCredential({ repo, encrypt: (s) => s }, parsed.data.id)

    if (!ok) {
      return NextResponse.json({ success: false, error: 'Credential not found' }, { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/credentials/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
