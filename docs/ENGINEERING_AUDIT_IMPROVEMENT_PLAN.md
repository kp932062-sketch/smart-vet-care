# SmartVet Engineering Audit and Improvement Plan

Date: 2026-03-13

## Scope

This audit covers:
- `vetcare-backend` (Node.js + Express + MySQL)
- `vetcare-frontend` (React + Vite)
- Local development and production readiness concerns

## Executive Summary

SmartVet is functionally rich, but it is not yet production-ready. The biggest risks today are authorization gaps (data exposure risk), weak secret handling patterns, lack of automated tests, and incomplete engineering controls (logging, observability, CI quality gates, and TypeScript).

A phased 10-step plan is included below to make the project secure, testable, maintainable, and scalable without a high-risk rewrite.

## Findings (Prioritized)

### Critical

1. Insecure direct object access (IDOR) in appointment/user data APIs.
   - Any authenticated user can request another user's appointment history by ID or email.
   - Evidence:
     - `vetcare-backend/routes/appointments.js:7`
     - `vetcare-backend/routes/appointments.js:18`
     - `vetcare-backend/controllers/appointmentController.js:60`

2. Doctor report endpoint lacks auth/authorization.
   - Doctor reports are exposed by doctor ID without authentication middleware.
   - Evidence:
     - `vetcare-backend/routes/reports.js:9`
     - `vetcare-backend/controllers/reportController.js:29`

3. Consultation record access has no owner/role guard.
   - Any authenticated user can fetch a consultation by ID.
   - Evidence:
     - `vetcare-backend/routes/consultations.js:9`
     - `vetcare-backend/controllers/consultationController.js:53`
     - `vetcare-backend/controllers/consultationController.js:59`

### High

4. Admin login fallback compares plaintext env password and bypasses DB user model.
   - This creates split auth paths and weakens central identity controls.
   - Evidence:
     - `vetcare-backend/controllers/authController.js:146`
     - `vetcare-backend/controllers/authController.js:185`

5. MySQL pool enables `multipleStatements`.
   - Expands blast radius for SQL injection if any query path regresses.
   - Evidence:
     - `vetcare-backend/config/database.js:38`
     - `vetcare-backend/config/database.js:80`

6. Server can boot with DB unavailable.
   - Leads to partial-outage behavior that is hard to detect early.
   - Evidence:
     - `vetcare-backend/server.js:209`
     - `vetcare-backend/server.js:218`

7. Frontend dependency vulnerabilities detected by `npm audit`.
   - Key issues: `axios`, `react-router` chain.

8. Backend dependency vulnerabilities detected by `npm audit`.
   - 40 advisories total (1 critical, 25 high) including `fast-xml-parser`, `axios`, `cloudinary`, `nodemailer`, `validator` chain.

### Medium

9. No real automated tests are configured.
   - Backend test script is a placeholder, frontend has no `test` script.
   - Evidence:
     - `vetcare-backend/package.json:9`
     - `vetcare-frontend/package.json:8`

10. Lint pipeline is effectively broken for JSX.
    - ESLint parse errors across JSX files due missing JSX parser options.
    - Evidence:
      - `vetcare-frontend/eslint.config.js:9`

11. Root documentation is outdated (still references MongoDB and old ports).
    - Evidence:
      - `README.md:66`
      - `README.md:79`
      - `README.md:112`
      - `README.md:141`

12. Accessibility gaps in interactive non-semantic containers.
    - Clickable `div` elements without keyboard semantics.
    - Evidence:
      - `vetcare-frontend/src/components/landing/Landing.jsx:266`
      - `vetcare-frontend/src/components/common/Sidebar.jsx:143`

### Low

13. Architecture drift: large controller/components increase change risk.
    - Example large files:
      - `vetcare-backend/controllers/appointmentController.js` (~330 lines)
      - `vetcare-backend/controllers/authController.js` (~316 lines)
      - `vetcare-frontend/src/components/doctor/ReportsPanel.jsx` (~1232 lines)

14. Potential dependency bloat and unused packages.
    - Backend likely unused: `agora-token`, `bcryptjs`, `moment`, `twilio`, `uuid`, `xss-clean`.
    - Frontend likely unused imports: `@emailjs/nodejs`, `moment`, `react-big-calendar`, `react-modal`.

## Current Maturity Snapshot

- Testing: 1/5
- Type Safety: 1/5
- Security: 2/5
- Observability: 1/5
- Architecture: 2/5
- Accessibility: 2/5
- Documentation: 2/5

Overall: **Not production-ready yet**, but recoverable with an incremental plan.

---

## 10-Step Improvement Plan

### Step 1: Automated Testing (Week 1)

