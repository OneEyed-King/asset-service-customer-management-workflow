# AssetFlow — RO/Appliance Service Manager

Multi-tenant service management app for RO/water purifier and appliance service businesses: customers, the assets they've bought or you service, team members with role-based access, and service visit history.

- `roservicemanager(backend)/` — Spring Boot 3, Java 17, PostgreSQL, JWT auth
- `roservicemanager(frontend)/` — React + TypeScript + Vite, MUI

## Running locally

The stack runs via Docker Compose, pointed at a **Postgres instance on your own machine** (not a Postgres container — see the commented-out `postgres` service in `docker-compose.yml` if you want that instead).

1. Make sure Postgres is running locally, with a database matching `POSTGRES_DB` below (default `ro_service_manager`).
2. Optionally copy `.env.example` to `.env` and adjust if your local Postgres credentials/port differ from the defaults:

   | Variable | Default |
   |---|---|
   | `POSTGRES_DB` | `ro_service_manager` |
   | `POSTGRES_USER` | `postgres` |
   | `POSTGRES_PASSWORD` | `postgres` |
   | `POSTGRES_PORT` | `5432` |

   **The password must match whatever your local Postgres install actually uses for that user** — `postgres` is just this project's default, not a guarantee. If you set a different password when you installed Postgres, use that instead (either edit `.env` or pass it inline, see below).

3. Start everything:
   ```
   docker compose up -d --build
   docker compose logs -f backend
   ```
   Watch the backend logs for Flyway migrations completing (`V1` through `V4`) without errors.

4. Frontend: `http://localhost:5173` — Backend API: `http://localhost:8080/api`

## Adding a tenant (business) and its users — dev-only REST API

There's no public signup page yet. Instead, new tenants and their users are created through a small set of dev-only REST endpoints under `/api/platform-admin/**` (replacing the old `manage-tenants.sh` script — that file is still in the repo but no longer the recommended path).

**These endpoints don't require login** (there's no user yet to log in as when you're creating the first one) — they're gated instead by a shared-secret header, checked against `platform-admin.api-key` in `application.yaml`:

```
X-Platform-Admin-Key: dev-only-change-me
```

That's the default. Override it with a real value via the `PLATFORM_ADMIN_KEY` environment variable before this is reachable from anywhere but your own machine — anyone with this key can create tenants and OWNER accounts.

All requests below assume the backend is running at `http://localhost:8080`.

### Create a tenant (business)

```bash
curl -X POST http://localhost:8080/api/platform-admin/tenants \
  -H "Content-Type: application/json" \
  -H "X-Platform-Admin-Key: dev-only-change-me" \
  -d '{
    "businessName": "Sharma RO Services",
    "planTier": "SMALL",
    "seatLimit": 2,
    "status": "ACTIVE"
  }'
```
- `planTier`: `SMALL` | `GROWING` | `MULTI_BRANCH` | `ENTERPRISE`
- `seatLimit`: a number, or omit/`null` for unlimited
- `status`: `TRIAL` | `ACTIVE` | `SUSPENDED` (defaults to `ACTIVE` if omitted)

Response includes the new tenant's `id` (a UUID) — you'll need it for the next step.

### List tenants

```bash
curl http://localhost:8080/api/platform-admin/tenants \
  -H "X-Platform-Admin-Key: dev-only-change-me"
```
Returns each tenant's plan, status, seat limit, and current seats used.

### Add a user to a tenant

The first user for a new tenant should be `OWNER` — a tenant can only have one (the API rejects a second).

```bash
curl -X POST http://localhost:8080/api/platform-admin/tenants/<TENANT_ID>/users \
  -H "Content-Type: application/json" \
  -H "X-Platform-Admin-Key: dev-only-change-me" \
  -d '{
    "username": "rsharma",
    "password": "Passw0rd!",
    "fullName": "Rakesh Sharma",
    "role": "OWNER",
    "email": "rakesh@example.com",
    "contactNumber": "9876500000"
  }'
```
- `role`: `OWNER` | `ADMIN` | `TECHNICIAN`
- `email` and `contactNumber` are optional

Add more team members the same way (role `ADMIN` or `TECHNICIAN`):
```bash
curl -X POST http://localhost:8080/api/platform-admin/tenants/<TENANT_ID>/users \
  -H "Content-Type: application/json" \
  -H "X-Platform-Admin-Key: dev-only-change-me" \
  -d '{"username":"tech1","password":"Passw0rd!","fullName":"Amit Kumar","role":"TECHNICIAN"}'
```

The API enforces the same two rules the shell script used to: a tenant can never exceed its seat limit, and a tenant can never have more than one `OWNER`.

### List a tenant's users

```bash
curl http://localhost:8080/api/platform-admin/tenants/<TENANT_ID>/users \
  -H "X-Platform-Admin-Key: dev-only-change-me"
```

Once a user is created, log in at the frontend with that username/password.

### If there's already a bootstrap tenant

Fresh migrations auto-create a tenant called `Default Business` with no users. Find its id via the list-tenants call above, then provision a user against it the same way as any other tenant.
