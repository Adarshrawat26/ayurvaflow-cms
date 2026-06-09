import type { AuthPayload } from './auth-types'

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthPayload
  }
}
