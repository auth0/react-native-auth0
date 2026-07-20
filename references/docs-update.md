# Docs Update Rules

Treat docs as a first-class deliverable: a PR that adds or changes public API, configuration, or integration patterns is **not complete** until the relevant docs are updated in the same PR.

## Tracked docs

| File / location   | What it covers                                       | Exists |
| ----------------- | ---------------------------------------------------- | ------ |
| `README.md`       | Installation, quick-start, configuration, core usage | ✅     |
| `EXAMPLES.md`     | Runnable code samples & advanced usage (native)      | ✅     |
| `EXAMPLES-WEB.md` | Web-platform (auth0-spa-js) usage samples            | ✅     |
| `example/`        | `Auth0Example` runnable app (yarn workspace)         | ✅     |

`FAQ.md` and `REACT_NATIVE_WEB_SETUP.md` also exist and may need touch-ups for related changes. The migration guide (`MIGRATION_GUIDE.md`) is version-specific and handled by the breaking-change Ask-First boundary, not tracked here. `CHANGELOG.md` is generated at release time — never hand-edit it for a feature PR.

## When you change code, update these docs

| When this changes                                                                   | Update these docs                                                                                  |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Public API surface (`src/index.ts` exports, `src/Auth0.ts`, `core/interfaces/`)     | `README.md` (usage), `EXAMPLES.md` (+ `EXAMPLES-WEB.md` if web), `example/` app if it uses the API |
| Configuration options (Auth0Provider props, options objects, types in `src/types/`) | `README.md` (configuration section)                                                                |
| Authentication / authorization flow (login, passwordless, MFA, DPoP)                | `README.md` (quick-start), `EXAMPLES.md` (auth examples)                                           |
| Install / package name / peer-dependency requirements                               | `README.md` (installation section)                                                                 |
| New public method or exported symbol added                                          | `EXAMPLES.md` (add a usage sample)                                                                 |
| Public method or exported symbol removed / renamed                                  | `README.md` + `EXAMPLES.md` (remove/update affected samples)                                       |
| Web-specific behavior (auth0-spa-js adapters)                                       | `EXAMPLES-WEB.md`, `REACT_NATIVE_WEB_SETUP.md`                                                     |

When you touch code that maps to a doc above, update that doc **in the same PR** — do not defer.
