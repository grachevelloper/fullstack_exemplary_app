# Frontend agent instructions

## Scope and precedence

This file applies to everything under `fe/`. Follow a more deeply nested `AGENTS.md` if one is added later. Direct user instructions override this file.

You may create design specifications, implementation-plan documents, and other workflow specification files when they materially improve the work. Keep them scoped to the task and avoid producing documentation as ceremony.

Use the repository as evidence, not as unquestionable design authority. The project has not been actively maintained for some time and may contain outdated decisions, accidental inconsistencies, and defects. In descending order of authority, follow direct user guidance, executable configuration, verified tests, repeated coherent patterns, and then the nearest valid implementation. Existing typos, commented experiments, stale scripts, repeated workarounds, and isolated shortcuts are not conventions.

When a choice is genuinely debatable from an engineering perspective and the repository does not establish a clearly correct answer, stop and ask the user before encoding the choice in code or documentation. Present the concrete options and trade-offs. Do not silently infer the user's preferred architecture from legacy code.

## Non-negotiable repository safety

- Never create a Git commit unless the user explicitly requests a commit in the current conversation. Permission to edit, implement, fix, or finish does not imply permission to commit.
- Do not stage files unless asked. Do not amend, rebase, reset, clean, restore, or discard user changes without explicit authorization.
- Inspect `git status --short` before editing and preserve unrelated user work.
- Keep changes scoped. Avoid bundling visual redesigns, dependency upgrades, mass formatting, generated locale churn, or unrelated refactors.
- Never expose or commit secrets. Frontend environment values are shipped to the browser when bundled and must be treated as public.
- Do not bypass type errors, lint rules, authorization behavior, or accessibility checks with blanket suppressions.
- Do not edit `dist/`, package-manager caches, or installed dependencies. Regenerate build output through scripts only when requested.

## Frontend at a glance

The frontend is a React 19 single-page application built directly with Webpack 5. It uses React Router 7, TanStack Query 5, Axios, Ant Design 6, SCSS, `bem-cn-lite`, i18next, and optional MSW browser mocks.

Runtime flow:

2. `src/entries/App.tsx` composes theme, Query Client, auth, sidebar, and todo-form providers.
3. `src/shared/configs/routes.tsx` creates the browser router and layout boundaries from route arrays exported by feature units.
4. Pages compose feature and shared components.
5. Feature stores expose TanStack Query hooks, feature API modules call the shared Axios wrapper, and the backend responds below `/api`.
6. The Axios response interceptor unwraps successful `AxiosResponse.data` and refreshes cookie-based auth once after a `401`.

Confirmed stack:

- Node.js 20 in `Dockerfile` and pnpm 10;
- React 19 and React DOM 19;
- strict TypeScript 5 with `noUncheckedIndexedAccess`;
- Webpack 5, Babel, React Refresh, Sass, and production asset hashing;
- React Router 7 route elements;
- TanStack Query 5 for remote state;
- Axios with `withCredentials: true`;
- Ant Design 6 plus application theme tokens;
- SCSS and BEM class generation through `bem-cn-lite`;
- i18next/react-i18next with Russian and English namespaces;
- MSW 2 for optional browser-level API mocks;
- ESLint flat config with React, Hooks, imports, TypeScript, and i18n plugins.

## Project map

```text
fe/
├── public/
│   ├── assets/                 # static images and icons
│   ├── locales/{ru,en}/        # translation JSON by namespace
│   └── lottie/                 # animation data
├── src/
│   ├── main.tsx                # browser bootstrap and optional MSW startup
│   ├── entries/                # application root composition
│   ├── units/                  # feature areas: articles, todos, users, emails
│   │   └── <feature>/
│   │       ├── api/            # HTTP calls and transport types
│   │       ├── store/          # TanStack Query hooks and query keys
│   │       ├── components/     # feature-specific UI
│   │       ├── pages/          # route-level UI and route exports
│   │       ├── types/          # domain/UI types
│   │       ├── hooks/          # feature hooks where present
│   │       └── utils/          # feature-only helpers/constants
│   ├── shared/
│   │   ├── components/         # reusable application components
│   │   ├── entities/           # reusable domain-oriented UI and data logic
│   │   ├── configs/            # API, router, i18n, theme styles
│   │   ├── context/            # auth, theme, sidebar, todo-form state
│   │   ├── hooks/              # generic browser/React hooks
│   │   ├── pages/              # application-wide pages
│   │   └── utils/              # generic utilities/constants
│   ├── typings/                # ambient and cross-cutting TS declarations
│   └── __test__/mocks/         # MSW worker, handlers, and factories
├── webpack.config.js
├── eslint.config.mts
├── tsconfig.json
└── package.json
```

