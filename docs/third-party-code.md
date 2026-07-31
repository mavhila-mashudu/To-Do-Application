# Third-party code and tools

Only direct dependencies declared in `package.json` are listed below; transitive packages under `node_modules` are excluded.

## Production dependencies

| Package | Declared version | Purpose and reason selected |
| --- | --- | --- |
| `better-sqlite3` | `^13.0.2` | Provides a direct synchronous SQLite API well suited to this local-first, single-user Node.js application. |
| `next` | `^16.2.12` | Supplies the App Router, Route Handlers, rendering, development server and production build so the UI and REST API can run without a separate Express server. |
| `react` | `19.2.4` | Provides the component and state model used by the task interface. |
| `react-dom` | `19.2.4` | Renders and hydrates the React interface in the browser. |

## Development dependencies

| Package | Declared version | Purpose and reason selected |
| --- | --- | --- |
| `eslint` | `^9` | Performs repeatable static analysis of the JavaScript source. |
| `eslint-config-next` | `^16.2.12` | Applies Next.js Core Web Vitals and framework-aware ESLint rules. |
| `vitest` | `^4.1.10` | Runs the deterministic repository, rules and service tests with a concise JavaScript testing API. |

## External assets and generated reference

- The interface uses the Geist and Geist Mono typefaces through Next.js `next/font/google`, which integrates font loading with the framework build.
- Figma Make produced the supplied UI reference ZIP/folder. The reference was recreated as maintainable React components and CSS and connected to the existing REST API; compiled Figma HTML, CSS and JavaScript bundles were not copied into the application. The exact Figma Make model was not displayed, so the tool is recorded as `Figma-Make` without guessing a model.

The preceding document was reviewed and edited with the assistance of the following: Codex[5.6 Sol High].
