---
name: backend-patterns
description: Backend architecture patterns, API design, database optimization, caching, error handling, and auth for Node.js/Express/Next.js API routes. Use when building or reviewing server-side routes and their data access.
---

# Backend Patterns

Backend architecture patterns for maintainable server-side applications.

## When to Use

- Designing REST API endpoints
- Structuring repository/service/controller layers
- Optimizing database queries (N+1, indexing)
- Adding caching (Redis, in-memory, HTTP cache headers)
- Setting up background jobs or async processing
- Structuring error handling and validation for APIs
- Building middleware (auth, logging, rate limiting)

## API Design

```typescript
// Resource-based URLs
GET    /api/orders                 // List
GET    /api/orders/:id             // Get one
POST   /api/orders                 // Create
PATCH  /api/orders/:id             // Update
DELETE /api/orders/:id             // Delete

// Query params for filtering, sorting, pagination
GET /api/orders?status=pending&sort=createdAt&limit=20&offset=0
```

## Repository + Service Layers

Separate data access (repository) from business logic (service) — the service depends on
an interface, not a concrete database client, so the data layer can be swapped or mocked.

```typescript
interface OrderRepository {
  findById(id: string): Promise<Order | null>
  create(data: CreateOrderDto): Promise<Order>
}

class SqlOrderRepository implements OrderRepository {
  async findById(id: string): Promise<Order | null> {
    return db.order.findUnique({ where: { id } })
  }
  async create(data: CreateOrderDto): Promise<Order> {
    return db.order.create({ data })
  }
}

class OrderService {
  constructor(private repo: OrderRepository) {}

  async placeOrder(data: CreateOrderDto): Promise<Order> {
    // business rules live here, not in the repository
    if (data.items.length === 0) throw new ApiError(400, "Order must have at least one item")
    return this.repo.create(data)
  }
}
```

## Middleware

```typescript
export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "")
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    try {
      req.user = await verifyToken(token)
      return handler(req, res)
    } catch {
      return res.status(401).json({ error: "Invalid token" })
    }
  }
}
```

## Database Patterns

### Select only what you need

```typescript
// GOOD
const orders = await db.order.findMany({ select: { id: true, status: true, total: true } })

// BAD — over-fetches every column for every row
const orders = await db.order.findMany()
```

### N+1 prevention

```typescript
// BAD — one query per order
const orders = await getOrders()
for (const order of orders) {
  order.customer = await getUser(order.customerId) // N queries
}

// GOOD — batch fetch, then join in memory
const orders = await getOrders()
const customers = await getUsers(orders.map(o => o.customerId)) // 1 query
const byId = new Map(customers.map(c => [c.id, c]))
orders.forEach(o => { o.customer = byId.get(o.customerId) })
```

## Caching — Cache-Aside

```typescript
async function getOrderCached(id: string): Promise<Order> {
  const cacheKey = `order:${id}`

  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const order = await db.order.findUnique({ where: { id } })
  if (!order) throw new ApiError(404, "Order not found")

  await redis.setex(cacheKey, 300, JSON.stringify(order)) // 5 min TTL
  return order
}
```

Invalidate (`redis.del`) on every write to the same key, not just on a timer.

## Error Handling

```typescript
class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
  }
}

export function errorHandler(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.statusCode })
  }
  if (error instanceof z.ZodError) {
    return Response.json({ error: "Validation failed", details: error.issues }, { status: 400 })
  }
  console.error("Unexpected error:", error) // log full detail server-side
  return Response.json({ error: "Internal server error" }, { status: 500 }) // never leak internals to the client
}
```

### Retry with exponential backoff

```typescript
async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 2 ** i * 1000)) // 1s, 2s, 4s
      }
    }
  }
  throw lastError!
}
```

## Auth

```typescript
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  } catch {
    throw new ApiError(401, "Invalid token")
  }
}

const rolePermissions: Record<Role, Permission[]> = {
  admin: ["read", "write", "delete"],
  user: ["read", "write"],
}

export function hasPermission(user: User, permission: Permission): boolean {
  return rolePermissions[user.role].includes(permission)
}
```

## Rate Limiting

Use a shared store (Redis) or the platform's native limiter — never a per-process in-memory
counter for production APIs. In-memory counters reset on every deploy, don't share state
across replicas/serverless instances, and effectively fail open under load.

## Background Jobs

For anything beyond a trivial fire-and-forget task, use a real queue (BullMQ, SQS, Cloud
Tasks) instead of an in-process array — an in-process queue is lost on every restart/deploy.

```typescript
// Fine for a single-process dev tool; not for anything that must survive a restart
export async function POST(request: Request) {
  const { orderId } = await request.json()
  await indexQueue.add({ orderId }) // hand off instead of blocking the response
  return Response.json({ queued: true })
}
```

## Logging

Log structured JSON with enough context to trace a single request, not free-text strings:

```typescript
logger.info("Fetching orders", { requestId, method: "GET", path: "/api/orders" })
// ...
logger.error("Failed to fetch orders", error, { requestId })
```

## Related

Use the `code-reviewer` agent / `/code-review` command for the review pass — it already
flags N+1 queries, missing timeouts, and error detail leaking to clients as HIGH-severity
findings under "Node.js / Backend".