Feature code belongs in `units/<feature>`. Put code in `shared` only when it is genuinely reusable across feature boundaries or is application infrastructure. Do not create a generic abstraction for a single caller merely to move code into `shared`.

## Working method

Before changing code:

1. Read this file, `package.json`, Webpack/TypeScript/ESLint configuration, and the complete affected feature slice.
2. Trace the data path: route/page → component → query hook → feature API → shared Axios wrapper → backend endpoint.
3. Search for all query keys, cache writes, route references, translation keys, aliases, and API types affected by the change.
4. Inspect both desktop and narrow-layout patterns near the target component.
5. Check the corresponding backend controller/DTO/entity when the API contract is involved.
6. Separate confirmed behavior from assumptions. Ask the user about engineering-significant ambiguity before implementation.

During the change:

- Prefer a small, coherent component or hook with a clear interface.
- Keep remote state in TanStack Query, short-lived interaction state in the component, and cross-tree application state in an established context only when needed.
- Reuse Ant Design components where they fit. Use Ant Design tokens only according to the styling boundary below; do not move general layout styling into TSX.
- Keep user-visible copy in i18n resources rather than JSX.
- Update loading, empty, error, success, and disabled states together.
- Preserve keyboard and screen-reader behavior, not only appearance.

After the change:

- Review the complete diff for accidental locale regeneration, debug logs, unsafe casts, stale cache paths, and unrelated SCSS churn.
- Run validation from the matrix below.
- Report exactly what was tested and any missing project infrastructure. Never describe MSW handlers as unit tests and never claim tests passed when no test runner exists.

## Components and file organization

- Route-level composition belongs in `pages`; reusable feature UI belongs in the feature's `components`; cross-feature UI belongs in `shared/components` only after real reuse exists.
- The established component-folder shape is `ComponentName/ComponentName.tsx`, optional `ComponentName.scss`, optional local helpers/components, and `index.ts` as the public export.
- Keep component props explicit and narrow. Use interfaces or types near the component unless the contract is shared.
- Prefer named exports for feature/components, matching current code. The root `App` remains a default export because the bootstrap imports it that way.
- Keep render functions and event handlers close to the component when simple; extract hooks/utilities when logic is reusable, independently testable, or obscures rendering.
- Do not add `React.FC` mechanically. Both plain functions and `React.FC` exist; match the nearest coherent area and preserve accurate `children` typing.
- Use stable `key` values derived from entity IDs. The ESLint rule requires JSX keys; array indexes are acceptable only for truly static, identity-free content.
- Avoid unnecessary `Fragment`, memoization, and callbacks. Add `useMemo`/`useCallback` only for referential requirements or meaningful computation, not by default.
- Effects synchronize React with external systems. Do not use an effect for values that can be derived during render.
- Include every reactive value used by an effect or callback unless a deliberate pattern makes it stable. The hooks plugin is configured even though its recommended rules are not explicitly extended; correctness still requires sound dependencies.

## State ownership

### Server state

- Use TanStack Query for backend-owned data, loading/error state, mutations, retries, and cache synchronization.
- Keep raw HTTP calls in `units/<feature>/api` or the relevant shared API boundary, not directly in components.
- Define stable query-key factories for feature collections, details, filters, and user scopes. Keys must include every input that changes the result.
- Guard optional IDs with `enabled`; do not rely only on `id!` to make an invalid query safe.
- After mutations, update or invalidate every affected cache entry: detail, collection, author-scoped, drafts, counters, and related entities as applicable.
- For optimistic updates, cancel relevant queries, snapshot prior data, update the cache, roll back in `onError`, and reconcile or invalidate on success/settlement.
- The global client uses `staleTime: Infinity`, retry count `3`, and reconnect/mount refetching. New queries must deliberately override these defaults when freshness or error semantics differ.
- Do not duplicate query results into context or local state unless editing requires a temporary draft. Define synchronization and rollback when a draft mirrors server state.

### Local and application state

- Use component state for transient UI state such as open panels, editing text, previews, and local form steps.
- Use established contexts for auth, theme, sidebar, and todo-form concerns. Do not introduce a new global context for state used by one subtree.
- A context hook should fail clearly outside its provider. Note that a context created with a non-null default will not naturally satisfy `if (!context)`; do not copy misleading guard code.
- Keep storage hooks defensive: parsing, quota, unavailable browser APIs, and removal can fail.

## API and contract rules

