# Components Router

What to use for a given need in an admin customization, where to import it from, how to use it,
and what goes wrong. Check this table before writing a component, a hook or a helper: most of
what an admin page needs already exists, and a local copy drifts from the dashboard it imitates.

## Order of choice

1. **`@medusajs/dashboard/components`, `/hooks`, `/lib`** - the dashboard's own building blocks,
   exported since Medusa 2.21. Same look and behavior as the core pages, and the data hooks share
   the dashboard's query cache.
2. **`@medusajs/ui` and `@medusajs/icons`** - the design-system primitives.
3. **The project's own components** - listed in the project's `AGENTS.md`.
4. **A new component** - only when none of the above fits.

The dashboard subpaths do not exist before Medusa 2.21. On an older version, name the upgrade as
an option rather than copying the component.

The exported components are built against the dashboard's own `react-hook-form`,
`@tanstack/react-query` and `react-router-dom`. With pnpm, the project must declare the same
versions - see "pnpm Users ONLY" in `SKILL.md` - or the admin loads two copies and their contexts
do not meet.

Paths below: `dashboard/components` stands for `@medusajs/dashboard/components`, and so on.

## Layout and sections

| Need | Use | Import from | How / when | Pitfall |
|---|---|---|---|---|
| Custom page that exposes widget zones | `LayoutComposer` | `dashboard/components` | `widgetsZonePrefix`, `preferredLayoutId` (`"core:single-column"`, `"core:two-column"`), `sections`, `data` | Users arrange sections in the Editor view; `.before`/`.after` do not control placement (see `SKILL.md`) |
| Section frame | `Container` | `@medusajs/ui` | `className="divide-y p-0"` with `px-6 py-4` rows | - |
| Label and value row | `SectionRow` | `dashboard/components` | `title`, `value`, `actions` | `title` is a required string |
| Raw JSON section | `JsonViewSection` | `dashboard/components` | `data` | Ignores `title`: the heading is always the dashboard's "JSON" |
| Empty list or no search results | `NoRecords`, `NoResults` | `dashboard/components` | `title`, `message`, `action: { to, label }`, `icon` | - |
| Short readable id | `DisplayId` | `dashboard/components` | `id` | - |
| Avatar with an icon | `IconAvatar` | `dashboard/components` | `size`, `variant` | `Avatar` from `@medusajs/ui` takes no icon |
| Settings-style link list | `SidebarLink`, `Listicle` | `dashboard/components` | `to`, `labelKey`, `descriptionKey`, `icon` | Despite the names, `labelKey`/`descriptionKey` are rendered as-is: pass translated text |

## Tables

| Need | Use | Import from | How / when | Pitfall |
|---|---|---|---|---|
| List page table | `DataTable` | `dashboard/components` | `data`, `columns`, `getRowId`, `rowCount`, `pageSize`, `prefix`, `filters`, `heading`, `actions`, `emptyState`, `isLoading`, `rowHref` | Not the `@medusajs/ui` `DataTable`: pagination, search and filters live in the URL under `prefix` |
| Table inside a modal (selection) | `DataTable` + `useDataTable` | `@medusajs/ui` | Local state; see `table-selection.md` | Pass the search state, or "search not enabled" is thrown |
| Columns for either table | `createDataTableColumnHelper` | `@medusajs/ui` | One helper per row type | - |
| Product, variant, status, sales channel columns | `ProductCell`, `VariantCell`, `ProductStatusCell`, `SalesChannelsCell` and their `*Header` | `dashboard/components` | Cell takes the entity field; header takes nothing | - |
| Created/updated date columns and filters | `useDataTableDateColumns`, `useDataTableDateFilters` | `dashboard/hooks` | Spread into `columns` / `filters` | - |
| Spreadsheet-style bulk edit | `DataGrid` + `createDataGridHelper` (+ `createDataGridPriceColumns`) | `dashboard/components` | `state` is the form from `useForm` | Needs the dashboard's `react-hook-form` version |
| Table driven by a resource adapter | `ConfigurableDataTable` + `createTableAdapter` | `dashboard/components`, `dashboard/lib` | `adapter`, `heading`, `pageSize` | Check the reference docs before using |

## Modals and forms

Form state, validation and fields are covered in `forms.md`; this table only says which
container to pick.

| Need | Use | Import from | How / when | Pitfall |
|---|---|---|---|---|
| Create form on its own route | `RouteFocusModal` + `RouteFocusModal.Form` | `dashboard/components` | Close with `useRouteModal().handleSuccess(path?)` | Needs a `RouteFocusModal.Title` (visually hidden is fine); `RouteModalForm` is not exported |
| Edit form on its own route | `RouteDrawer` + `RouteDrawer.Form` | `dashboard/components` | Same as above | Same as above |
| Modal on top of a route modal | `StackedFocusModal`, `StackedDrawer` + `useStackedModal` | `dashboard/components` | `id` unique within the parent; only inside `RouteFocusModal` or `RouteDrawer` | Needs a `Title`; `Content` accepts `aria-describedby` |
| Field outside the field manager | `Form.Field`, `Form.Item`, `Form.Label`, `Form.Control`, `Form.ErrorMessage` | `dashboard/components` | Inside `*.Form` | `Form.Label` takes `optional`, `tooltip`, `icon` |
| Submit only with Cmd/Ctrl+Enter | `KeyboundForm` | `dashboard/components` | Replaces `<form>` | - |
| Modal not tied to a route | `FocusModal`, `Drawer` | `@medusajs/ui` | `open` / `onOpenChange` state | Prefer the route versions for create and edit |
| Confirm a destructive action | `usePrompt` or `Prompt` | `@medusajs/ui` | Cancel first, then the action | - |

