#!/usr/bin/env bash
#
# manage-tenants.sh
#
# Manual tenant / team-member management for the RO Service Manager,
# until the real signup page + Razorpay billing exist. Talks to Postgres
# in one of two ways, controlled by DB_MODE:
#   - DB_MODE=local  (default) - a local `psql` install, connecting to a
#     Postgres instance running directly on your machine.
#   - DB_MODE=docker - `docker exec psql` against the Postgres container
#     from docker-compose.yml (only relevant if you switch back to that).
#
# Enforces the two rules the app itself doesn't enforce yet at the API
# layer:
#   1. A tenant can never have more enabled users than its seat_limit
#      (seat_limit = NULL means unlimited, used for Enterprise deals).
#   2. A tenant can never have more than one OWNER.
#
# When the real "invite team member" endpoint gets built later, move
# these same two checks into the service layer - the query is the
# same either way, so there's no rework, just a new home for it.
#
# Usage:
#   ./manage-tenants.sh create-tenant "Business Name" <PLAN_TIER> <SEAT_LIMIT|-> [STATUS]
#   ./manage-tenants.sh add-user <tenant-name-or-id> <username> <password> "<Full Name>" <ROLE> [email] [contact_number]
#   ./manage-tenants.sh list-tenants
#   ./manage-tenants.sh list-users <tenant-name-or-id>
#   ./manage-tenants.sh set-seat-limit <tenant-name-or-id> <new-limit|->
#   ./manage-tenants.sh deactivate-user <username>
#   ./manage-tenants.sh roles
#
# Examples:
#   ./manage-tenants.sh create-tenant "Sharma RO Services" SMALL 2 ACTIVE
#   ./manage-tenants.sh add-user "Sharma RO Services" rsharma Passw0rd! "Rakesh Sharma" OWNER rakesh@example.com 9876500000
#   ./manage-tenants.sh add-user "Sharma RO Services" tech1 Passw0rd! "Amit Kumar" TECHNICIAN
#   ./manage-tenants.sh list-tenants
#   ./manage-tenants.sh set-seat-limit "Sharma RO Services" 5
#
# PLAN_TIER   : SMALL | GROWING | MULTI_BRANCH | ENTERPRISE
# STATUS      : TRIAL | ACTIVE | SUSPENDED           (default: ACTIVE)
# ROLE        : OWNER | ADMIN | TECHNICIAN
# SEAT_LIMIT  : a number, or "-" for unlimited (NULL)
#
# DB connection overrides (defaults assume a local Postgres matching
# docker-compose's fallback credentials - override any of these as env
# vars if yours differ, e.g.:
#   DB_PASSWORD=mysecret DB_NAME=ro_service_manager ./manage-tenants.sh list-tenants
#
#   DB_MODE      : local | docker              (default: local)
#   DB_HOST      : local Postgres host          (default: localhost)
#   DB_PORT      : local Postgres port          (default: 5432)
#   DB_USER      : Postgres role                (default: postgres)
#   DB_PASSWORD  : Postgres role's password     (default: postgres)
#   DB_NAME      : database name                (default: ro_service_manager)
#   DB_CONTAINER : container name, DB_MODE=docker only (default: ro_service_manager_db)

set -euo pipefail

# ---------------------------------------------------------------------------
# Config - override via env vars if your setup differs.
# ---------------------------------------------------------------------------
DB_MODE="${DB_MODE:-local}"                 # local | docker
DB_HOST="${DB_HOST:-localhost}"             # only used when DB_MODE=local
DB_PORT="${DB_PORT:-5432}"                  # only used when DB_MODE=local
DB_CONTAINER="${DB_CONTAINER:-ro_service_manager_db}"  # only used when DB_MODE=docker
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"      # only used when DB_MODE=local
DB_NAME="${DB_NAME:-ro_service_manager}"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

die() {
    echo "Error: $*" >&2
    exit 1
}

