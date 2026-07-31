# Third-party code

This document lists only the direct production and development dependencies declared in `package.json`. It does not list transitive packages installed under `node_modules`.

## Production dependencies

| Package | Declared version | Role in this project | Reason selected |
| --- | --- | --- | --- |
| `better-sqlite3` | `^13.0.2` | Provides synchronous SQLite access for the local Node.js application. | Its direct synchronous API is lightweight and suited to this local-first, single-user application. |
| `next` | `^16.2.12` | Provides the App Router, page rendering, application build tooling, and planned Route Handlers. | It supports both the presentation and required REST layers without a separate Express server. |
| `react` | `19.2.4` | Provides the component model used to build the user interface. | It is the UI library used by the selected Next.js application architecture. |
| `react-dom` | `19.2.4` | Connects React components to browser DOM rendering. | It is required for rendering the React interface in the web application. |

## Development dependencies

| Package | Declared version | Role in this project | Reason selected |
| --- | --- | --- | --- |
| `eslint` | `^9` | Analyses JavaScript source code for linting issues during development. | It provides automated, consistent code-quality checks. |
| `eslint-config-next` | `^16.2.12` | Supplies the ESLint configuration and rules recommended for Next.js projects. | It aligns linting with the framework and its supported conventions. |

## AI usage declaration

`ChatGPT work 5.6 Sol High` in Codex was used to generate the SQLite task repository code and assist with this dependency documentation. Package names and declared versions were checked against the current direct dependencies and development dependencies in `package.json`.
