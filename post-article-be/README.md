# post-article-be

Article CRUD system built with **Go + Gin + GORM + MySQL**, structured as **microservices**: an `article-service` (domain + MySQL) fronted by an `api-gateway` (public edge / reverse proxy). One Go module, two independently deployable binaries/containers.

## Architecture

```
              ┌─────────────┐  /article*   ┌──────────────────┐  GORM   ┌───────┐
 client ──────▶ api-gateway ───────────────▶ article-service ──────────▶ MySQL │
 :8080        └─────────────┘  :8081       └──────────────────┘  `article`└───────┘
              (no DB, stateless)            (owns posts + validation)
```

| Service | Code | Default port | Owns data? |
|---|---|---|---|
| `api-gateway` | `gateway/cmd`, `gateway/internal/...` | `8080` (`GATEWAY_PORT`) | No — proxies `/article*` to `ARTICLE_SERVICE_URL`, reports downstream health |
| `article-service` | `cmd/api`, `internal/...` | `8081` (`APP_PORT`) | Yes — MySQL DB `article`, table `posts` |
| `mysql` | `docker-compose.yml` | `3306` | Persistent volume `mysql_data` |

Both services share the base-response envelope in `pkg/response` so clients parse one shape no matter which service answers.

## Why no gRPC (decision)

gRPC was evaluated for gateway → article-service traffic and deliberately **not** implemented:

- The public contract must stay **REST/JSON** per spec (endpoints + Postman collection target HTTP).
- There is only **one** internal hop with plain CRUD payloads — gRPC would add proto/codegenOps overhead with no measurable gain.
- The gateway is a transparent reverse proxy; protobuf buys nothing until there are multiple typed internal services, streaming, or polyglot backends.

If that changes, the migration path is: add `proto/article.proto`, generate with `protoc-gen-go`/`protoc-gen-go-grpc`, serve gRPC from article-service (new port), and let the gateway translate REST ↔ gRPC. Until then, REST + Postman collection stays the contract.

## Base response

Every endpoint returns this envelope (success and error alike):

```json
// success (single object)
{ "success": true, "message": "article created", "data": { "id": 1, "title": "..." } }

// success (list, with pagination meta)
{ "success": true, "message": "articles retrieved", "data": [ { } ], "meta": { "limit": 10, "offset": 0, "count": 3 } }

// error
{ "success": false, "error": "post not found" }
```

- `POST /article` → `201` + `"article created"`
- `GET /article/:limit/:offset` → `200` + `"articles retrieved"` + `meta {limit, offset, count}`
- `GET /article/:id` → `200` + `"article retrieved"`
- `PUT|PATCH /article/:id` → `200` + `"article updated"`
- `DELETE /article/:id` → `200` + `"article moved to trash"`, `data: {"id": N}` (soft-delete, row kept with `status=trash`); `DELETE /article/:id?hard=true` → `"article permanently deleted"`
- Validation / bad input → `400`, unknown id → `404`, gateway can't reach article-service → `502` (same envelope)
- `GET /health` (both services) → `200` + `"ok"`; the gateway's `data` also includes downstream `article_service` status (`up` / `down: ...`)

## Project structure

```
post-article-be/
├── cmd/api/main.go                    # article-service entrypoint
├── internal/
│   ├── config/config.go               # APP_PORT, DB_* (godotenv)
│   ├── database/mysql.go              # connect, CREATE DATABASE, AutoMigrate
│   ├── models/post.go                 # posts table (GORM)
│   ├── dto/post_dto.go                # request validation rules
│   ├── repositories/post_repository.go
│   ├── services/post_service.go
│   ├── handlers/post_handler.go       # uses pkg/response envelope
│   └── routes/routes.go
├── gateway/
│   ├── cmd/main.go                    # api-gateway entrypoint
│   ├── internal/config/config.go      # GATEWAY_PORT, ARTICLE_SERVICE_URL
│   ├── internal/proxy/proxy.go        # reverse proxy + aggregated /health
│   └── Dockerfile
├── pkg/response/response.go           # shared base response (Success/Paginated/Fail)
├── migrations/
│   ├── 000001_create_posts_up.sql
│   └── 000001_create_posts_down.sql
├── postman/post-article-be.postman_collection.json
├── Dockerfile                         # article-service image
├── docker-compose.yml                 # mysql + article-service + api-gateway
├── Makefile
├── .env / .env.example
├── .gitignore                         # binaries, .env, vendor, IDE, OS, logs
└── README.md
```