psql_exec() {
    # Runs a SQL statement/query against Postgres.
    # -tA = tuples only, unaligned (easy to parse in bash); -v ON_ERROR_STOP=1
    # so a failed statement aborts the script instead of continuing silently.
    if [ "$DB_MODE" = "local" ]; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            -v ON_ERROR_STOP=1 -tA "$@"
    else
        docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
            -v ON_ERROR_STOP=1 -tA "$@"
    fi
}

require_docker_container() {
    if [ "$DB_MODE" = "local" ]; then
        if ! command -v psql >/dev/null 2>&1; then
            die "psql is not installed or not on PATH. Install the Postgres client tools (e.g. 'winget install PostgreSQL.PostgreSQL' or via your Postgres installer's 'Command Line Tools' component)."
        fi
        if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' >/dev/null 2>&1; then
            die "Can't connect to Postgres at $DB_HOST:$DB_PORT as user '$DB_USER' (database '$DB_NAME'). Check that Postgres is running and DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME are correct (override via env vars), and that the '$DB_NAME' database exists."
        fi
    else
        if ! docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
            die "Postgres container '$DB_CONTAINER' is not running. Start it with: docker compose up -d postgres"
        fi
    fi
}

sql_escape() {
    # Escapes a single quote for safe embedding inside a SQL string literal.
    printf '%s' "$1" | sed "s/'/''/g"
}

hash_password() {
    # Produces a bcrypt hash Spring Security's BCryptPasswordEncoder can
    # verify. Tries python3+bcrypt first, falls back to htpasswd (Apache
    # utils), since neither is guaranteed to be installed everywhere.
    local plain="$1"

    if command -v python3 >/dev/null 2>&1 && python3 -c "import bcrypt" >/dev/null 2>&1; then
        python3 -c "
import bcrypt, sys
print(bcrypt.hashpw(sys.argv[1].encode(), bcrypt.gensalt(rounds=10)).decode())
" "$plain"
        return
    fi

    if command -v htpasswd >/dev/null 2>&1; then
        # htpasswd emits '<dummy-user>:$2y$...' - strip everything before ':'.
        # Spring Security's bcrypt matcher accepts the $2y$ prefix.
        htpasswd -nbBC 10 dummy "$plain" | cut -d: -f2
        return
    fi

    die "No bcrypt tool available. Install one of:
    pip3 install bcrypt
    apt-get install apache2-utils   (provides htpasswd)
    brew install httpd              (provides htpasswd on macOS)"
}

resolve_tenant_id() {
    # Accepts either a tenant UUID or a business name and echoes back the UUID.
    local input="$1"
    local escaped
    escaped="$(sql_escape "$input")"

    if [[ "$input" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]; then
        echo "$input"
        return
    fi

    local id
    id="$(psql_exec -c "SELECT id FROM tenants WHERE business_name = '${escaped}';")"
    id="$(echo "$id" | tr -d '[:space:]')"

    [ -z "$id" ] && die "No tenant found with business name '$input'."
    echo "$id"
}

print_role_permissions() {
    local role="$1"
    case "$role" in
        OWNER)
            cat >&2 <<'EOF'
  OWNER permissions: full visibility (sales, payments, reports), manages
  billing/subscription, adds/removes team members. Exactly one per tenant.
EOF
            ;;
        ADMIN)
            cat >&2 <<'EOF'
  ADMIN permissions: full visibility (sales, payments, reports), can manage
  technicians. Cannot manage billing or team membership.
EOF
            ;;
        TECHNICIAN)
            cat >&2 <<'EOF'
  TECHNICIAN permissions: sees only their assigned service calls and the
  customer/asset info needed for that job, plus their own notifications.
  No sales/revenue visibility.
EOF
            ;;
    esac
}

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

