# Playwright TypeScript Framework

Cross-browser end-to-end tests with Playwright Test, TypeScript, parallel workers, step logs, and failure screenshots, videos, traces, and an HTML report.

## Setup

Requires Node.js 20 or newer and npm. Install project packages and browser engines:

```sh
npm install
npx playwright install chromium firefox webkit
```

On Linux CI, use `npx playwright install --with-deps chromium firefox webkit` to install operating-system browser dependencies too.

Copy `.env.example` to `.env` and set credentials only when running the Conative authenticated example. The example is skipped if any required value is missing.

## Run

```sh
npm test                 # all configured browsers
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:headed
npm run test:ui
npm run typecheck
npm run lint
npm run report           # open the last HTML report
```

Playwright runs tests in parallel. Set `CI=1` to enable two retries and cap workers at two. Test results, screenshots, videos, and traces go under `test-results/`; the HTML report is in `playwright-report/`.

## Project layout

- `tests/`: end-to-end specs
- `src/fixtures/`: shared test fixtures and step logging
- `src/utils/`: locator helpers
- `src/test-data/`: test data guidance and fixtures
- `.env`: local secrets and environment-specific values (not committed)

## Writing tests

Prefer Playwright's accessible locators (`getByRole`, `getByLabel`, `getByPlaceholder`) and assert the expected state after each meaningful action. Use `stepLog` to record each action and produce contextual failure messages. Add stable `data-testid` attributes to the application only when accessible selectors are unavailable. `resilientLocator` tries semantic alternatives, and reports when no unique visible match exists; it does not silently click ambiguous elements.

For each requested test, capture the starting URL/authentication state, action, expected result, relevant wait condition, and likely failure state. Use web-first assertions rather than fixed sleeps so slow pages can finish naturally.

## Configuration and reporting

`playwright.config.ts` defines Chromium, Firefox, and WebKit projects, parallel execution, timeouts, HTML/list reporters, and failure artifacts. `tsconfig.json` enables strict TypeScript checking. ESLint and Prettier are included; VS Code extension recommendations are in `.vscode/extensions.json`.

## Example flow limitations

The Conative example requires valid credentials and organization name in `.env`. The site may change its sign-in labels, terms control, organization selector, or post-login heading; update the semantic locators in `tests/conative-sign-in.spec.ts` to match the live UI. Browser tests are not run automatically during scaffold setup.
