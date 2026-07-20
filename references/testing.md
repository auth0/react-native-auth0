# Testing

## Setup

- **Framework:** Jest 29, configured inline in `package.json` (`jest` key).
- **Environment:** custom `jest.environment.js` (`testEnvironment: "./jest.environment"`), a jsdom-based environment.
- **HTTP mocking:** `fetch-mock` — orchestrator tests mock the HTTP layer rather than hitting a network.
- **React:** `@testing-library/react` + `@testing-library/jest-dom` for hook/provider tests.
- **Ignored paths:** `fixtures`, `example/node_modules`, `lib/`.

The default `yarn test` suite is unit-only — it requires no Auth0 tenant, credentials, or secrets. There is no separate credentialed/live test tier wired in this repo.

## Location & naming

Tests are colocated in `__tests__/` directories beside the module they cover, named `*.spec.ts` (e.g. `src/core/utils/__tests__/scope.spec.ts`, `src/factory/__tests__/Auth0ClientFactory.spec.ts`).

## Conventions

- BDD style: `describe('<unit>')` + `it('should <behavior> when <condition>')`.
- One behavior per `it`; assert on parsed output, not implementation details.
- For orchestrators: mock `HttpClient`, invoke the method, assert on request params (URL, body, headers) and on the parsed/`deepCamelCase`d response.
- Prefer deterministic assertions (e.g. split-and-sort a scope string rather than depending on token order).

## Coverage

- `yarn test:ci` collects coverage (Istanbul) into `coverage/`.
- Thresholds live in `codecov.yml`: patch target **80%**, project target auto (±1%). `src/core/utils/telemetry.ts` is ignored.
- Run a single file's coverage with `yarn test:ci path/to/file.spec.ts`.