- Use `query` from `src/shared/configs/api.ts` for authenticated backend calls so base URL, credentials, response unwrapping, and refresh behavior remain consistent.
- API methods return response bodies, not raw Axios responses. Do not read `.status` or `.data` unless the call intentionally uses raw Axios; the existing `publish` implementation is a sharp edge, not a pattern.
- Keep endpoint paths consistent. The shared Axios base is `/api`; feature paths should not accidentally create or rely on malformed double prefixes.
- Define request and response types in the feature API boundary and map them to domain/UI types where shapes differ.
- Do not expose backend entities blindly as permanent public contracts. Check optionality, timestamps, enums, relation shapes, and secret fields.
- Preserve `withCredentials: true` for cookie auth.
- When modifying refresh logic, prevent retry loops, set `_retry` before replay, preserve the original request, and handle rejected responses that may lack `response` safely.
- Do not make authenticated calls with a separate Axios instance unless the endpoint requires different behavior.
- User-controlled filters belong in query parameters and query keys. Encode them through Axios config rather than manual string concatenation where practical.
- Coordinate API changes with `../be`; search backend controllers and DTOs before assuming a route or response shape.

## Routing

- Add feature routes through the relevant `units/<feature>/pages/index.tsx` export and compose them in `src/shared/configs/routes.tsx`.
- Place authenticated/application pages under `Layout` and authentication pages under `AuthLayout` according to existing boundaries.
- Preserve the wildcard/shared error-page behavior when editing route composition.
- Route paths and params must match API/page expectations. Guard absent params before queries or mutations.
- Use router navigation APIs instead of assigning `window.location` for ordinary in-app navigation. Full-page navigation may remain appropriate for auth recovery or external locations.
- Keep route elements lazy only if a deliberate code-splitting pattern is introduced consistently; the current router is eager.

## Internationalization

- User-visible labels, messages, validation text, empty/error states, and accessibility text belong in translations.
- The configured namespaces are `common`, `todo`, `auth`, and `article` in both `ru` and `en`.
- Add the same semantic key to both languages in one change. Keep nesting and interpolation variables aligned.
- Call `useTranslation` with the correct namespace. Existing mismatches such as `articles` versus `article` are defects, not patterns.
- Do not build translated sentences by concatenating fragments; use interpolation and pluralization.
- Dynamic server data, usernames, article content, and technical identifiers are not translation keys.
- If typed resource declarations are regenerated, inspect the whole generated diff. `pnpm run interface` generates `src/typings/resources.ts`; `../scripts/interface.sh` transforms that file into `src/typings/i18next.d.ts` when run from `fe/`. This two-step flow is not automatic.

## Styling, Ant Design tokens, BEM, and responsive behavior

- Prefer Ant Design layout and controls where they meet the interaction requirement.
- Use `theme.useToken()` for colors and for values that specifically belong to the Ant Design design system or a particular Ant component API. Typical examples are semantic colors, theme-aware backgrounds/borders, Ant radii, and component token values passed through an Ant `style`/`styles` API.
- Do not call `theme.useToken()` as component boilerplate. Destructure only tokens actually used by the component; remove empty `token: {}` calls.
- Do not use inline `style` merely for ordinary layout or presentation. Dimensions, spacing, display, positioning, transitions, responsive rules, and component visual states belong in the component SCSS unless an Ant component API requires a runtime value.
- Use SCSS as the default home for all non-Ant-specific styling. Co-locate the stylesheet with the component and import it from the component module.
- Use `bem-cn-lite` to connect JSX and SCSS: define one block name in kebab-case, use `b()` for the root, `b('element')` for elements, and boolean BEM modifiers for meaningful state.
- Match the class shape produced by this project: `b('title')` maps to `.block__title`, `b({active: true})` maps to `.block_active`, and `b('item', {active: true})` maps to `.block__item_active`. In nested SCSS, express these as `&__title`, `&_active`, and an element-local `&_active` respectively. Do not introduce `--modifier` naming into an existing `bem-cn-lite` block.
- Keep layout and state classes declarative. Prefer `className={b('element', {active: condition})}` over manually concatenating BEM strings.
- Do not duplicate the Ant palette as manually maintained global CSS variables. Existing `--ant-*` declarations in `src/entries/App.scss` may be stale and are not a source of truth.
- If a theme token is needed in a pseudo-element, media rule, animation, or another SCSS-only context, do not invent a new token bridge silently. Ask the user whether to expose a CSS custom property, restructure the markup, or accept a deliberate non-theme value.
- Hard-coded colors are acceptable only when they represent deliberate, theme-independent artwork or media rather than application UI semantics. If that distinction is unclear, ask the user.
- Keep block names aligned with stylesheet selectors. Preserve an existing misspelled public class only if changing it would cause unrelated visual churn; use correct names for new blocks.
- Avoid broad global selectors. Scope styles to the component block unless intentionally editing application reset/root styles.
- Prefer CSS or Ant Design responsive props for presentation. Use `useLayout` when behavior, not merely styling, changes by viewport.
- Test at narrow mobile, tablet, and desktop widths for layout changes. Check overflow, long translated strings, touch targets, images, and fixed/overlay elements.
- Support light and dark themes. A value that works only against one hard-coded background is incomplete.
- Do not use the scaffold script as unquestioned output. `scripts/react-module.sh` produces a useful folder skeleton but its generated formatting requires linting and review.

