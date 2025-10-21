## Nika Client

_(Next.js 15 · React 19 · TypeScript)_

---

### Quick start

```bash
yarn install
yarn dev           # http://localhost:3000

# quality gates
yarn tsc --noEmit  # type-check only
yarn lint          # eslint
```

Create an `.env.local` from `.env.example` and fill the required keys (see Env section).

---

### Project layout

```
src
 ├─ app/                     # Next.js app router
 │  ├─ (auth)/               # unauthenticated flows (login, signup…)
 │  └─ (main-app)/           # authenticated area (dashboard, etc.)
 │     └─ .../components/    # route-scoped UI
 │     └─ .../mutations/     # route-scoped mutations (POST/PUT)
 │     └─ .../queries/       # route-scoped queries (GET)
 │
 ├─ components/              # reusable UI widgets (inputs, buttons, etc.)
 ├─ services/                # single source of truth for API
 │  ├─ api/                  # axios instance with auth headers
 │  └─ <domain>/             # auth, trade, user, ...
 │     ├─ types.ts           # DTOs / view-models
 │     ├─ index.ts           # raw axios calls
 │     ├─ queries.ts         # TanStack Query hooks
 │     └─ mutations.ts       # TanStack Mutation hooks
 ├─ hooks/                   # global React hooks
 ├─ utils/                   # pure helpers (no React)
 ├─ validations/             # Yup schemas (forms)
 ├─ config/                  # runtime config (API_URL, etc.)
 └─ lib/                     # framework helpers (metadata, etc.)

providers.tsx                # React Query provider / toaster
middleware.ts                # auth/session middleware
routes.ts                    # central route map
```

> Components never import axios directly; they consume hooks from `*/mutations` or `*/queries`.

#### Route-based feature folders

Each page or sub-route owns its local UI and data hooks inside its folder. Start local while building a feature; when reused elsewhere, promote it to `src/services/<domain>/` or `src/components/`.

Guidelines (same architecture as yadsale-frontend):

1. Start local in the route's `queries/` and `mutations/` folders.
2. Promote on reuse:
   - Shared data hooks → `src/services/<domain>/`
   - Pure UI widgets → `src/components/`
3. Do not duplicate route-level hooks once a shared service exists; import the shared version instead.
4. Auth-related mutations live under `auth/mutations` when shared across auth routes.

---

### API flow (example)

1. Raw call

```ts
// src/services/trade/index.ts
export const performTrade = (payload: TradeWebhookPayload) =>
  apiHandler.post(TradeRoute.webhook, payload);
```

2. Mutation hook

```ts
// src/services/trade/mutations.ts
export const usePerformTrade = () => useMutation({ mutationFn: performTrade });
```

3. Component

```tsx
const { mutate: performTrade, isPending } = usePerformTrade();

<Button onClick={() => performTrade(payload)} loading={isPending}>
  Trade
</Button>;
```

---

### Forms and validation

- Forms use Formik
- Validation uses Yup schemas in `src/validations/*`

---

### Env variables (excerpt)

| key       | purpose          |
| --------- | ---------------- |
| `API_URL` | Backend base URL |

---

### Scripts

| script            | purpose                  |
| ----------------- | ------------------------ |
| `dev`             | run Next dev server      |
| `build` / `start` | production build & start |
| `lint`            | run eslint               |

---

### Deployment

```bash
yarn build
yarn start   # serves on $PORT (3000 default)
```

The app is SSR-compatible and uses React Query for data fetching with auth token automatically attached via the axios interceptor in `src/services/api`.