## Inputs

| Need | Use | Import from | How / when | Pitfall |
|---|---|---|---|---|
| Searchable or async select, single or multi | `Combobox` + `useComboboxData` | `dashboard/components`, `dashboard/hooks` | `options`, `fetchNextPage`, `onCreateOption`, `displayMode` | - |
| Country | `CountrySelect` | `dashboard/components` | Controlled `value` / `onChange` | Lists every country, not a region's |
| Handle (slug) | `HandleInput` | `dashboard/components` | Same props as `Input` | - |
| 2 to 10 fixed options | `Select` | `@medusajs/ui` | - | More options: `Combobox` or a table in a modal |
| Money amount | `CurrencyInput` | `@medusajs/ui` | `code`, `symbol` | - |
| Debounced search box state | `useDebouncedSearch` | `dashboard/hooks` | Returns `searchValue`, `onSearchValueChange`, `query` | - |

## Menus, actions, feedback

| Need | Use | Import from | How / when | Pitfall |
|---|---|---|---|---|
| "..." menu on a row or section | `ActionMenu` | `dashboard/components` | `groups: [{ actions: [{ icon, label, onClick \| to, disabled, disabledTooltip }] }]` | Do not rebuild it from `DropdownMenu` |
| Tooltip only under a condition | `ConditionalTooltip` | `dashboard/components` | `showTooltip`, `content` | - |
| Toast | `toast` | `@medusajs/ui` | Policy: "Error Toasts" in `display-patterns.md` | - |
| Loading indicator | `Spinner` | `@medusajs/icons` | `className="animate-spin"` | Not in `@medusajs/ui` |

## Display

| Need | Use | Import from | How / when | Pitfall |
|---|---|---|---|---|
| Product or variant thumbnail | `Thumbnail` | `dashboard/components` | `src`, `alt`, `size` (`"small"`, `"base"`) | Not in `@medusajs/ui` |
| Text and headings | `Text`, `Heading` | `@medusajs/ui` | See `typography.md` | - |
| Status or label | `StatusBadge`, `Badge` | `@medusajs/ui` | - | - |

## Data hooks

| Need | Use | Import from | How / when | Pitfall |
|---|---|---|---|---|
| Core Medusa entity, read | `useProduct(s)`, `useVariants`, `useInfiniteVariants`, `useProductVariants`, `useOrder`, `useOrderPreview`, `useOrderChanges`, `useCustomer(s)`, `useRegion(s)`, `useSalesChannel(s)`, `usePromotions`, `useShippingOption(s)`, `usePricePreferences`, `useStore`, `useUser` | `dashboard/hooks` | Shares the dashboard's cache, so its mutations refresh your view | Returns `{ ...data, ...rest }`; a list hook's first argument is the query |
| Core Medusa entity, write | `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`, `useUpdateProductVariantsBatch`, `useUpdateOrder`, `useRequestOrderEdit`, `useSalesChannelAddProducts`, `useSalesChannelRemoveProducts` | `dashboard/hooks` | Invalidate as the dashboard does | - |
| Invalidate a core entity after a custom mutation | `productsQueryKeys`, `ordersQueryKeys`, `customersQueryKeys`, `regionsQueryKeys`, ... | `dashboard/hooks` | e.g. `ordersQueryKeys.preview(id)` | A hand-written key misses the dashboard's cache |
| Custom resource | Own hook with `queryKeysFactory` | project | See "Query Keys" in `data-loading.md` | - |
| Values from the URL | `useQueryParams(keys, prefix)` | `dashboard/hooks` | Matches a `DataTable` `prefix` | - |
| Date for display | `useDate().getFullDate({ date, includeTime })`, `getRelativeDate(date)` | `dashboard/hooks` | Admin's locale | - |

## Helpers

| Need | Use | Import from | How / when | Pitfall |
|---|---|---|---|---|
| Format money | `getLocaleAmount`, `getStylizedAmount`, `formatCurrency` | `dashboard/lib` | `(amount, currencyCode)` | Follows the browser locale, so the output differs from a fixed `Intl` locale |
| Currency symbol and decimals | `getNativeSymbol`, `getCurrencySymbol`, `getDecimalDigits`, `currencies` | `dashboard/lib` | - | - |
| Format or compare an address | `getFormattedAddress`, `getFormattedCountry`, `isSameAddress` | `dashboard/lib` | - | - |
| Shared form schemas | `AddressSchema`, `EmailSchema`, `metadataFormSchema`, `optionalInt`, `optionalFloat` | `dashboard/lib` | Compose into the form's schema | Built with the dashboard's `zod`: keep the project on the same version |
| Validate part of a multi-step form | `partialFormValidation(form, fields, schema)` | `dashboard/lib` | - | - |

## Keeping this table current

On every Medusa upgrade, compare the rows against `node_modules/@medusajs/dashboard/dist/components.d.ts`,
`hooks.d.ts` and `lib.d.ts`: the export lists there are the source of truth. The full reference is
<https://docs.medusajs.com/resources/admin-components>.