## Accessibility and interaction

- Use semantic interactive elements (`Button`, `<button>`, links) rather than click handlers on icons or generic containers when the element performs an action.
- Interactive controls must be keyboard reachable, show focus, have an accessible name, and expose disabled/busy state when relevant.
- Images need meaningful `alt` text or an empty alt when decorative.
- Form controls need visible or programmatic labels and error association.
- Do not encode state using color alone. Preserve text/icon/ARIA cues.
- Modals, popovers, overlays, and drawers must support focus management, escape/close behavior, and sensible background interaction.
- Respect Ant Design component semantics rather than overriding them with non-semantic wrappers.

## Loading, empty, error, and offline states

- Every remote-data page must define loading, empty, and error rendering; mutations need pending/disabled feedback and actionable failure behavior.
- Use existing skeleton/empty/error components when suitable.
- The root layout wraps content in `QueryErrorResetBoundary` and `ErrorBoundary`, but local recoverable API errors should still be rendered near the responsible feature.
- Keep optimistic UI reversible.
- The application has an offline overlay based on `navigator.onLine`; do not assume this replaces request-level network error handling.
- Avoid logging expected UI errors as the only user feedback.

## MSW and tests

- Add handlers to `src/__test__/mocks/handlers` and include them in the handler index. Keep fixture creation in factories when reusable.
- Mock the real URL, method, params, and response body. Exercise error and latency states when relevant.
- Do not let mocks drift from backend contracts; compare against backend controllers and DTOs.
- The frontend currently has no `test` script or configured test runner. MSW handlers are development mocks, not automated tests.
- If a task requires automated component/unit tests, either add the requested test infrastructure as an explicit scoped change or report that the repository lacks it. Do not create test files that cannot be run.

## Imports, TypeScript, and lint

- TypeScript is strict and enables `noUncheckedIndexedAccess`; handle missing indexed values explicitly.
- Prefer configured aliases (`@/shared`, `@/articles`, `@/todos`, `@/users`, `@/typings`, `@/public`, `@/locales`) for cross-area imports and relative imports inside one component/feature neighborhood.
- Check alias availability across `tsconfig.json`, `webpack.config.js`, and `eslint.config.mts`. They are not perfectly aligned.
- Follow ESLint `import/order`: external packages, blank line, alias/internal imports, then local imports, alphabetized within groups.
- Type-only imports should use `import type` where practical.
- Avoid new `any`, non-null assertions, unsafe response casts, and ignored promise failures. Relaxed lint rules reflect current migration debt, not desired new code.
- Do not disable `react/jsx-key`, duplicate-prop, or import-order errors.
- JSX uses single quotes in the existing frontend style; preserve local formatting and avoid reformatting untouched files.

## Commands

Run commands from `fe/` unless noted.

```bash
pnpm install
pnpm run dev
pnpm run type-check
pnpm run lint
pnpm run build
```

Mutating commands:

```bash
pnpm run lint:fix
pnpm run interface
../scripts/interface.sh
```

`lint:fix` writes source files. The localization commands rewrite generated typing files and must be followed by a diff review and `pnpm run type-check`.

There is no frontend `test` script. Do not invent or report `pnpm test` as a passing check. The Dockerfile currently runs `pnpm run build:dev`, but `package.json` has no `build:dev` script; use `pnpm run build` for local verification and treat the Dockerfile mismatch as technical debt until explicitly fixed.

## Validation matrix

| Change                     | Minimum validation                                                             |
| -------------------------- | ------------------------------------------------------------------------------ |
| Markdown/instructions only | `git diff --check` and manual path/command verification                        |
| Types or pure utility      | `pnpm run type-check`, `pnpm run lint`, `pnpm run build`                       |
| Component/style            | type-check, lint, build, manual light/dark and responsive review               |
| Route/page                 | type-check, lint, build, direct navigation and refresh verification            |
| Query/mutation/cache       | type-check, lint, build, loading/error/success and cache-update verification   |
| Auth/Axios interceptor     | type-check, lint, build, signin/refresh/logout and failed-refresh verification |
| i18n                       | both locale files, type-check, lint, build, RU/EN visual review                |
| Cross-project API contract | frontend checks plus relevant backend tests/build                              |

