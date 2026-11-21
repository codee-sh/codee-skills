# Function and File Names

What a function, a file and a symbol are called. The rules hold in any TypeScript project; a framework
skill may narrow them for its own units - a workflow step, a route - and then states only the
difference, linking here. The names of variables, callback parameters and props types are in
`SKILL.md`, "Identifier names".

## Contents

- [Files](#files)
- [Verbs](#verbs)
- [Choosing between close verbs](#choosing-between-close-verbs)
- [Verbs not used](#verbs-not-used)
- [Extending the table](#extending-the-table)
- [Other names](#other-names)

## Files

- **A file is named after its export, in kebab-case.** `validate-order-lines.ts` exports
  `validateOrderLines`; a component file exports the PascalCase component of the same name. A reader who
  sees the symbol finds the file, and the other way round.
- **A file holds one subject:** an exported function with the helpers only it uses. A pair that writes
  and reads one format, with the constant they share, is one subject - `formatErrors` and `parseErrors`
  in `errors.ts` - as splitting them would put the format in two places.
- **A file of one constant is named after it:** `LOG_PREFIX` in `log-prefix.ts`. Shared types go to the
  folder's `types.ts` (see `code-layout.md`).
- **No file is named after a kind of code:** `helpers.ts`, `utils.ts`, `string.ts` or `misc.ts`
  collect functions with nothing in common but their argument type, and each grows without a limit.
  Each function goes to a file of its own.

## Verbs

A function's name starts with a verb from this table, its subject after it: `listOpenOrders`, not
`openOrdersList`. The table binds every function - an export, a private helper in the file - and every
file name.

| Verb | Does | Returns | Example |
|---|---|---|---|
| `get-` | takes one thing that must exist, by its key | the thing; throws when it is missing | `getSetting(settings, key)` |
| `list-` | gathers every item of what it was given that fits a rule | a list, empty when none fits | `listActiveUsers(users)` |
| `find-` | searches for one item, or for the problems of a value | the item or `undefined`; the problems, empty when none | `findUserByEmail(users, email)`, `findFormErrors(values)` |
| `describe-` | reads a definition as it is, judging nothing | a plain description of it | `describeSchema(schema)` |
| `validate-` | checks its input against rules | nothing, or what it matched; throws at the first violation, or returns the verdict when the caller records failures instead of stopping | `validateOrderLines(lines)` |
| `prepare-` | shapes its input into what a known consumer reads next; holds no check of its own, and runs the `validate-` helpers of its domain | the shaped value | `prepareInvoice(order, customer)` |
| `build-` | builds a new object from a description | the object | `buildQuery(filters)` |
| `map-` | copies a list or a tree with each item turned by a function the caller gives | the copy | `mapTree(tree, mapNode)` |
| `pick-` | copies a value keeping only the keys or items it is told to keep | the copy | `pickKeys(row, keys)` |
| `add-` | puts an item into a collection, or a rule onto a schema, that its caller holds in memory - or finds the item already there | the entry it added or found, or the value it extended | `addCall(calls, key, open)`, `addFieldRules(schema, fields)` |
| `push-` | puts an item into a list, a map or an object its caller holds in memory | nothing | `pushRow(calls, key, row)`, `pushError(errors, path, message)` |
| `split-` | divides one value into named parts | the parts | `splitAddress(address)` |
| `format-` / `parse-` | turns a value into text / text back into the value; a pair is the reverse of each other | the text / the value | `formatPrice(amount)`, `parsePrice(text)` |
| `normalize-` | brings a value to its canonical form | a value of the same kind | `normalizeEmail(email)` |
| `sanitize-` | makes a value safe to output, dropping what is unsafe | the safe value, or a fallback | `sanitizeHtml(html)` |
| `is-` / `has-` / `matches-` | answers a yes-or-no question about its input | a boolean | `isEmpty(value)`, `hasDiscount(order)`, `matchesPattern(name, pattern)` |
| `define-` | types a config or a registration where it is written | its input, unchanged | `defineConfig(config)` |

## Choosing between close verbs

- **`get-` or `find-`:** `get-` when the thing must exist and its absence is an error; `find-` when
  coming back empty is a normal answer.
- **`list-` or `find-`:** `list-` returns every item that fits; `find-` the first one, or the problems.
- **`validate-` or `prepare-`:** `validate-` judges and changes nothing; `prepare-` shapes and judges
  nothing itself. A function that does both is a `prepare-` that calls a `validate-`.
- **`prepare-` or `build-`:** `prepare-` readies input for a known next consumer - the registry a server
  reads, the rows a write makes; `build-` produces an object that stands on its own - a schema, a
  query, a message.
- **`build-` or `map-`:** `map-` keeps the shape of its input and turns each item; `build-` makes a
  shape of its own.
- **`pick-` or `map-`:** `pick-` keeps items as they are and drops the rest; `map-` turns each one.
- **`add-` or `push-`:** both extend what the caller holds; `add-` returns something - the entry, or
  the extended value - and `push-` returns nothing.
- **`add-` / `push-` or `build-`:** `add-` and `push-` extend what their caller already holds - a list
  of calls being gathered, a schema being refined; `build-` starts from nothing. Both touch memory
  only: a function that writes to a database or a file is no plain function.
- **`get-` never names a computation:** `formatFullName(user)`, not `getFullName(user)`; `get-` takes,
  it does not work anything out.

## Verbs not used

Each is a synonym of a verb above, and where both are in play they drift until they name the same job
under different words.

| Instead of | Use |
|---|---|
| `check-`, `verify-`, `assert-`, `ensure-` | `validate-` |
| `resolve-` | `prepare-`, or `validate-` when it checks and returns what it matched |
| `to-`, `convert-` | `build-`, `format-` or `normalize-`, by what it returns |
| `place-` | `map-` |
| `load-`, `retrieve-`, `collect-`, `gather-` | `get-` or `list-` |
| `select-` | `pick-`, or `add-` when it fills a selection its caller holds |
| `read-` | `describe-`, or `parse-` when it reads text |
| `walk-`, `visit-`, `traverse-` | the verb of what the walk does: `validate-`, `list-`, `map-` |
| `fetch-` | a plain function does no I/O (see `code-layout.md`); the framework's unit that reads names it |
| `create-`, `update-`, `delete-`, `save-` | a plain function writes nothing; `build-` when it builds a new object |

## Extending the table

A verb outside the table is not used on its own judgement, even when it reads better. Propose it to the
user with what it does, what it returns and an example, and ask; until it is accepted, take the nearest
verb of the table. An accepted verb is added to this table, in the skills repository, so every project
reads it - a project never keeps a list of its own.

## Other names

- **A name does not repeat its package or its folder.** Inside a `billing` package, `formatInvoice`,
  not `formatBillingInvoice`; the import path already says it.
- **Constants** are `SCREAMING_SNAKE_CASE`; **types, classes and components** `PascalCase`.
