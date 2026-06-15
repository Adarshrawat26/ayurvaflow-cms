import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'
import apiRouter from './routes/api.js'
import portalRouter from './routes/portal.js'
import { prisma } from './lib/prisma.js'
import { isProduction, validateEnv } from './lib/env.js'

validateEnv()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3001
const isProd = isProduction()

const app = express()

app.disable('x-powered-by')

if (process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1)
}

app.use(helmet({ contentSecurityPolicy: false }))
app.use(
  cors({
    origin: isProd ? false : true,
    credentials: true,
  }),
)
app.use(express.json({ limit: '15mb' }))

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json(
      isProd
        ? { status: 'ok', db: 'connected' }
        : { status: 'ok', env: process.env.NODE_ENV ?? 'development', db: 'connected' },
    )
  } catch {
    res.status(503).json(
      isProd
        ? { status: 'degraded', db: 'disconnected' }
        : { status: 'degraded', env: process.env.NODE_ENV ?? 'development', db: 'disconnected' },
    )
  }
})

app.use('/api/portal', portalRouter)
app.use('/api', apiRouter)

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

if (isProd) {
  const distPath = path.join(__dirname, '../dist')
  app.use(
    express.static(distPath, {
      index: false,
      maxAge: '1d',
      etag: true,
    }),
  )
  app.use((_req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const server = app.listen(PORT, () => {
  console.log(`🌿 AyurvaFlow API running on http://localhost:${PORT}`)
  if (isProd) console.log('   Serving frontend from /dist')
})

function shutdown(signal: string) {
  console.log(`\n${signal} received — shutting down`)
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0))
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
