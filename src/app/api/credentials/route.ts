import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/db/mongodb'
import { createCredentialRepository } from '@/db/repositories/CredentialRepository'
import { createCredential, listCredentials } from '@/lib/services/credential/CredentialService'
import { createCredentialSchema } from '@/lib/validators/credential.validators'
import { encrypt } from '@/lib/utils/encryption'
import { extractTokenFromCookies, validateTokenPipeline } from '@/lib/auth/tokenManager'

export async function GET(request: NextRequest) {
  try {
    const token = await extractTokenFromCookies()
    const payload = validateTokenPipeline(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const repo = createCredentialRepository()
    const data = await listCredentials({ repo, encrypt })

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('GET /api/credentials error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await extractTokenFromCookies()
    const payload = validateTokenPipeline(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const parsed = createCredentialSchema.safeParse(json)
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }

    await connectDB()
    const repo = createCredentialRepository()
    const created = await createCredential({ repo, encrypt }, parsed.data)

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error('POST /api/credentials error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
