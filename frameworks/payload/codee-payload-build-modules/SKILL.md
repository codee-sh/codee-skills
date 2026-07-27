---
name: codee-payload-build-modules
description: Step-by-step guide for adding a custom admin view or field component to this Payload CMS project. Use when asked to create a new admin panel view, custom tab, or custom field UI.
---

# Payload — creating a custom admin module

Custom admin components (views, tabs, field UIs) live under the owning business module at
`src/modules/{module}/admin/{feature-name}/`. Payload references them via path string +
`exportName`.

---

## Full module structure

```
src/modules/{module}/admin/{feature-name}/
├── {feature-name}.tsx          # entry point — server component, guard + render only
├── loader.ts                   # all payload queries + data transforms (when > 1 query)
├── types.ts                    # local types (including the loader return type)
├── constants.ts                # local constants
├── styles.ts                   # inline style objects if needed
├── utils/
│   ├── validate.ts             # field validators
│   ├── format.ts               # label/display helpers
│   └── index.ts                # export * from each file
└── components/
    └── {component-name}/       # every React component gets its own folder
        ├── {component-name}.tsx
        ├── index.ts            # export * from './{component-name}'
        └── hooks/              # (optional) when component has ≥ 2 mutations or complex state
            └── use-{feature}-mutations.ts
```

---

## Steps

### 1. Create the entry point

A custom view entry point is a **server component**. It does two things only: guard (early
return if no doc yet) and render. All data fetching goes to `loader.ts`. Mark both the view
entry and its loader with `import 'server-only'`.

A custom field that uses Payload form hooks is a Client Component and starts with
`'use client'`. Keep it in the same `src/modules/{module}/admin/{feature-name}/` convention,
but do not import its client entry from a server-only barrel.

```tsx
// src/modules/training/admin/workout-structure/workout-structure.tsx
import 'server-only'

import React from 'react'
import { loadWorkoutStructure } from './loader'
import { WorkoutStructureEditor } from './components/editor'

export async function WorkoutStructureView({
  initPageResult,
  payload,
}: {
  initPageResult?: { docID?: number | string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any
}) {
  const docId = initPageResult?.docID

  if (!docId || docId === 'create' || !payload) {
    return (
      <div style={{ padding: '24px', color: 'var(--theme-elevation-500)', fontSize: 14 }}>
        Save the workout first to manage its structure.
      </div>
    )
  }

  const data = await loadWorkoutStructure(payload, docId)
  return <WorkoutStructureEditor {...data} />
}
```

### 2. Register in the collection config

Reference via path string. The path must point to the exact file, not an `index.ts`.

```ts
// src/collections/workouts/index.ts
admin: {
  components: {
    views: {
      edit: {
        structure: {
          Component: {
            path: '@/modules/training/admin/workout-structure/workout-structure',
            exportName: 'WorkoutStructureView',
          },
          path: '/structure',
          tab: { label: 'Struktura', href: '/structure' },
        },
      },
    },
  },
},
```

After registering, run:
```bash
yarn generate:importmap
```

### 3. Create `loader.ts` (when > 1 query or data transform needed)

A plain async function — not a hook. Takes `payload` and the document ID, returns a typed result matching the main client component's props.

```ts
// loader.ts
import 'server-only'

import type { ExerciseRow, Group, Section, WorkoutStructureData } from './types'

export async function loadWorkoutStructure(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  docId: number | string,
): Promise<WorkoutStructureData> {
  const workout = await payload.findByID({ collection: 'workouts', id: docId, depth: 0 })

  const groupsResult = await payload.find({
    collection: 'workout-groups',
    where: { workout: { equals: docId } },
    sort: 'order',
    limit: 500,
    depth: 0,
  })

  // ... remaining queries + transforms

  return { sections, initialGroups, initialExerciseRows, groupIdsWithLogs, exerciseRowIdsWithLogs }
}
```

**Rule:** extract `loader.ts` when the entry point has > 1 `payload` query OR maps/transforms raw results. A single `payload.count()` with no transform can stay inline in the entry point.

### 4. Add types

Always add a `WorkoutStructureData`-style type that matches the main client component's props. This is what `loader.ts` returns and the entry point spreads.

