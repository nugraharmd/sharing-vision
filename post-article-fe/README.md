# post-article-fe

Client side for the Article system, built with **Next.js + TypeScript** (App Router). Talks to `post-article-be` through the api-gateway (`NEXT_PUBLIC_API_URL`, default `http://localhost:8080`).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- No UI framework — hand-written light theme in `app/globals.css` (CSS variables)
- `fetch`-based API client in `lib/api.ts`, DTOs in `types/article.ts`

## Project structure

```
post-article-fe/
├── app/
│   ├── layout.tsx            # navbar + footer shell
│   ├── page.tsx              # redirects to /posts
│   ├── globals.css           # light base theme
│   ├── posts/
│   │   ├── page.tsx          # All Posts: Published / Draft / Trashed tabs
│   │   ├── new/page.tsx      # Create Article
│   │   └── [id]/edit/page.tsx# Edit Article
│   └── preview/
│       ├── page.tsx          # Published blog list (10/page)
│       └── [id]/page.tsx     # Blog detail
├── components/
│   ├── Navbar.tsx            # top navigation
│   ├── Tabs.tsx              # generic tab bar (reusable)
│   ├── PostTable.tsx         # title / category / actions list (reusable)
│   ├── PostForm.tsx          # create/edit form + validation (reusable)
│   ├── PostCard.tsx          # preview card (reusable)
│   ├── Pagination.tsx        # prev/next pager (reusable)
│   ├── StatusBadge.tsx       # publish/draft/thrash pill
│   ├── IconButton.tsx        # icon-only action button (icon + title tooltip)
│   ├── icons.tsx             # inline SVG icons (edit, trash, publish, draft…)
│   └── feedback.tsx          # Alert / Loading / EmptyState
├── lib/
│   ├── api.ts                # articleApi client (base response handling)
│   ├── validation.ts         # client rules mirroring BE (title ≥20, content ≥200, category ≥3)
│   └── format.ts             # date + excerpt helpers
├── types/article.ts          # ArticleStatus, Article, Create/Update DTOs, BaseResponse, tabs
├── Dockerfile / .dockerignore
├── .env / .env.example       # NEXT_PUBLIC_API_URL
└── README.md
```

## Types & base response (mirrors BE)

```ts
type ArticleStatus = "publish" | "draft" | "thrash";
interface Article { id; title; content; category; status; created_date; updated_date; }
interface BaseResponse<T> { success: boolean; message?: string; data?: T; meta?: PageMeta | null; error?: string; }
```

`articleApi` unwraps the envelope and throws `Error(error)` when `success === false`, so pages only deal with `Article[]` / `Article`. List responses use the BE pagination meta (`limit`, `offset`, `count`).

## Pages

| Page | Description |
|---|---|
| `/posts` (All Posts) | Tabs **Published / Draft / Trashed**. Each row shows **title, category, actions** (icon-only buttons with `title` tooltips). Edit icon opens the edit page; publish/draft icons flip status in place; trash icon soft-deletes (`DELETE /article/:id` → moves to Trash tab). Trash tab offers restore-to-publish/draft, edit, and permanent delete (`?hard=true`, with confirm). Lists paginate 10/page. |
| `/posts/new` (Create Article) | Fields **title, content, category** + **Publish** / **Save as Draft** buttons. Client validation mirrors BE; redirects to the matching tab. |
| `/posts/[id]/edit` | Same form prefilled; `PUT /article/:id` on save. |
| `/preview` (Preview) | Blog grid of **publish-status** articles only, **10 per page** (BE `limit/offset` + `?status=publish`, FE prev/next pager). |
| `/preview/[id]` | Full blog detail with category, status badge, date. |

## Backend dependency

Run the backend first (from `../post-article-be`):

```bash
docker compose up --build -d   # gateway :8080, article-service :8081, mysql :3306
```

New BE behavior this FE relies on (already implemented in `post-article-be`):
- `GET /article/:limit/:offset?status=publish|draft|thrash` — status filter for tabs + preview
- `DELETE /article/:id` — **soft-delete** (status → `thrash`), feeds the Trash tab
- `DELETE /article/:id?hard=true` — permanent delete (Trash tab only)

## How to run

```bash
cd post-article-fe
cp .env.example .env   # edit NEXT_PUBLIC_API_URL if gateway isn't on localhost:8080
npm install
npm run dev            # http://localhost:3000
```

Production:

```bash
npm run build
npm start              # http://localhost:3000
```

Docker (mirrors BE):

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080 -t post-article-fe .
docker run -p 3000:3000 post-article-fe
# or with env at runtime for server-side fetches:
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://api-gateway:8080 post-article-fe
```

> Note: `NEXT_PUBLIC_*` is baked in at **build** time — pass `--build-arg` matching your gateway URL when building the image.