Backend:
- Add `jest`, `supertest`, `ts-jest` (during TS migration), `cross-env`.
- Add tests for:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/animals`
  - `POST /api/appointments`

Frontend:
- Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `msw`.
- Add tests for login/register forms and API failure states.

Acceptance:
- CI runs test suites on every PR.
- Minimum 70% statement coverage for backend auth + appointment modules.

### Step 2: TypeScript Migration (Weeks 1-2)

Approach:
- Migrate backend first (`allowJs: true` transitional mode), then frontend.
- Convert models/contracts first, then controllers/routes.

Deliverables:
- Root `tsconfig.base.json`
- `vetcare-backend/tsconfig.json`
- `vetcare-frontend/tsconfig.json`
- Shared types package (`packages/contracts` or `shared/types`)

Acceptance:
- `npm run typecheck` passes for both apps.
- No `any` in new domain/service contracts.

### Step 3: Documentation (Week 2)

Create:
- `README.md` (correct stack: MySQL + current ports)
- `docs/ARCHITECTURE.md`
- `docs/API_REFERENCE.md` (OpenAPI preferred)
- `docs/CONTRIBUTING.md`
- `docs/RUNBOOK.md` (ops + incident response)

Acceptance:
- New developer can run app in <=15 minutes using docs only.

### Step 4: Structured Logging (Week 2)

Implement with `pino`:
- Request/response logging middleware with request ID.
- Error serializer with stack in non-prod only.
- DB error logging (query name + latency + safe metadata).

Acceptance:
- All logs are JSON in production, pretty in development.

### Step 5: Backend Architecture Refactor (Weeks 3-4)

Target layering:
- `routes -> controllers -> services -> repositories -> db`
- Keep auth, appointments, reports as first migrated verticals.

Acceptance:
- Controllers become thin (IO only).
- Business logic moved to services.
- SQL isolated to repositories.

### Step 6: Security Hardening (Week 3)

Immediate fixes:
- Remove public report access and enforce role checks.
- Enforce ownership checks for all `:id` and `:email` access patterns.
- Disable `multipleStatements`.
- Remove env-admin plaintext login fallback; keep one auth source.
- Enforce strong `JWT_SECRET` policy (fail fast if default placeholder).
- Add CSRF strategy if cookie auth is used later.

Acceptance:
- OWASP top-10 checklist completed.
- Zero critical/high authz findings in internal review.

### Step 7: Accessibility (Week 4)

Actions:
- Replace clickable `div` with semantic `button`.
- Add keyboard focus states, landmarks, ARIA labels where needed.
- Add automated a11y checks (`eslint-plugin-jsx-a11y`, `axe-core` in tests).

Acceptance:
- No critical issues in automated axe scan for key pages.

### Step 8: Dependency Management (Week 2 then monthly)

Actions:
- Remove unused dependencies.
- Patch vulnerable packages first (`axios`, router chain, cloudinary-related chain).
- Introduce Renovate/Dependabot.

Acceptance:
- `npm audit` high/critical = 0 for both apps.

### Step 9: Performance (Week 4)

Backend:
- Add query timing + slow-query logs.
- Add/verify indexes for frequent filters:
  - appointments `(user_id, appointment_date)`
  - appointments `(doctor_id, appointment_date)`
  - treatments `(doctor_id, treatment_date)`
- Add Redis-ready cache abstraction for read-heavy dashboards.

Frontend:
- Route-level code splitting via `React.lazy`.
- Memoize heavy table/chart components.
- Use virtualization for large tables.

Acceptance:
- p95 API latency and frontend LCP baseline documented and improved by >=20%.

### Step 10: Final Validation and Release Readiness (Week 5)

- End-to-end local smoke suite: register -> login -> pet -> appointment -> treatment/report.
- Production checklist gate:
  - tests passing
  - typecheck passing
  - lint passing
  - audit clean
  - docs current
  - backup/restore verified

---

## Recommended Target Folder Structure

```text
vetcare-backend/
  src/
    app.ts
    server.ts
    config/
    modules/
      auth/
        auth.controller.ts
        auth.service.ts
        auth.repository.ts
        auth.routes.ts
        auth.schemas.ts
      appointments/
      doctors/
      pets/
      reports/
    middlewares/
    libs/
      logger.ts
      db.ts
    types/
  tests/
    integration/
    unit/

vetcare-frontend/
  src/
    app/
      router.tsx
      providers/
    features/
      auth/
      appointments/
      doctors/
      pets/
      reports/
    shared/
      api/
      ui/
      hooks/
      utils/
    tests/
```

---

## Example Snippets

### Backend API test (Jest + Supertest)

```js
// tests/integration/auth.register.test.js
const request = require('supertest');
const { app } = require('../../src/app');

describe('POST /api/auth/register', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'StrongPass!123'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
```

### Frontend component test (React Testing Library)

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../Login';

test('shows validation errors on empty submit', async () => {
  render(<Login />);
  await userEvent.click(screen.getByRole('button', { name: /login/i }));
  expect(screen.getByText(/email and password are required/i)).toBeInTheDocument();
});
```

### Structured logger (Pino)

```js
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['req.headers.authorization', 'password', 'token']
});

module.exports = logger;
```

### Request validation with centralized schema

```js
const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});
```

---

## Migration Steps (Low-Risk Sequence)

1. Lock down authorization gaps first (Critical findings).
2. Introduce logger + request IDs.
3. Add backend integration tests for auth/appointments before major refactor.
4. Start TypeScript in backend with `allowJs`, migrate module-by-module.
5. Split controllers into services/repositories.
6. Migrate frontend to TypeScript + Vitest.
7. Refresh docs and add CI quality gates.
8. Perform dependency cleanup and vulnerability patching.
9. Run full smoke + regression tests, then release.

---

## What to Execute Next (Recommended)

1. Security hotfix PR (authz + route guards + disable `multipleStatements`) - highest priority.
2. Testing baseline PR (Jest/Supertest + Vitest/RTL + 4 required example tests).
3. TypeScript foundation PR (tsconfig + strict mode + first module migration).

