---
name: admin-forms-with-medusa
description: Conventions for building admin UI forms in this Medusa project — ManagerFields, Zod v4, zodV4Resolver, file structure. Load alongside building-admin-dashboard-customizations whenever creating or editing an admin form.
---

# Admin Forms

This project has a specific pattern for building forms in the Medusa Admin UI. Always follow it.

---

## Stack

| Layer | Tool |
|-------|------|
| Form state | `react-hook-form` |
| Validation schema | `zod` v4 |
| Resolver (RHF ↔ Zod) | `zodV4Resolver` (custom — see below) |
| Field rendering | `ManagerFields` component |

**⚠️ Do NOT use `@hookform/resolvers/zod`** — the project uses Zod v4 which is incompatible with it. It throws uncaught `ZodError` in the console instead of passing errors to form fields.

---

## zodV4Resolver

Custom resolver located at `src/admin/lib/zod-v4-resolver.ts`. Always import from there.

```ts
import { zodV4Resolver } from "../../lib/zod-v4-resolver"
```

Usage in `useForm`:

```ts
const form = useForm<FormValues>({
  resolver: zodV4Resolver(schema),
  defaultValues: { ... },
})
```

---

## File structure

Forms live in `src/admin/{feature}/{component-name}/` and always contain exactly these files:

```
{feature}/
└── {component-name}/
    ├── config.ts            — Zod schema + FormValues type + FieldConfig[]
    ├── {component-name}.tsx — form component
    └── index.ts             — re-export
```

Example: `src/admin/sap-settings/sap-settings-form/`

### config.ts

All schema and field definitions go here — never inline in the component.

```ts
import { z } from "zod"
import { FieldConfig } from "../../components/manager-fields/types/types"

export const schema = z.object({
  settings: z.object({
    some_email: z
      .string()
      .min(1, "Field is required")
      .email("Must be a valid email address"),
    some_text: z
      .string()
      .min(1, "Field is required"),
  }),
})

export type FormValues = z.infer<typeof schema>

export const fields: FieldConfig[] = [
  {
    key: "some_email",
    type: "email",
    name: "some_email",
    label: "Email",
    placeholder: "example@domain.com",
    required: true,   // shows asterisk * in label — visual only, Zod owns validation
  },
  {
    key: "some_text",
    type: "text",
    name: "some_text",
    label: "Name",
    placeholder: "Enter name",
    required: true,
  },
]
```

### {component-name}.tsx

```tsx
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useEffect } from "react"
import { zodV4Resolver } from "../../lib/zod-v4-resolver"
import { ManagerFields } from "../../components/manager-fields"
import { useMyData, useUpdateMyData } from "../../hooks/api/my-hook"
import { schema, fields, FormValues } from "./config"

export const MyForm = () => {
  const { data, isLoading } = useMyData()
  const { mutateAsync, isPending } = useUpdateMyData()

  const form = useForm<FormValues>({
    resolver: zodV4Resolver(schema),
    defaultValues: {
      settings: {
        some_email: "",
      },
    },
  })

  // Populate form when data loads
  useEffect(() => {
    if (data?.settings) {
      form.reset({
        settings: {
          some_email: data.settings.some_email ?? "",
        },
      })
    }
  }, [data])

  const onSubmit = form.handleSubmit(async (values) => {
    await mutateAsync(values.settings, {
      onSuccess: () => toast.success("Saved"),
      onError: (error) => toast.error(error.message || "Failed to save"),
    })
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Section Title</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Section description
          </Text>
        </div>
      </div>
      <div className="px-6 py-4">
        {isLoading ? (
          <div className="h-8 w-full animate-pulse rounded bg-ui-bg-component" />
        ) : (
          <ManagerFields fields={fields} name="settings" form={form} />
        )}
      </div>
      <div className="flex items-center justify-end gap-2 px-6 py-4">
        <Button size="small" isLoading={isPending} onClick={onSubmit}>
          Save
        </Button>
      </div>
    </Container>
  )
}
```

### index.ts

```ts
export { MyForm } from "./my-form"
```

---

## ManagerFields — field types

| `type` | Use for |
|--------|---------|
| `"text"` | Plain text input |
| `"email"` | Email input |
| `"textarea"` | Multi-line text |
| `"number"` | Numeric input |
| `"select"` | Dropdown — pass `options: [{ value, name }]` |
| `"checkbox"` | Boolean checkbox |
| `"switch"` | Boolean toggle with label + description |
| `"chip-input"` | Multi-value tag input |
| `"currency"` | Price input — pass `currencyCode` |

### required field

`required: true` in `FieldConfig` only shows a red `*` asterisk in the label (visual indicator).  
**Actual validation is always done by Zod** — `required` in FieldConfig does NOT affect whether the form submits.

---

## Zod v4 patterns

```ts
// Required string
z.string().min(1, "Field is required")

// Required email
z.string().min(1, "Required").email("Must be a valid email address")

// Optional nullable string (field not required)
z.string().email("Must be a valid email address").nullable().optional()

// Number with bounds
z.number().min(0, "Must be positive").max(100, "Max 100")

// Enum
z.enum(["option_a", "option_b"], { error: "Select a valid option" })
```

**Default values must match the Zod schema type:**
- If schema uses `z.string()` (not nullable) → defaultValue must be `""` not `null`
- If schema uses `.nullable()` → defaultValue can be `null`
- API may return `null` — always coerce with `?? ""` when resetting form

```ts
// ✅ Correct
form.reset({ settings: { email: data.settings.email ?? "" } })

// ❌ Wrong — null passed to non-nullable field
form.reset({ settings: { email: data.settings.email } })
```

---

## Data loading

Use `useQuery` + `useMutation` hooks from `@tanstack/react-query` via SDK:

```ts
// src/admin/hooks/api/my-hook.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/client"

const MY_KEY = ["my-resource"]

export const useMyData = () =>
  useQuery({
    queryKey: MY_KEY,
    queryFn: () => sdk.client.fetch("/admin/my-resource"),
  })

export const useUpdateMyData = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      sdk.client.fetch("/admin/my-resource", { method: "POST", body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MY_KEY }),
  })
}
```

Hooks live in `src/admin/hooks/api/{resource}.ts`.