```ts
// types.ts
export type WorkoutStructureData = {
  sections: Section[]
  initialGroups: Group[]
  initialExerciseRows: ExerciseRow[]
  groupIdsWithLogs: number[]
  exerciseRowIdsWithLogs: number[]
}
```

### 5. Create components — one folder per component

Every React component gets its own kebab-case folder with an `index.ts` barrel. No flat `.tsx` files directly in `components/`.

```
components/
├── editor/
│   ├── editor.tsx
│   ├── index.ts            # export * from './editor'
│   └── hooks/
│       └── use-workout-mutations.ts
├── exercise-form/
│   ├── exercise-form.tsx
│   └── index.ts
└── group-form/
    ├── group-form.tsx
    └── index.ts
```

The main client component (`editor.tsx`) is `'use client'` — it receives data from the server entry point and manages UI state.

Helper files used by only one component (e.g. a popover, a schema, a sub-item) go **flat inside that component's folder** — not in a sub-folder.

### 6. Extract mutations to a hook (when ≥ 2 mutations share loading state)

```ts
// components/editor/hooks/use-workout-mutations.ts
'use client'

import { useState } from 'react'
import { toast } from '@payloadcms/ui'
import { sdk } from '@/lib/sdk'
import type { ExerciseRow, Group } from '../../../types'

export function useWorkoutMutations(
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
  setExerciseRows: React.Dispatch<React.SetStateAction<ExerciseRow[]>>,
) {
  const [deletingGroup, setDeletingGroup] = useState<number | null>(null)
  const [deletingExercise, setDeletingExercise] = useState<number | null>(null)

  const deleteGroup = async (groupId: number) => {
    setDeletingGroup(groupId)
    try {
      await sdk.delete({ collection: 'workout-groups', id: groupId })
      setGroups((previousGroups) =>
        previousGroups.filter((group) => group.id !== groupId),
      )
      toast.success('Deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed')
    } finally {
      setDeletingGroup(null)
    }
  }

  // ... deleteExercise

  return { deleteGroup, deleteExercise, deletingGroup, deletingExercise }
}
```

Hook placement: `components/{main-component}/hooks/use-{feature}-mutations.ts`. Only create `hooks/` subfolder when there are ≥ 2 mutations or the loading-state logic repeats.

---

## Admin utilities

Place a helper according to its narrowest real ownership:

- One admin feature: `src/modules/{module}/admin/{feature}/utils/`.
- Multiple admin features in one business module: `src/modules/{module}/admin/utils/`.
- Multiple business modules, technical and domain-agnostic: `src/lib/{technology}/`.

For example, a reusable function that builds Payload field configuration may live in
`src/lib/payload/fields.ts`. A shared business rule must remain in its owning module even
when another module consumes it. Do not use `src/lib/` as a generic dumping ground.

---

## Key rules

| Rule | Detail |
|---|---|
| No `index.ts` at admin feature root | Payload uses an exact path string; a root barrel is dead code |
| Server view entry = guard + render only | Never put `payload.find()` calls in the entry file |
| `loader.ts` = server-only async function | Add `import 'server-only'`; it is not a hook |
| Client field entry | Add `'use client'` when it uses Payload form hooks or browser APIs |
| One folder per component | Mirror Medusa dashboard pattern — no flat `.tsx` in `components/` |
| Hooks subfolder inside component | `components/{name}/hooks/` — not a module-level `hooks/` |
| `utils/` at module level | For validators, formatters, label helpers |
| Feature-local utilities | Keep validators, formatters, and field helpers in the owning admin feature |
| `generate:importmap` after registration | Run `yarn generate:importmap` whenever a component path changes |

---

## Naming conventions

| What | Convention | Example |
|---|---|---|
| Business module folder | `kebab-case` | `training/` |
| Admin feature folder | `kebab-case` | `workout-structure/` |
| Entry file | `{module-name}.tsx` | `workout-structure.tsx` |
| Exported function | `PascalCase` + `View` / `Field` suffix | `WorkoutStructureView` |
| Component folders | `kebab-case` | `exercise-form/` |
| Hook files | `use-{feature}-{type}.ts` | `use-workout-mutations.ts` |
| Loader function | `load{FeatureName}` camelCase | `loadWorkoutStructure` |
| Data type (loader return) | `{FeatureName}Data` | `WorkoutStructureData` |
