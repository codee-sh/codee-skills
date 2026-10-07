# Forms and Modal Patterns

This file replaces Medusa's `references/forms.md`, which builds forms from `useState` with
hand-written validation. Every admin form here uses `react-hook-form`, Zod v4 and the
dashboard's exported modals.

## Contents
- [Prerequisites](#prerequisites)
- [Choose the container](#choose-the-container)
- [Route modal forms](#route-modal-forms)
- [In-page modals for widgets](#in-page-modals-for-widgets)
- [Form state and validation](#form-state-and-validation)
- [Fields](#fields)
- [File structure](#file-structure)
- [Behavior patterns](#behavior-patterns)

## Prerequisites

- **`react-hook-form`, `@hookform/resolvers` and `zod` at the dashboard's exact versions.** The
  dashboard's `Form` and route modal forms render their own `react-hook-form` provider and
  `Controller`; a project on a different copy gets two contexts that do not meet. With pnpm,
  declare all three - see "pnpm Users ONLY" in `SKILL.md`.
- **`ManagerFields`** at `src/admin/components/manager-fields/`. It is project code, not part of
  Medusa, and each project keeps its own copy. If a project does not have it, ask before writing a
  replacement.

## Choose the container

| Situation | Container | Import from |
|---|---|---|
| Create an entity from a page | `RouteFocusModal` + `RouteFocusModal.Form` | `@medusajs/dashboard/components` |
| Edit an entity from a page | `RouteDrawer` + `RouteDrawer.Form` | `@medusajs/dashboard/components` |
| Pick or add something on top of an open route modal | `StackedFocusModal` / `StackedDrawer` | `@medusajs/dashboard/components` |
| Form inside a widget on a core page (no route of its own) | `FocusModal` / `Drawer` with `open` state | `@medusajs/ui` |

**Rule of thumb:** FocusModal for creating (full screen, room for complex forms), Drawer for
editing (side panel, the page stays visible).

## Route modal forms

A route modal is a nested route rendered over its parent page. Closing it navigates back, and it
blocks navigation while the form has unsaved changes, with a translated prompt.

The page only mounts the container:

```tsx
// src/admin/routes/brands/@create/page.tsx
import { RouteFocusModal } from "@medusajs/dashboard/components"
import { BrandCreateForm } from "../../../brands/brand-create-form"

const BrandCreatePage = () => (
  <RouteFocusModal>
    <BrandCreateForm />
  </RouteFocusModal>
)

export default BrandCreatePage
```

The form wraps itself in `RouteFocusModal.Form` and closes through `handleSuccess`:

```tsx
// src/admin/brands/brand-create-form/brand-create-form.tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { RouteFocusModal, useRouteModal } from "@medusajs/dashboard/components"
import { Button, Heading, Text, toast } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ManagerFields } from "../../components/manager-fields"
import { useCreateBrand } from "../../hooks/api/brands/brands"
import { brandDefaults, brandFields, brandSchema, type BrandFormValues } from "./config"

export const BrandCreateForm = () => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()
  const { mutateAsync, isPending } = useCreateBrand()

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { brand: brandDefaults },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    await mutateAsync(values.brand, {
      onSuccess: ({ brand }) => {
        toast.success(t("brands.create.success"))
        handleSuccess(`/brands/${brand.id}`)
      },
      onError: (error) => {
        toast.error(t("brands.create.failed"), { description: error.message })
      },
    })
  })

  return (
    <RouteFocusModal.Form form={form}>
      <form onSubmit={onSubmit} className="flex h-full flex-col overflow-hidden">
        <RouteFocusModal.Header />
        <RouteFocusModal.Body className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-y-6 px-2 py-16">
            <div className="flex flex-col gap-y-1">
              <RouteFocusModal.Title asChild>
                <Heading>{t("brands.create.header")}</Heading>
              </RouteFocusModal.Title>
              <RouteFocusModal.Description asChild>
                <Text size="small" className="text-ui-fg-subtle">
                  {t("brands.create.hint")}
                </Text>
              </RouteFocusModal.Description>
            </div>
            <ManagerFields fields={brandFields(t)} name="brand" form={form} />
          </div>
        </RouteFocusModal.Body>
        <RouteFocusModal.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteFocusModal.Close asChild>
              <Button size="small" variant="secondary" disabled={isPending}>
                {t("actions.cancel")}
              </Button>
            </RouteFocusModal.Close>
            <Button size="small" type="submit" isLoading={isPending}>
              {t("actions.save")}
            </Button>
          </div>
        </RouteFocusModal.Footer>
      </form>
    </RouteFocusModal.Form>
  )
}
```

An edit form is the same with `RouteDrawer`, `RouteDrawer.Form`, `RouteDrawer.Body` and
`RouteDrawer.Footer`; the edit page usually renders `RouteDrawer.Header` with the
`RouteDrawer.Title`.

**Pitfalls**

- **Every modal needs a Title.** The exported modals do not render a hidden one, and Radix logs an
  accessibility error without it. Use the visible heading (`Title asChild`) or a visually hidden
  one: `<RouteFocusModal.Title className="sr-only">...</RouteFocusModal.Title>`. Add a
  `Description` the same way when a hint is shown.
- **`RouteModalForm` is not exported.** Use `RouteFocusModal.Form` or `RouteDrawer.Form` - they are
  the same component, so one form can render in both a create modal and an edit drawer.
- **`useRouteModal` and `useStackedModal` only work inside the exported containers.** Mixing a local
  copy of a hook with an exported modal throws "must be used within a RouteModalProvider".
- **Stacked modals** take an `id` unique within their parent, render
  `StackedFocusModal.Content`, and need their own `Title`.

## In-page modals for widgets

A widget lives on a core page and has no route to nest under, so it opens `FocusModal` or `Drawer`
from `@medusajs/ui` with local `open` state. The form inside is the same: `useForm` with
`zodResolver`, wrapped in `Form` from `@medusajs/dashboard/components`, fields from
`ManagerFields`. On success, reset the form and close:

```tsx
onSuccess: () => {
  form.reset(defaults)
  setOpen(false)
}
```

Keep the widget's display query separate from the modal's query - see `data-loading.md`.

## Form state and validation

| Layer | Tool |
|---|---|
| Form state | `react-hook-form` |
| Schema | `zod` v4 |
| Resolver | `zodResolver` from `@hookform/resolvers/zod`, the version the dashboard uses (5.x) |
| Fields | `ManagerFields`, or `Form.Field` for anything it does not cover |

**`@hookform/resolvers` 3.x does not work with Zod v4.** It throws an uncaught `ZodError` instead of
passing errors to the fields. It reaches a project silently when the package is not declared and
another workspace app hoists 3.x, so declare it at the dashboard's version.

```ts
import { zodResolver } from "@hookform/resolvers/zod"

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { settings: defaults },
})
```

**Default values must match the schema type.** A `z.string()` field defaults to `""`, not `null`;
only `.nullable()` fields take `null`. The API may return `null`, so coerce when resetting:

```ts
// Correct
form.reset({ settings: { email: data.settings.email ?? "" } })

// Wrong - null reaches a non-nullable field
form.reset({ settings: { email: data.settings.email } })
```

Zod v4 patterns:

```ts
z.string().min(1, "validation.required")
z.string().min(1, "validation.required").email("validation.email")
z.string().email("validation.email").nullable().optional()
z.number().min(0, "validation.min").max(100, "validation.max")
z.enum(["option_a", "option_b"], { error: "validation.option" })
```

Validation messages are translation keys, translated where they are shown - see `codee-ui-copy`,
"Translation Keys".

## Fields

### ManagerFields

Renders a list of `FieldConfig` entries under one form path (`name`), each through a
`Controller`:

```tsx
<ManagerFields fields={brandFields(t)} name="brand" form={form} />
```

| `type` | Use for |
|---|---|
| `"text"` | Plain text input |
| `"email"` | Email input |
| `"textarea"` | Multi-line text |
| `"number"` | Numeric input; `min`, `max`, `step` |
| `"select"` | Dropdown; `options: [{ value, name }]` or groups `[{ groupName, options }]` |
| `"checkbox"` | Boolean checkbox |
| `"switch"` | Boolean toggle with `label`, `description`, `tooltip` |
| `"chip-input"` | Multi-value tag input |
| `"currency"` | Price input; `currencyCode` |

`required: true` only draws the asterisk. With a resolver set, `react-hook-form` skips the
field-level rules, so Zod alone decides whether the form submits.

`ManagerFields` renders `label`, `placeholder` and `description` as given, so build the field list
with `t` (a function of `t` in `config.ts`) rather than a static array of English strings.

### Form.Field

For a field `ManagerFields` does not cover - a `Combobox`, a `CountrySelect`, a custom input - use
the dashboard's `Form` parts inside the same `*.Form`:

```tsx
import { Combobox, Form } from "@medusajs/dashboard/components"

<Form.Field
  control={form.control}
  name="brand.country_code"
  render={({ field }) => (
    <Form.Item>
      <Form.Label optional>{t("fields.country")}</Form.Label>
      <Form.Control>
        <Combobox {...field} options={countryOptions} />
      </Form.Control>
      <Form.ErrorMessage />
    </Form.Item>
  )}
/>
```

## File structure

Each form lives in `src/admin/{feature}/{form-name}/` with exactly these files:

```
{feature}/
└── {form-name}/
    ├── config.ts        - Zod schema, FormValues type, defaults, field list
    ├── {form-name}.tsx  - the form component
    └── index.ts         - re-export
```

All schema and field definitions go in `config.ts`, never inline in the component:

```ts
import type { TFunction } from "i18next"
import { z } from "zod"
import type { FieldConfig } from "../../components/manager-fields/types"

export const brandSchema = z.object({
  brand: z.object({
    name: z.string().min(1, "validation.required"),
    handle: z.string().min(1, "validation.required"),
  }),
})

export type BrandFormValues = z.infer<typeof brandSchema>

export const brandDefaults: BrandFormValues["brand"] = { name: "", handle: "" }

export const brandFields = (t: TFunction): FieldConfig[] => [
  { key: "name", type: "text", name: "name", label: t("fields.name"), required: true },
  { key: "handle", type: "text", name: "handle", label: t("fields.handle"), required: true },
]
```

## Behavior patterns

- **Data in a section is not edited in place.** Open the edit form from a button in the section
  header, or from an `ActionMenu` (`@medusajs/dashboard/components`) when the section has more than
  one action - never a hand-built `DropdownMenu`.
- **2 to 10 fixed options:** `Select` (or a `"select"` field). Larger sets (products, categories,
  regions): a `Combobox` with `useComboboxData`, or a `DataTable` in a modal - `StackedFocusModal`
  inside a route modal, `FocusModal` in a widget - see `table-selection.md`.
- **Disable actions while a mutation runs** (`disabled={isPending}`) and **show the loading state on
  the submit button** (`isLoading={isPending}`).
- **Errors go to a toast** following "Error Toasts" in `display-patterns.md`; field errors come from
  the schema.
- **Query keys and invalidation** follow "Query Keys" in `data-loading.md`; after a mutation,
  invalidate the display queries, not only the modal's.