## Table `posts` (DB `article`)

| Column | Type | Validation |
|---|---|---|
| id | INT PK auto-increment | — |
| title | VARCHAR(255) | required, min 20 chars |
| content | TEXT | required, min 200 chars |
| category | VARCHAR(100) | required, min 3 chars |
| status | VARCHAR(100) | required, one of `publish`, `draft`, `trash` |
| created_date | TIMESTAMP | auto |
| updated_date | TIMESTAMP | auto |

> Spec note: `title: varchar(20), min 20 chars` is contradictory (VARCHAR(20) can't hold >20 chars).
> The column is `VARCHAR(255)` so the min-20 validation can actually pass; `CHECK(status IN ...)` mirrors the Go `oneof` validation.

## Endpoints (via gateway `:8080`)

| Method | Path | Description |
|---|---|---|
| POST | `/article` | Create article |
| GET | `/article/:limit/:offset` | List articles (e.g. `/article/10/0`); optional `?status=publish\|draft\|trash` filter |
| GET | `/article/:id` | Get by ID |
| PUT | `/article/:id` | Full update |
| PATCH | `/article/:id` | Same as PUT (full object per spec) |
| DELETE | `/article/:id` | Soft-delete → moves to `trash`; `?hard=true` for permanent delete |
| GET | `/health` | Gateway + downstream health |

Request — create / update:

```json
{
  "title": "This is a valid article title",
  "content": "...min 200 chars...",
  "category": "Technology",
  "status": "publish"
}
```

## How to run

### Option A — Docker Compose (recommended, full microservices)

```bash
cd post-article-be
docker compose up --build -d
# gateway:  http://localhost:8080 (public)
# article:  http://localhost:8081 (internal, direct access for debugging)
# mysql:    localhost:3306 (root/root, db `article`)
# migration auto-applied via /docker-entrypoint-initdb.d + GORM AutoMigrate
docker compose logs -f api-gateway article-service
docker compose down
```

### Option B — Local Go + MySQL (two terminals)

1. Start MySQL 8 and create DB (or let article-service create it):
   ```bash
   cp .env.example .env   # edit DB_* as needed
   mysql -h localhost -P 3306 -u root -p < migrations/000001_create_posts_up.sql
   ```
2. Run both services:
   ```bash
   go mod tidy
   go run ./cmd/api        # terminal 1 — article-service on :8081
   go run ./gateway/cmd    # terminal 2 — api-gateway on :8080
   ```

Via Makefile:

```bash
make build          # both binaries -> bin/server + bin/gateway
make run-article    # article-service only
make run-gateway    # gateway only (needs article-service up)
make migrate-up DB_PASS=root        # needs mysql client
make docker-up | make docker-down
```

## Postman

Import `postman/post-article-be.postman_collection.json` (variable `base_url` = `http://localhost:8080`, i.e. the gateway).
Covers: health, POST /article, GET /article/10/0, GET /article/1, PUT, PATCH, DELETE.
Note: responses now use the base-response envelope — `data` holds the article(s); list responses add `meta`.

## Quick smoke test (through the gateway)

```bash
curl -X POST localhost:8080/article -H "Content-Type: application/json" -d "{\"title\":\"This is a valid article title\",\"content\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor.\",\"category\":\"Technology\",\"status\":\"publish\"}"
curl localhost:8080/article/10/0
curl localhost:8080/article/1
curl localhost:8080/health
```
