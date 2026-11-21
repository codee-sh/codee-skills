# Code Layout

Where plain code goes: the folders, what each holds, and when a helper leaves the code that uses it.
The rules hold in any TypeScript project. A framework skill names the folder of each role and adds the
cases its framework brings; it does not restate these rules.

## Contents

- [Folders by domain](#folders-by-domain)
- [Folder roles](#folder-roles)
- [The narrowest owner](#the-narrowest-owner)
- [When a helper leaves its unit](#when-a-helper-leaves-its-unit)
- [Plain functions are pure](#plain-functions-are-pure)
- [Code that predates these rules](#code-that-predates-these-rules)

## Folders by domain

- **Group by what the code is about, never by its kind.** `orders/`, `pricing/`, `media/` - not
  `checks/`, `builders/`, `helpers/` or a top-level `types/`. A reader looking for how an order is
  priced opens one folder instead of guessing which kind of work answers the question.
- **A domain folder's `types.ts` holds the types other files import.** A type only one file uses stays
  in that file. A function file declares no type another file imports, so a reader of the types never
  pulls in the functions with them.
- **A subfolder groups a part of the domain the rest reads as a unit** - a family of implementations,
  one provider per file in `providers/` - never a kind of file.
- **No two folders import each other.** A folder reads only the folders it builds on. When two need
  each other, the part both need moves to the lower one, or the caller composes them: it calls the
  first and hands the result to the second.
- **A file holds one subject,** named after its export (`function-and-file-names.md`, "Files").

## Folder roles

Every folder of plain code plays one of three roles. The framework skill names the folder of each; the
defaults below apply only where there is none.

| Role | Holds | Default folder |
|---|---|---|
| **Helper** | a pure function of one domain or feature | `utils/`, beside its owner |
| **Technical** | code bound to a technology and to no domain: an SDK client, an adapter, a wrapper of a library | `lib/<technology>/` |
| **Shared** | pure code that also runs outside the app or package - a storefront, another service | `shared/` |

- **No role is a dumping ground.** A business rule is never technical code because two modules read it;
  it stays in its domain.
- **Shared code imports nothing of the framework or of the app's other folders;** they import from it.
  Hold the boundary with a lint rule where the project can.

## The narrowest owner

A helper sits with the narrowest code that uses it, and moves up only when a consumer outside that
owner appears:

1. one feature or one unit - its own file, or the feature's `utils/`;
2. several features of one domain - the domain's helper folder;
3. several domains - the app's helper folder, by the domain the helper is about;
4. code outside the app or package - the shared folder.

A rule belongs to the domain that owns it, even when another domain reads it; the reader imports it
from there.

## When a helper leaves its unit

A unit is the function, component, route or framework step whose body holds the code.

- **By default the logic stays in its unit,** with private helpers in the same file.
- **It leaves for a second consumer.** Before extracting, check that something else calls it:
  `grep -rl '\bmyFunction\b' src | grep -v __tests__` lists more than the file it came from.
- **Exceptions, which move it with one consumer:**
  - code the framework gives no test where it sits - the framework skill names these cases;
  - code another runtime imports, such as a browser bundle reading a rule the server also runs: it goes
    to a file that imports nothing of the server;
  - a rule of another domain than the unit's: it goes to that domain.
- **Testability alone is never a reason.** A unit is tested where it is, through the test harness its
  framework provides; production code stays shaped by its real use.

## Plain functions are pure

A helper and a shared function do no I/O and hold no state: they reach no container, database, network
or file, and read no global. They take what their caller read and return what it writes. Reading and
writing belong to the framework's units - a workflow step, a route handler, a loader - and to technical
code, the one role that talks to the outside.

## Code that predates these rules

Code written before these rules will break them in places. Leave it unless it is being fixed
deliberately, and record the gap in the project's own notes or specs, not here: a shared skill states
the rule, and the backlog belongs to the project that carries it.
