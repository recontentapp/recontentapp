import { Request } from 'express'
import { HumanRequester, Requester, ServiceRequester } from './requester.object'
import { RequestUser } from './types'

export const getRequesterOrNull = (req: Request): Requester | null => {
  const user = req.user as RequestUser | undefined

  if (!user) {
    return null
  }

  if (user.type === 'service') {
    return new ServiceRequester(user)
  }

  return new HumanRequester(user)
}
