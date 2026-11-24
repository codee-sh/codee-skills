# README

npm shows the README as the package's page, and GitHub as the repository's front page. Its reader is
deciding whether to install the plugin, then installing it. Everything after the first working setup -
guides, option references, recipes - is a `docs/` page the README links to (`docs-folder.md`).

Keep it to roughly 150 lines. A README that grows past that is carrying a guide.

## Sections, in this order

Leave out a section that has nothing to say; never reorder.

1. **Title** - `# Medusa <what it is>`, the name a person would say: `# Medusa CMS`,
   `# Medusa notifications`. Under it, the package name in code, then two or three sentences: what the
   plugin does, for Medusa v2, and what a host gets from it. A pre-1.0 plugin says so here in one line.
2. **Features** - bullets of what is built and released. Nothing planned, nothing behind an unreleased
   flag. One line each, the user's words, not the module's.
3. **Compatibility** - Medusa from `peerDependencies` (`@medusajs/framework`), Node.js from `engines`.
   Copy the values; never state a range the package does not declare.
4. **Installation** - `npm install` and `yarn add` of the package. Peer dependencies the host must add
   itself, and why, in a sentence (Medusa Cloud installs no `devDependencies`, for example).
5. **Basic setup** - the smallest `medusa-config.ts` registration that works, `resolve` and `options`.
   When the plugin owns tables, `npx medusa db:migrate`. When the host must write something before the
   plugin does anything (a config, a model, a subscriber switched on), say so and link the page.
   End with one line sending the reader to the Documentation section.
6. **Upgrading** - only for the latest release that asks something of the host: `## Upgrading from
   <x.y>`, each required change as a bold lead and the code to write. Earlier ones are removed; the
   `CHANGELOG.md` keeps them.
7. **Documentation** - a list of links to every `docs/` page, in reading order, each with its title.
8. **Exports** - every public entry point from `package.json` `exports`, one bullet each, with what a
   host imports from it. An entry point that is not listed here is not public.
9. **License** - the licence's name, matching `package.json` and `LICENSE`.
10. **Author** - `Codee Team - [https://codee.dev](https://codee.dev)`.

## Skeleton

````markdown
# Medusa <what it is>

`@codee-sh/medusa-plugin-<domain>`

<Two or three sentences: what it does in a Medusa v2 project.>

## Features

- <What a host can do with it.>

## Compatibility

- Medusa: `<from peerDependencies>`
- Node.js: `<from engines>`

## Installation

```bash
npm install @codee-sh/medusa-plugin-<domain>
# or
yarn add @codee-sh/medusa-plugin-<domain>
```

## Basic setup

Register the plugin in `medusa-config.ts`:

```typescript
module.exports = defineConfig({
  plugins: [
    {
      resolve: "@codee-sh/medusa-plugin-<domain>",
      options: {},
    },
  ],
})
```

Then continue with the guides under [Documentation](#documentation).

## Documentation

- [Configuration](./docs/configuration.md)

## Exports

- `@codee-sh/medusa-plugin-<domain>` - <what the root exports>
- `@codee-sh/medusa-plugin-<domain>/workflows` - <workflows and their input types>

## License

MIT

## Author

Codee Team - [https://codee.dev](https://codee.dev)
````

## What stays out

- Option references, field-by-field tables, recipes - a `docs/` page.
- Local development, tests, the release process - `docs/development.md`, `docs/tests.md`,
  `CONTRIBUTING.md` and `SDLC.md`.
- Roadmaps and planned features - the specs, or nowhere public.
- The name of any client or project the plugin was built for.
- Badges and screenshots that go stale; one screenshot of the Admin is fine when it is kept current
  under `docs/images/`.