cmd_create_tenant() {
    local business_name="${1:?business name required}"
    local plan_tier="${2:?plan tier required (SMALL|GROWING|MULTI_BRANCH|ENTERPRISE)}"
    local seat_limit_raw="${3:?seat limit required (a number, or - for unlimited)}"
    local status="${4:-ACTIVE}"

    case "$plan_tier" in
        SMALL|GROWING|MULTI_BRANCH|ENTERPRISE) ;;
        *) die "Invalid plan tier '$plan_tier'. Must be SMALL, GROWING, MULTI_BRANCH, or ENTERPRISE." ;;
    esac

    case "$status" in
        TRIAL|ACTIVE|SUSPENDED) ;;
        *) die "Invalid status '$status'. Must be TRIAL, ACTIVE, or SUSPENDED." ;;
    esac

    local seat_limit_sql
    if [ "$seat_limit_raw" = "-" ]; then
        seat_limit_sql="NULL"
    else
        [[ "$seat_limit_raw" =~ ^[0-9]+$ ]] || die "Seat limit must be a positive number or '-' for unlimited."
        seat_limit_sql="$seat_limit_raw"
    fi

    local escaped_name
    escaped_name="$(sql_escape "$business_name")"

    local existing
    existing="$(psql_exec -c "SELECT id FROM tenants WHERE business_name = '${escaped_name}';" | tr -d '[:space:]')"
    [ -n "$existing" ] && die "A tenant named '$business_name' already exists (id: $existing)."

    local new_id
    new_id="$(psql_exec -c "
        INSERT INTO tenants (business_name, plan_tier, status, seat_limit, created_at, updated_at)
        VALUES ('${escaped_name}', '${plan_tier}', '${status}', ${seat_limit_sql}, now(), now())
        RETURNING id;
    " | tr -d '[:space:]')"

    echo "Created tenant '$business_name' (id: $new_id, plan: $plan_tier, seats: ${seat_limit_raw}, status: $status)"
}

cmd_add_user() {
    local tenant_input="${1:?tenant name or id required}"
    local username="${2:?username required}"
    local password="${3:?password required}"
    local full_name="${4:?full name required}"
    local role="${5:?role required (OWNER|ADMIN|TECHNICIAN)}"
    local email="${6:-}"
    local contact_number="${7:-}"

    case "$role" in
        OWNER|ADMIN|TECHNICIAN) ;;
        *) die "Invalid role '$role'. Must be OWNER, ADMIN, or TECHNICIAN." ;;
    esac

    local tenant_id
    tenant_id="$(resolve_tenant_id "$tenant_input")"

    # --- Seat limit enforcement ---
    local seat_limit current_seats
    seat_limit="$(psql_exec -c "SELECT seat_limit FROM tenants WHERE id = '${tenant_id}';" | tr -d '[:space:]')"
    current_seats="$(psql_exec -c "SELECT COUNT(*) FROM users WHERE tenant_id = '${tenant_id}' AND enabled = true;" | tr -d '[:space:]')"

    if [ -n "$seat_limit" ] && [ "$current_seats" -ge "$seat_limit" ]; then
        die "Tenant is at its seat limit ($current_seats/$seat_limit). Deactivate a user or raise the limit with set-seat-limit first."
    fi

    # --- One-owner-per-tenant enforcement ---
    if [ "$role" = "OWNER" ]; then
        local existing_owner
        existing_owner="$(psql_exec -c "SELECT username FROM users WHERE tenant_id = '${tenant_id}' AND role = 'OWNER' AND enabled = true;" | tr -d '[:space:]')"
        [ -n "$existing_owner" ] && die "Tenant already has an OWNER ('$existing_owner'). A tenant can only have one."
    fi

    local existing_username
    existing_username="$(psql_exec -c "SELECT username FROM users WHERE username = '$(sql_escape "$username")';" | tr -d '[:space:]')"
    [ -n "$existing_username" ] && die "Username '$username' is already taken."

    local hashed
    hashed="$(hash_password "$password")"

    local escaped_username escaped_full_name escaped_email escaped_contact
    escaped_username="$(sql_escape "$username")"
    escaped_full_name="$(sql_escape "$full_name")"
    escaped_email="$(sql_escape "$email")"
    escaped_contact="$(sql_escape "$contact_number")"

    local email_sql contact_sql
    email_sql="$([ -z "$email" ] && echo "NULL" || echo "'${escaped_email}'")"
    contact_sql="$([ -z "$contact_number" ] && echo "NULL" || echo "'${escaped_contact}'")"

    psql_exec -c "
        INSERT INTO users (tenant_id, username, password, full_name, role, email, contact_number, enabled, created_at, updated_at)
        VALUES ('${tenant_id}', '${escaped_username}', '${hashed}', '${escaped_full_name}', '${role}', ${email_sql}, ${contact_sql}, true, now(), now());
    " >/dev/null

    echo "Created user '$username' ($role) in tenant $tenant_id. Seats used: $((current_seats + 1))$( [ -n "$seat_limit" ] && echo "/$seat_limit" || echo " (unlimited)" )"
    print_role_permissions "$role"
}

