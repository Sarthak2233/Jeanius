# Atelier Content Management System (CMS) & Announcement Protocol

The Project 925 platform includes an integrated **Headless CMS and Site Notice Engine** designed specifically for editorial atelier storytelling (Kathmandu workshop stories, jewellery craft guides, terms, privacy) and real-time operational notices (drop countdowns, holiday workshop pauses, shipping delays).

---

## 1. System Architecture & End-to-End Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ADMIN OPERATOR WORKBENCH                        │
│             apps/admin/app/content/content-workbench-client.tsx        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Server Actions (auth + role check)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                              │
│         packages/application/src/content/content.service.ts            │
│         - Validates slug uniqueness, dates, statuses                   │
│         - Triggers RecordPrivilegedActionUseCase (Audit Log)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Repository Port Interface
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         DATABASE PERSISTENCE                           │
│         packages/database/src/repositories/content/                    │
│         - DrizzleContentPageRepository (content_pages table)           │
│         - DrizzleAnnouncementRepository (announcements table)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Server Actions / Next.js SSR
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        STOREFRONT CLIENT & SSR                         │
│  • AnnouncementBar (apps/storefront/components/announcement-bar.tsx)   │
│  • Core Pages: /about, /guide, /terms, /privacy, /returns              │
│  • Dynamic Slug Routing: apps/storefront/app/pages/[slug]/page.tsx     │
│  • Custom Renderer: AtelierMarkdown (editorial markdown parser)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. How to Use the CMS (Operator Guide)

### Accessing the Workbench
1. Navigate to the **Admin Console** at `/content` (or click **CMS** in the top navigation bar).
2. Authenticate with an account having role **`ADMIN`** or **`SUPPORT`**.

---

### A. Managing Editorial & Storytelling Pages (`PAGES` Tab)

The CMS manages two categories of pages:
* **System Core Pages:** Slugs matching core routes (`about`, `guide`, `terms`, `privacy`, `returns`). When published, the storefront routes automatically pull their live body content from the CMS.
* **Custom Atelier Stories:** Any custom slug (e.g., `kathmandu-silversmith-heritage`, `lost-wax-casting-method`, `silver-patina-process`). Once published, they are immediately accessible at `/pages/[slug]`.

#### Creating or Editing a Page:
1. Click **`+ Create New Page`** (or click **Edit** on an existing row).
2. Fill in the required metadata:
   * **Page Title:** The editorial display heading (e.g., *Artisan Silversmithing in Kathmandu*).
   * **URL Slug:** Clean alphanumeric identifier (e.g., `silver-craft-tradition`). Enforced lowercase and unique.
   * **SEO Meta Description:** Snippet used for search engines and social cards.
   * **Publication Status:** Choose between:
     * `DRAFT` — Hidden from public storefront visitors.
     * `PUBLISHED` — Publicly visible and indexed.
     * `ARCHIVED` — Retired from the public index.
3. **Drafting Content:**
   * Write content using the built-in Markdown editor.
   * Toggle **"Live Atelier Preview"** to see side-by-side rendering with authentic luxury typography, blockquotes, callout alerts, code blocks, and internal link routing.
4. Click **`Save Page`**. The action validates inputs, writes to the database, logs an audit entry, and revalidates the cache.

---

### B. Managing Operational Site Announcements (`ANNOUNCEMENTS` Tab)

Operational notices appear in the top sticky **Announcement Bar** across the entire storefront (e.g., *"Order-Made silver pieces require 14–21 workshop days"*).

#### Creating an Announcement:
1. Switch to the **`Operational Announcements`** tab in the workbench.
2. Click **`+ Post Announcement`**.
3. Configure the announcement:
   * **Notice Title:** Short bold prefix (e.g., *Workshop Notice*, *Autumn Silver Drop*).
   * **Notice Message:** The description text explaining the update.
   * **Notice Type:** Select the semantic level:
     * `INFO` (Neutral slate notice)
     * `WARNING` (Amber alert, e.g., impending shipping cutoffs)
     * `ALERT` (Red urgent notice, e.g., holiday closure)
     * `PROMO` (Gold luxury VIP announcement)
   * **Priority Rating (0–10):** Higher numbers take precedence. If multiple notices are active, the highest priority notice displays first.
   * **Start & End Dates:** Set scheduling boundaries. The notice will only render when the user's current timestamp falls between `startDate` and `endDate` (or indefinitely if no end date is set).
4. Click **`Save Announcement`**.

---

## 3. End-to-End Technical Working (Frontend to Backend)

