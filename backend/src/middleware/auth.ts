import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: number
  phone?: string
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as {
      userId: number
      phone: string
    }
    req.userId = payload.userId
    req.phone = payload.phone
    next()
  } catch {
    res.status(401).json({ error: 'invalid_token' })
  }
}