cmd_list_tenants() {
    psql_exec -c "
        SELECT t.business_name, t.plan_tier, t.status,
               COALESCE(t.seat_limit::text, 'unlimited') AS seat_limit,
               COUNT(u.id) FILTER (WHERE u.enabled = true) AS seats_used,
               t.id
        FROM tenants t
        LEFT JOIN users u ON u.tenant_id = t.id
        GROUP BY t.id
        ORDER BY t.created_at;
    " -P border=2 -P format=aligned
}

cmd_list_users() {
    local tenant_input="${1:?tenant name or id required}"
    local tenant_id
    tenant_id="$(resolve_tenant_id "$tenant_input")"

    psql_exec -c "
        SELECT username, full_name, role, email, contact_number, enabled
        FROM users
        WHERE tenant_id = '${tenant_id}'
        ORDER BY role, username;
    " -P border=2 -P format=aligned
}

cmd_set_seat_limit() {
    local tenant_input="${1:?tenant name or id required}"
    local new_limit_raw="${2:?new seat limit required (a number, or - for unlimited)}"

    local tenant_id
    tenant_id="$(resolve_tenant_id "$tenant_input")"

    local new_limit_sql
    if [ "$new_limit_raw" = "-" ]; then
        new_limit_sql="NULL"
    else
        [[ "$new_limit_raw" =~ ^[0-9]+$ ]] || die "Seat limit must be a positive number or '-' for unlimited."
        new_limit_sql="$new_limit_raw"
    fi

    psql_exec -c "UPDATE tenants SET seat_limit = ${new_limit_sql}, updated_at = now() WHERE id = '${tenant_id}';" >/dev/null
    echo "Updated seat limit for tenant $tenant_id to ${new_limit_raw}"
}

cmd_deactivate_user() {
    local username="${1:?username required}"
    local escaped_username
    escaped_username="$(sql_escape "$username")"

    local affected
    affected="$(psql_exec -c "
        UPDATE users SET enabled = false, updated_at = now()
        WHERE username = '${escaped_username}'
        RETURNING username;
    " | tr -d '[:space:]')"

    [ -z "$affected" ] && die "No user found with username '$username'."
    echo "Deactivated user '$username'. Their seat is now free."
}

cmd_roles() {
    echo "Role permissions:"
    print_role_permissions OWNER
    print_role_permissions ADMIN
    print_role_permissions TECHNICIAN
}

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

main() {
    local command="${1:-}"
    [ -z "$command" ] && { grep '^#' "$0" | sed 's/^#//'; exit 1; }
    shift || true

    require_docker_container

    case "$command" in
        create-tenant)    cmd_create_tenant "$@" ;;
        add-user)         cmd_add_user "$@" ;;
        list-tenants)     cmd_list_tenants "$@" ;;
        list-users)       cmd_list_users "$@" ;;
        set-seat-limit)   cmd_set_seat_limit "$@" ;;
        deactivate-user)  cmd_deactivate_user "$@" ;;
        roles)            cmd_roles "$@" ;;
        *)                die "Unknown command '$command'. Run without arguments to see usage." ;;
    esac
}

main "$@"