### Layer 1: Domain Entities & Invariants
* [**`ContentPage`**](file:///home/sarakb/projects/Jeanius/packages/domain/src/content/content-page.entity.ts):
  * Holds `id`, `slug`, `title`, `contentMarkdown`, `metaDescription`, `status`, `isPublished`, and timestamps.
  * Invariants: Guarantees non-empty title and slug, normalizes slugs to trimmed lowercase, and manages state transitions via `.publish()`, `.archive()`, and `.unpublish()`.
* [**`Announcement`**](file:///home/sarakb/projects/Jeanius/packages/domain/src/content/announcement.entity.ts):
  * Holds `id`, `title`, `message`, `type`, `startDate`, `endDate`, and `priority`.
  * Invariants: Ensures end date is strictly after start date, and evaluates `.isActive(date)` against the clock.

---

### Layer 2: Application Layer (Use Cases & Ports)
* [**`ContentService`**](file:///home/sarakb/projects/Jeanius/packages/application/src/content/content.service.ts):
  * Encapsulates all CMS business logic decoupled from frameworks and SQL.
  * `getPageBySlug(slug, { allowDraft })`: Only returns published content to customers unless draft access is explicitly granted.
  * `createPage(dto)`: Enforces uniqueness constraints before writing.
  * `getActiveAnnouncements(at)`: Filters all active notices sorted by priority descending.
  * Repository Ports: [**`IContentPageRepository`**](file:///home/sarakb/projects/Jeanius/packages/application/src/content/content-page-repository.port.ts) and [**`IAnnouncementRepository`**](file:///home/sarakb/projects/Jeanius/packages/application/src/content/announcement-repository.port.ts).

---

### Layer 3: Database & Drizzle ORM
* [**`schema/content.ts`**](file:///home/sarakb/projects/Jeanius/packages/database/src/schema/content.ts):
  * `content_pages` table: Indexed by `slug` (unique) and `status`.
  * `announcements` table: Indexed by `priority` and date ranges, with a PostgreSQL check constraint ensuring `endDate > startDate`.
* [**`DrizzleContentPageRepository`**](file:///home/sarakb/projects/Jeanius/packages/database/src/repositories/content/drizzle-content-page.repository.ts):
  * Handles atomic persistence using `.onConflictDoUpdate` on the unique `slug` column.
* [**`DrizzleAnnouncementRepository`**](file:///home/sarakb/projects/Jeanius/packages/database/src/repositories/content/drizzle-announcement.repository.ts):
  * Queries active announcements using SQL conditions:
    `startDate <= now AND (endDate IS NULL OR endDate > now)` ordered by `priority DESC`.

---

### Layer 4: Admin Server Actions & Security
* [**`content.actions.ts` (Admin)**](file:///home/sarakb/projects/Jeanius/apps/admin/actions/content.actions.ts):
  * **Role Verification:** Extracts user from Supabase session; requires `ADMIN` or `SUPPORT` role.
  * **Audit Logging:** Employs [`RecordPrivilegedActionUseCase`](file:///home/sarakb/projects/Jeanius/packages/application/src/audit/record-privileged-action.use-case.ts) to write an immutable record into the `audit_logs` table for every page edit, publication, or announcement deletion.
  * **Cache Revalidation:** Calls `revalidatePath('/content')` to keep admin views in sync.

---

### Layer 5: Storefront Consumption & Rendering
* **Announcements:**
  * [**`AnnouncementBar`**](file:///home/sarakb/projects/Jeanius/apps/storefront/components/announcement-bar.tsx):
    * Invokes `getActiveAnnouncementsAction()` on mount.
    * Fallback: If no custom announcement is scheduled, displays default Order-Made atelier notice.
    * User Preference: Tracks dismissal in `sessionStorage` (`jj_announcement_dismissed`) so dismissed notices remain hidden for the session.
* **Core & Dynamic Pages:**
  * [**`ContentPageTemplate`**](file:///home/sarakb/projects/Jeanius/apps/storefront/components/content-page-template.tsx):
    * Reusable server component used across `/guide`, `/terms`, `/privacy`, and `/returns`.
    * Calls `getContentPageAction(slug)`. If found and published, it renders the CMS markdown; otherwise, it falls back to hardcoded default copy.
  * [**`DynamicContentPage`**](file:///home/sarakb/projects/Jeanius/apps/storefront/app/pages/%5Bslug%5D/page.tsx):
    * Catches arbitrary URLs at `/pages/[slug]`.
    * Implements `generateMetadata` for dynamic SEO `<title>` and `<meta name="description">`.
    * Returns Next.js `notFound()` if the slug is nonexistent or unpublished.
* **Markdown Parser:**
  * [**`AtelierMarkdown`**](file:///home/sarakb/projects/Jeanius/apps/storefront/components/atelier-markdown.tsx):
    * Pure client/server React parser with zero external runtime dependencies.
    * Parses headers, lists, links, inline code, bold, italics, blockquotes, and tables, formatted with atelier typography tokens.