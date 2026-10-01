# Error Handling in Medusa

Medusa provides the `MedusaError` class for consistent error responses across your API routes and custom code.

## Contents
- [Using MedusaError](#using-medusaerror)
- [Error Types](#error-types)
- [Error Response Format](#error-response-format)
- [Best Practices](#best-practices)

## Using MedusaError

Use `MedusaError` in API routes, workflows, and custom modules to throw errors that Medusa will automatically format and return to clients:

```typescript
import { MedusaError } from "@medusajs/framework/utils"

// Throw an error
throw new MedusaError(
  MedusaError.Types.NOT_FOUND,
  "Product not found"
)
```

## Error Types

### NOT_FOUND
Use when a requested resource doesn't exist:

```typescript
throw new MedusaError(
  MedusaError.Types.NOT_FOUND,
  "Product with ID 'prod_123' not found"
)
```

**HTTP Status**: 404

### INVALID_DATA
Use when request data fails validation or is malformed:

```typescript
throw new MedusaError(
  MedusaError.Types.INVALID_DATA,
  "Email address is invalid"
)
```

**HTTP Status**: 400

### UNAUTHORIZED
Use when authentication is required but not provided:

```typescript
throw new MedusaError(
  MedusaError.Types.UNAUTHORIZED,
  "Authentication required to access this resource"
)
```

**HTTP Status**: 401

### NOT_ALLOWED
Use when the user is authenticated but doesn't have permission:

```typescript
throw new MedusaError(
  MedusaError.Types.NOT_ALLOWED,
  "You don't have permission to delete this product"
)
```

**HTTP Status**: 403

### CONFLICT
Use when the operation conflicts with existing data:

```typescript
throw new MedusaError(
  MedusaError.Types.CONFLICT,
  "A product with this handle already exists"
)
```

**HTTP Status**: 409

### DUPLICATE_ERROR
Use when trying to create a duplicate resource:

```typescript
throw new MedusaError(
  MedusaError.Types.DUPLICATE_ERROR,
  "Email address is already registered"
)
```

**HTTP Status**: 422

### INVALID_STATE
Use when the resource is in an invalid state for the operation:

```typescript
throw new MedusaError(
  MedusaError.Types.INVALID_STATE,
  "Cannot cancel an order that has already been fulfilled"
)
```

**HTTP Status**: 400

## Error Response Format

Medusa automatically formats errors into a consistent JSON response:

```json
{
  "type": "not_found",
  "message": "Product with ID 'prod_123' not found"
}
```

## Best Practices

### 1. Use Specific Error Types

Choose the most appropriate error type for the situation:

```typescript
// ✅ GOOD: Uses specific error types
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve("query")

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
    filters: { id },
  })

  if (!data || data.length === 0) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Product with ID '${id}' not found`
    )
  }

  return res.json({ product: data[0] })
}

// ❌ BAD: Uses generic error
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve("query")

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
    filters: { id },
  })

  if (!data || data.length === 0) {
    throw new Error("Product not found") // Generic error
  }

  return res.json({ product: data[0] })
}
```

### 2. Provide Clear Error Messages

Error messages should be descriptive and help users understand what went wrong:

```typescript
// ✅ GOOD: Clear, specific message
throw new MedusaError(
  MedusaError.Types.INVALID_DATA,
  "Cannot create product: title must be at least 3 characters long"
)

// ❌ BAD: Vague message
throw new MedusaError(
  MedusaError.Types.INVALID_DATA,
  "Invalid input"
)
```

### 3. Include Context in Error Messages

```typescript
// ✅ GOOD: Includes relevant context
throw new MedusaError(
  MedusaError.Types.NOT_FOUND,
  `Product with ID '${productId}' not found`
)

// ✅ GOOD: Includes field name
throw new MedusaError(
  MedusaError.Types.INVALID_DATA,
  `Invalid email format: '${email}'`
)
```

### 4. Handle Workflow Errors

When calling workflows from API routes, catch and transform errors:

```typescript
// ✅ GOOD: Catches and transforms workflow errors
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { data } = req.validatedBody

  try {
    const { result } = await myWorkflow(req.scope).run({
      input: { data },
    })

    return res.json({ result })
  } catch (error) {
    // Transform workflow errors into API errors
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Failed to create resource: ${error.message}`
    )
  }
}
```

### 5. Use Validation Middleware

Let validation middleware handle input validation errors:

```typescript
// ✅ GOOD: Middleware handles validation
// middlewares.ts
const MySchema = z.object({
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be at least 18 years old"),
})

export const myMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/my-route",
    method: "POST",
    middlewares: [validateAndTransformBody(MySchema)],
  },
]

// route.ts - No need to validate again
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { email, age } = req.validatedBody // Already validated

  // Your logic here
}
```

### 6. Catch Narrowly

Catch only the error you can answer. A transport failure - a timeout, a 5xx, a dropped connection -
says nothing about whether the thing exists, so it must never become a domain verdict such as "not
found" or "skip".

```typescript
// ❌ WRONG: an outage reads as a deletion
const remote = await client.getDocument(id).catch(() => null)
if (!remote) {
  return new StepResponse({ action: "skip", reason: "not_found" })
}

// ✅ CORRECT: only the answer "it does not exist" is a verdict
try {
  remote = await client.getDocument(id)
} catch (error) {
  if (error instanceof RemoteApiError && error.status === 404) {
    return new StepResponse({ action: "skip", reason: "not_found" })
  }
  return new StepResponse({ action: "failed", reason: describe(error) })
}
```

The same holds for a Medusa module lookup: catch `MedusaError.Types.NOT_FOUND` and let every other
error propagate. A client that throws a plain `Error` with the status inside its message cannot be
caught narrowly - give it an error class that carries the status.

### 7. Detect Database Errors by Re-reading, Not by Message

Never decide what a database error means by matching its text. Medusa's error mapper rewrites
Postgres errors into its own wording (a unique violation becomes `INVALID_DATA` "... already
exists"), and that wording is not a contract. When a create may lose a race on a unique key, re-read
the row it may have collided with:

```typescript
try {
  return await service.createDocuments(data)
} catch (error) {
  const [winner] = await service.listDocuments({ external_id: data.external_id })
  if (!winner) {
    throw error // not a race: the create failed for another reason
  }
  return winner // a concurrent run created it first
}
```

The re-read belongs to the write step: it decides whether the write failed at all (see
`codee-medusa-backend-conventions`, "One job per step").
