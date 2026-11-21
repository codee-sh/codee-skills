# File Structure

Where a file goes in `src/admin`, and what it is called. The layout is the same in a Medusa
application and in a plugin: Medusa reads `routes/`, `widgets/` and `i18n/` from the `src/admin` of
the application and of every plugin alike, and everything else is the project's own convention.

A project's `AGENTS.md` lists its own shared components; it does not restate this layout.

## Contents

- [The tree](#the-tree)
- [Routes](#routes)
- [Feature folders](#feature-folders)
- [Shared components](#shared-components)
- [Data hooks and the SDK](#data-hooks-and-the-sdk)
- [Translations](#translations)
- [In a plugin](#in-a-plugin)

## The tree

```
src/admin/
├── routes/                              pages; Medusa builds the URLs from the folders
│   └── brands/
│       ├── page.tsx                     /app/brands
│       ├── @create/page.tsx             route modal over the list
│       └── [id]/
│           ├── page.tsx                 /app/brands/:id
│           └── @edit/page.tsx           route drawer over the detail page
├── widgets/brand-products.tsx           one widget per file
├── brands/                              one feature folder per resource, named like its route
│   ├── brand-list-table/
│   │   ├── brand-list-table.tsx
│   │   ├── columns.tsx
│   │   ├── filters.ts
│   │   └── index.ts
│   ├── brand-general-section/           a section of the detail page
│   ├── brand-create-form/               config.ts, brand-create-form.tsx, index.ts
│   ├── brand-edit-form/
│   └── common/                          shared inside this feature only
├── components/                          shared by two or more features
│   ├── common/
│   ├── inputs/
│   └── manager-fields/
├── hooks/
│   ├── api/brands/brands.ts             query keys and hooks of one resource
│   └── use-reset-page-on-search.ts      a hook that fetches nothing
├── lib/
│   ├── client.ts                        the JS SDK client, see SKILL.md
│   └── query-key-factory.ts             see "Query Keys" in data-loading.md
├── utils/format-date.ts                 pure helpers
└── i18n/
    ├── index.ts
    └── json/en.json
```

Folders and files are kebab-case. A component file exports the PascalCase component of the same name:
`brand-list-table.tsx` exports `BrandListTable`, and its folder's `index.ts` re-exports it.

## Routes

- **A page composes, it does not implement.** `page.tsx` renders the components of its feature folder
  and an `<Outlet />` for its route modals; the table, the sections and the forms live in the feature
  folder.
- **A route modal page only mounts its container.** `@create/page.tsx` renders `RouteFocusModal` around
  the form, `@edit/page.tsx` renders `RouteDrawer` - see `forms.md`.
- **The route's label is plain text.** `defineRouteConfig` runs outside React, so it cannot call
  `useTranslation`; take the label from the translation file: `label: en.brands.label`.

## Feature folders

One folder per resource, named like its route (`routes/brands` - `brands/`). Inside it, one folder per
component, named `<item>-<role>`, where `<item>` is the resource in the singular:

| Role | Folder | Files |
|---|---|---|
| List page table | `<item>-list-table/` | `<item>-list-table.tsx`, `columns.tsx`, `filters.ts` when it filters, `index.ts` |
| Detail page section | `<item>-<name>-section/` | `<item>-<name>-section.tsx`, `index.ts` |
| Form | `<item>-<action>-form/` | `config.ts`, `<item>-<action>-form.tsx`, `index.ts` - see "File structure" in `forms.md` |
| Picker, modal content | `<item>-<name>-picker/` | as a component |

Code used by two components of one feature goes to the feature's `common/`. Code used by two features
moves to `components/` - not before the second one needs it.

## Shared components

`components/` holds what two or more features use: `common/` for sections and cells, `inputs/` for form
inputs, and named folders for larger pieces such as `manager-fields/`. Check the Components Router in
`components.md` before adding one: what `@medusajs/dashboard` or `@medusajs/ui` exports wins over a
local copy.

## Data hooks and the SDK

- **One file per resource:** `hooks/api/<resource>/<resource>.ts` holds the resource's query keys,
  made with `queryKeysFactory`, and its `use<Resource>` / `use<Resources>` / `useCreate<Resource>`
  hooks. A component never calls `sdk.client.fetch` itself.
- **Every request goes through `lib/client.ts`.**
- A hook that fetches nothing sits flat in `hooks/`.

## Translations

`i18n/index.ts` exports the translations by language, from `i18n/json/<lang>.json`:

```ts
import en from "./json/en.json"

export default {
  en: {
    translation: en,
  },
}
```

Medusa merges the `i18n/index` of the application and of every plugin into one `translation` namespace
(`@medusajs/admin-vite-plugin` 2.21.2, `dist/index.js`, `generateI18n`), so two sources that use the
same key overwrite each other. The application keys by feature (`brands.title`); a plugin puts all of
its keys under one key of its own (`cms.collections.title`), so nothing it ships can collide with the
application or another plugin.

## In a plugin

- **Import only types from the backend code.** The Admin is a browser bundle; `import type` from
  `src/lib` or `src/workflows` is erased, a value import pulls Node code into it. The one exception is
  a pure function the server and the Admin both run, such as a validation schema the form shares with
  the save: it sits in a file that imports nothing reaching Node - see `codee-medusa-backend-conventions`
  `references/file-layout.md`, "When a helper leaves its unit".
- **Keep the Admin's own `src/admin/tsconfig.json`**, which the plugin's backend typecheck excludes; check
  it with `tsc --noEmit -p src/admin/tsconfig.json`.
- **Declare no dependency the dashboard already brings** with npm or yarn - `@tanstack/react-query`,
  `react-router-dom`, `react-hook-form` - see "pnpm Users ONLY" in `SKILL.md`.
- Under `medusa plugin:develop`, the linked application serves the plugin's Admin straight from its
  `src/admin`, so a change shows without a build.
