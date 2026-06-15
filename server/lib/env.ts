const WEAK_SECRETS = new Set([
  'dev-secret',
  'change-this-to-a-long-random-secret-in-production',
])

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (isProduction()) {
    if (!secret || secret.length < 32 || WEAK_SECRETS.has(secret)) {
      throw new Error('JWT_SECRET must be a random string of at least 32 characters')
    }
    return secret
  }
  return secret ?? 'dev-secret'
}

export function validateEnv(): void {
  if (!isProduction()) return

  try {
    getJwtSecret()
  } catch (err) {
    console.error('❌ Production startup failed:', (err as Error).message)
    console.error('   Generate one with: openssl rand -base64 48')
    process.exit(1)
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is required in production')
    process.exit(1)
  }
}
