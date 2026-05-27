# Open-Source PR Submission Guide

**GitHub user:** `emreyn1`  
**Status:** PRs opened (May 2026)

| Repo | PR |
|------|-----|
| shadcn-ui/ui | https://github.com/shadcn-ui/ui/pull/10736 |
| vercel/ai | https://github.com/vercel/ai/pull/15578 |
| drizzle-orm | https://github.com/drizzle-team/drizzle-orm/pull/5799 |

**Skipped (low merge chance):** Next.js #42846 — 15+ competing PRs.

Branches are prepared locally under `oss-pr-workspace/`.

## 1. shadcn/ui — Fixes #10690

**Repo:** `oss-pr-workspace/shadcn-ui-fork`  
**Branch:** `fix/calendar-remove-table-classname-rdp10`  
**Files changed:**
- `apps/v4/registry/new-york-v4/ui/calendar.tsx`
- `apps/v4/registry/new-york-v4/examples/calendar-hijri.tsx`

**PR title:** `fix(calendar): remove deprecated table className for react-day-picker v10`

**PR body:**
```
Fixes #10690

react-day-picker v10 removed the deprecated `table` key from `ClassNames`.
The new-york-v4 calendar template failed `tsc --noEmit` with TS2353.

Remove the non-load-bearing `table: "w-full border-collapse"` entry.
Layout is already handled by `weekdays` / `week` / `month_grid` classNames in v10.
```

```bash
cd oss-pr-workspace/shadcn-ui-fork
git checkout -b fix/calendar-remove-table-classname-rdp10
git add apps/v4/registry/new-york-v4/ui/calendar.tsx apps/v4/registry/new-york-v4/examples/calendar-hijri.tsx
git commit -m "fix(calendar): remove deprecated table className for react-day-picker v10"
git push -u origin fix/calendar-remove-table-classname-rdp10
```

---

## 2. Vercel AI SDK — Fixes #14705

**Repo:** `oss-pr-workspace/vercel-ai-fork`  
**Branch:** `docs/fix-next-openai-links`

**PR title:** `docs: fix broken examples/next-openai links`

**PR body:**
```
Fixes #14705

The `examples/next-openai` directory was renamed/removed; links returned 404.

- Point UI overview Next.js link to `examples/next`
- Update Langfuse doc template link
- Fix human-in-the-loop cookbook link (remove stale /test-tool-approval reference)
- Fix ai-e2e-next Vercel deploy button URL
```

```bash
cd oss-pr-workspace/vercel-ai-fork
git checkout -b docs/fix-next-openai-links
git add content/docs/04-ai-sdk-ui/01-overview.mdx \
  content/providers/05-observability/langfuse.mdx \
  content/cookbook/01-next/75-human-in-the-loop.mdx \
  examples/ai-e2e-next/README.md
git commit -m "docs: fix broken examples/next-openai links"
git push -u origin docs/fix-next-openai-links
```

---

## 3. Drizzle ORM — Fixes #1826

**Repo:** `oss-pr-workspace/drizzle-orm-fork`  
**Branch:** `fix/condition-expression-boolean-types`

**Note:** Open PR #5226 exists with similar scope. Reference it in your PR or coordinate with @190n.

**PR title:** `fix: return typed SQL<boolean> for isNull/isNotNull in select`

**PR body:**
```
Fixes #1826

Conditional helpers `isNull`, `isNotNull`, `exists`, and `notExists` returned untyped `SQL`,
so select fields inferred as `unknown` instead of `boolean`.

- Type comparison operators via `SQL<boolean>` on `BinaryOperator`
- Use `sql<boolean | null>` for nullable boolean conditions
- Add type test `drizzle-orm/type-tests/pg/is-null-select.ts`
```

```bash
cd oss-pr-workspace/drizzle-orm-fork
git checkout -b fix/condition-expression-boolean-types
git add drizzle-orm/src/sql/expressions/conditions.ts drizzle-orm/type-tests/pg/is-null-select.ts
git commit -m "fix: return typed SQL<boolean> for isNull/isNotNull in select"
git push -u origin fix/condition-expression-boolean-types
```

---

## 4. Next.js — Fixes #42846

**Repo:** `oss-pr-workspace/nextjs-fork`  
**Branch:** `fix/apptype-generic-top-level-props`  
**Target branch:** `canary` (not `main`)

**Note:** PR #85293 is the maintainer-preferred approach; this branch mirrors that fix.

**PR title:** `fix(types): apply AppType generic to top-level props instead of pageProps`

**PR body:**
```
Fixes #42846

`AppType<P>` incorrectly applied `P` to `pageProps` via `AppPropsType<any, P>`.
Custom props from `getInitialProps` are available at the top level at runtime.

- Intersect `P` with `AppInitialProps` for InitialProps
- Intersect `P` with `AppPropsType<any, unknown>` for component props
- Add regression test under `test/types/apptype-custom-props/`
```

```bash
cd oss-pr-workspace/nextjs-fork
git checkout -b fix/apptype-generic-top-level-props
git add packages/next/src/shared/lib/utils.ts \
  test/types/apptype-custom-props/app-type.test.ts \
  test/types/apptype-custom-props/tsconfig.json
git commit -m "fix(types): apply AppType generic to top-level props instead of pageProps"
git push -u origin fix/apptype-generic-top-level-props
# Open PR against canary
```

---

## Fork setup (one-time)

```bash
# Replace YOUR_USER with your GitHub username
for repo in shadcn-ui-fork vercel-ai-fork drizzle-orm-fork nextjs-fork; do
  cd oss-pr-workspace/$repo
  git remote add fork https://github.com/YOUR_USER/ui.git  # adjust per repo
done
```

| Local folder | Upstream remote |
|--------------|-----------------|
| shadcn-ui-fork | github.com/shadcn-ui/ui |
| vercel-ai-fork | github.com/vercel/ai |
| drizzle-orm-fork | github.com/drizzle-team/drizzle-orm |
| nextjs-fork | github.com/vercel/next.js |
