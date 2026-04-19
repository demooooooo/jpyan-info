import type { TypedUser } from 'payload'

import { getPayloadClient } from './payload'

export type FrontendUser = {
  displayName: string
  email: string
  id: number
}

const deriveDisplayName = (email?: string | null) => {
  if (!email) return '已登录用户'

  return email.split('@')[0]?.trim() || email
}

export const getCurrentFrontendUser = async (requestHeaders: Headers): Promise<FrontendUser | null> => {
  try {
    const payload = await getPayloadClient()
    const authResult = await payload.auth({
      headers: requestHeaders,
    })

    const user = authResult.user as TypedUser | null | undefined

    if (!user || typeof user.id !== 'number' || !user.email) return null

    return {
      displayName: deriveDisplayName(user.email),
      email: user.email,
      id: user.id,
    }
  } catch {
    return null
  }
}