If a validation command exposes a pre-existing issue, record its exact location and show why it is unrelated. Do not weaken validation or modify unrelated code merely to obtain a green command.

## Known sharp edges

Do not copy these into new work:

- TypeScript, Webpack, and ESLint aliases differ (`@/pages`, `@/tests` versus `@/test`, and other mappings). Verify an alias in all relevant tools before adding it.
- The Axios interceptor unwraps responses, but at least one feature method still reads `response.status`.
- The refresh interceptor checks `_retry` but does not visibly set it before replay, creating loop risk.
- Some API paths mix leading and non-leading slashes and some user endpoint naming may not match backend routes.
- The global Query Client uses infinite stale time while individual queries sometimes override it; freshness must be intentional.
- Some effects omit dependencies, some contexts use non-null default objects with ineffective absence checks, and several non-null assertions bypass optional params.
- There are untranslated hard-coded strings, namespace typos, debug `console.log` calls, BEM spelling errors, and click handlers on non-semantic icons.
- `scripts/react-module.sh` is a rough scaffold, not formatting- or accessibility-complete output.

## Task checklists

### New route or page

- [ ] Page belongs to the correct feature or shared area.
- [ ] Route is exported and mounted under the correct layout.
- [ ] Route params are validated before data hooks run.
- [ ] Loading, empty, error, and permission states are present.
- [ ] Direct navigation and browser refresh work through history fallback.
- [ ] All visible text exists in RU and EN.
- [ ] Mobile, tablet, desktop, light, and dark rendering are checked.

### New component

- [ ] Responsibility and props are narrow and typed.
- [ ] Placement is feature-local unless cross-feature reuse is real.
- [ ] Ant Design components are reused where appropriate.
- [ ] `useToken()` is limited to colors or Ant-specific design values and contains no unused token destructuring.
- [ ] Ordinary layout and presentation live in SCSS under a matching BEM block.
- [ ] JSX elements/modifiers and nested SCSS selectors produce the same `bem-cn-lite` class names.
- [ ] Keyboard, focus, accessible name, and disabled state are correct.
- [ ] Long content, missing optional data, and both themes are handled.
- [ ] No unnecessary context, effect, memoization, or abstraction is introduced.

### API/query/mutation change

- [ ] Backend route, method, request, response, and auth behavior are verified.
- [ ] Transport types match runtime data and do not expose secrets.
- [ ] Query key includes all result-changing inputs.
- [ ] Optional params use `enabled` or an explicit guard.
- [ ] Loading, error, success, and retry behavior are deliberate.
- [ ] Every affected cache entry is updated or invalidated.
- [ ] Optimistic changes snapshot and roll back correctly.
- [ ] MSW handlers are updated when used for this endpoint.

### User-visible copy or localization

- [ ] Correct namespace is selected.
- [ ] RU and EN use the same key shape and interpolation variables.
- [ ] Plurals and dynamic values use i18next features rather than concatenation.
- [ ] Generated resource typings are updated only if the task uses them.
- [ ] Both languages are visually checked for overflow.

### Styling or responsive change

- [ ] Theme-sensitive UI colors and Ant-specific values come from `useToken()`.
- [ ] Layout, spacing, positioning, transitions, responsive rules, and visual states live in SCSS.
- [ ] Selectors stay within the component BEM block and match `bem-cn-lite` element/modifier output.
- [ ] No empty or unused `useToken()` call remains.
- [ ] No unintended global or sibling style is changed.
- [ ] Narrow mobile, tablet, and desktop layouts are checked.
- [ ] Light and dark themes preserve contrast and state visibility.
- [ ] Hover, focus, active, disabled, loading, and error states remain usable.

## Definition of done

- The requested behavior works without unrelated edits or duplicated architecture.
- Types accurately represent runtime data; no new unsafe escape hatch was added.
- Remote/local/global state ownership is appropriate and cache behavior is correct.
- Routes, API contracts, authentication, translations, accessibility, themes, and responsive states are updated where affected.
- Applicable type-check, lint, and build commands pass, or exact pre-existing blockers are reported.
- The final diff contains no secret, debug output, generated junk, blanket suppression, or accidental formatting churn.
- Nothing is staged or committed unless the user explicitly requested it.
