/**
 * Complete Cloudflare Worker with better-auth
 *
 * This example demonstrates:
 * - D1 database adapter
 * - Email/password authentication
 * - Google OAuth
 * - Protected routes with session verification
 * - CORS configuration for SPA
 * - KV storage for sessions (strong consistency)
 * - Rate limiting
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { betterAuth } from 'better-auth'
import { d1Adapter } from 'better-auth/adapters/d1'
import { rateLimit } from 'better-auth/plugins'

// Environment bindings
type Env = {
  DB: D1Database
  SESSIONS_KV: KVNamespace
  RATE_LIMIT_KV: KVNamespace
  BETTER_AUTH_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  FRONTEND_URL: string
}

const app = new Hono<{ Bindings: Env }>()

// CORS configuration for SPA
app.use('/api/*', async (c, next) => {
  const corsMiddleware = cors({
    origin: [c.env.FRONTEND_URL, 'http://localhost:3000'],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization']
  })
  return corsMiddleware(c, next)
})

// Helper: Initialize auth (per-request to access env)
function initAuth(env: Env) {
  return betterAuth({
    // D1 adapter for user data
    database: d1Adapter(env.DB),

    // Secret for signing tokens
    secret: env.BETTER_AUTH_SECRET,

    // Base URL for callbacks
    baseURL: env.FRONTEND_URL,

    // Email/password authentication
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendVerificationEmail: async ({ user, url, token }) => {
        // TODO: Implement email sending
        // Example: Use Resend, SendGrid, or Cloudflare Email Routing
        console.log(`Verification email for ${user.email}: ${url}`)
      }
    },

    // Social providers
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        scope: ['openid', 'email', 'profile']
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        scope: ['user:email', 'read:user']
      }
    },

    // Session configuration
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update every 24 hours

      // Use KV for sessions (strong consistency, vs D1 eventual consistency)
      storage: {
        get: async (sessionId) => {
          const session = await env.SESSIONS_KV.get(sessionId)
          return session ? JSON.parse(session) : null
        },
        set: async (sessionId, session, ttl) => {
          await env.SESSIONS_KV.put(
            sessionId,
            JSON.stringify(session),
            { expirationTtl: ttl }
          )
        },
        delete: async (sessionId) => {
          await env.SESSIONS_KV.delete(sessionId)
        }
      }
    },

    // Plugins
    plugins: [
      rateLimit({
        window: 60, // 60 seconds
        max: 10, // 10 requests per window
        storage: {
          get: async (key) => {
            return await env.RATE_LIMIT_KV.get(key)
          },
          set: async (key, value, ttl) => {
            await env.RATE_LIMIT_KV.put(key, value, { expirationTtl: ttl })
          }
        }
      })
    ]
  })
}

// Auth routes - handle all better-auth endpoints
app.all('/api/auth/*', async (c) => {
  const auth = initAuth(c.env)
  return auth.handler(c.req.raw)
})

// Example: Protected API route
app.get('/api/protected', async (c) => {
  const auth = initAuth(c.env)
  const session = await auth.getSession(c.req.raw)

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  return c.json({
    message: 'Protected data',
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name
    }
  })
})

// Example: User profile endpoint
app.get('/api/user/profile', async (c) => {
  const auth = initAuth(c.env)
  const session = await auth.getSession(c.req.raw)

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  // Fetch additional user data from D1
  const userProfile = await c.env.DB
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(session.user.id)
    .first()

  return c.json(userProfile)
})

// Example: Update user profile
app.patch('/api/user/profile', async (c) => {
  const auth = initAuth(c.env)
  const session = await auth.getSession(c.req.raw)

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { name, bio } = await c.req.json()

  // Update user in D1
  await c.env.DB
    .prepare('UPDATE users SET name = ?, bio = ?, updatedAt = ? WHERE id = ?')
    .bind(name, bio, Date.now(), session.user.id)
    .run()

  return c.json({ success: true })
})

// Example: Admin-only endpoint
app.get('/api/admin/users', async (c) => {
  const auth = initAuth(c.env)
  const session = await auth.getSession(c.req.raw)

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  // Check admin role (you'd store this in users table)
  const user = await c.env.DB
    .prepare('SELECT role FROM users WHERE id = ?')
    .bind(session.user.id)
    .first()

  if (user.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  // Fetch all users
  const users = await c.env.DB
    .prepare('SELECT id, email, name, role, createdAt FROM users')
    .all()

  return c.json(users.results)
})

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

export default app
