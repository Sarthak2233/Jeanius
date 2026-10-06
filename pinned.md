### What Was Configured in the Monorepo

1. **Root [`.env.example`](file:///home/sarakb/projects/Jeanius/.env.example):** Fully documented template committed to git.
2. **Root [`.env`](file:///home/sarakb/projects/Jeanius/.env):** Created and pre-filled with local development defaults. Strictly git-ignored so your credentials will never leak into git.
3. **Automatic App Symlinks:** 
   - `apps/storefront/.env.local` ➔ `../../.env`
   - `apps/admin/.env.local` ➔ `../../.env`
   - `packages/database/.env` ➔ `../../.env`
   *(You only ever have to edit the single `.env` file at the root, and all apps/packages instantly pick up the changes!)*
4. **Typed Schema Updated:** [`packages/config/src/index.ts`](file:///home/sarakb/projects/Jeanius/packages/config/src/index.ts) now validates `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_ADMIN_URL`.

---

### Prerequisites in `.env` for State 05 (Auth & Security)

For **State 05 (Supabase Auth & Security)**, you need the following 6 environment variables:

| Variable | Scope | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Your Supabase Project API URL (`https://<project-ref>.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Safe public anonymous key for browser authentication (login/signup forms, session refresh). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-Only** | Privileged admin key that bypasses RLS. Used by Next.js Server Actions to manage customer profiles and assign roles. **Never expose to the browser!** |
| `SUPABASE_JWT_SECRET` | **Server-Only** | Used by Next.js middleware and server guards to verify incoming user JWT sessions. |
| `DATABASE_URL` | Server-Only | Postgres connection string via Supavisor pooler (port `6543`, transaction mode) for Drizzle queries. |
| `DIRECT_URL` | Server-Only | Direct Postgres connection string (port `5432`) used when running database migrations. |

---

### Step-by-Step Guide: Setting Up Supabase (Free Account)

Supabase provides a generous **Free Tier** (includes 2 free projects, full PostgreSQL database, Auth with email confirmation, password resets, and Supabase Studio dashboard).

#### Step 1: Create Your Supabase Account
1. Open [https://supabase.com](https://supabase.com) in your browser.
2. Click **Start your project** (or **Sign In** in the top right).
3. Sign up using **GitHub** (recommended for developers, 1-click authorization) or with your email address.

#### Step 2: Create a New Project
1. In your dashboard, click **"New project"**.
2. If prompted, create a free organization (e.g., `Jeanius`).
3. Fill in the project details:
   - **Name:** `jeanius` (or `jeanius-dev`)
   - **Database Password:** Click **Generate a password** (or enter a strong password). **IMPORTANT:** Copy this password and save it somewhere secure right now—you will need it for your `DATABASE_URL`.
   - **Region:** Choose the region nearest to you (e.g. `ap-south-1 (Mumbai)` or `ap-southeast-1 (Singapore)` for South Asia, or `us-east-1` for US).
   - **Pricing Plan:** Select **Free ($0/month)**.
4. Click **Create new project**. Supabase will spend ~1 to 2 minutes provisioning your PostgreSQL database.

#### Step 3: Copy Your Keys to `.env`
Once the project dashboard finishes loading:

1. **Get Project URL & API Keys:**
   - In the left sidebar, click the **Project Settings** (gear icon at the bottom).
   - Click **API** under Configuration.
   - Copy **Project URL** (`https://xxxxxxxx.supabase.co`) ➔ Paste into `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`.
   - Under **Project API keys**, copy the `anon` / `public` key ➔ Paste into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Click **Reveal** next to `service_role` and copy it ➔ Paste into `SUPABASE_SERVICE_ROLE_KEY`.
   - Scroll down to **JWT Settings** and copy **JWT Secret** ➔ Paste into `SUPABASE_JWT_SECRET`.

2. **Get Database Connection Strings:**
   - In the left sidebar, go to **Project Settings** ➔ **Database**.
   - Scroll down to the **Connection string** section and select the **URI** tab:
     - Under **Mode**, select **Transaction** (port `6543`) ➔ Copy the URI, replace `[YOUR-PASSWORD]` with the password you saved in Step 2, and paste it into `DATABASE_URL`.
     - Under **Mode**, select **Session** (port `5432`) ➔ Copy the URI, replace `[YOUR-PASSWORD]`, and paste it into `DIRECT_URL`.

#### Step 4: Configure Auth URLs for Next.js
In the left sidebar, go to **Authentication** ➔ **URL Configuration**:
1. Set **Site URL** to:
   ```
   http://localhost:3000
   ```
2. In the **Redirect URLs** section, click **Add URL** and add:
   ```
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   http://localhost:3001/**
   http://localhost:3001/auth/callback
   ```
   *(Port `3000` is the Storefront app, and Port `3001` is the Admin app).*
3. *(Optional for quick dev)* Go to **Authentication** ➔ **Providers** ➔ **Email**:
   - If you do not want to click email confirmation links every time you create a test user, uncheck **Confirm email**.

---

### Alternative: Local Supabase (Docker)

If you prefer to run completely offline without creating a cloud account right now:
- Because Docker is already installed on your machine, your `.env` is **already pre-filled** with local defaults (`http://localhost:54321`, `postgres://postgres:postgres@localhost:54322/postgres`).
- You can spin up the local Supabase stack at any time with:
  ```bash
  npx supabase start
  ```

### 2. Is `supabase` Version `2.119.0` Installed Globally?

**No. It is 100% LOCAL to this project.**

- It was installed as a project development dependency via `pnpm add -D supabase -w`.
- Look at your [`package.json`](file:///home/sarakb/projects/Jeanius/package.json#L24):
  ```json
  "devDependencies": {
    "supabase": "^2.119.0"
  }
  ```
- The actual binary was downloaded strictly into:
  `/home/sarakb/projects/Jeanius/node_modules/.bin/supabase`

#### How you can verify this:
If you open a new terminal in any other folder on your computer (like `cd ~`) and type `supabase`, your computer will output:
```bash
bash: supabase: command not found
```
Nothing was installed globally on your Fedora system. This is the **Node.js best practice**: keeping the tool inside `devDependencies` guarantees that any teammate who clones this project gets the exact same Supabase version without having to install global software.

---

### 3. How Does `pnpm run db:start` Work and Find `config.toml`?

Here is the exact step-by-step mechanism of how `pnpm run db:start` connects to Docker and reads the `.toml` file:

```
1. You type: pnpm run db:start
   │
   ▼
2. pnpm inspects package.json line 17:
   "db:start": "supabase start"
   │
   ▼
3. pnpm temporarily prepends your local ./node_modules/.bin to your PATH
   It executes: ./node_modules/.bin/supabase start
   │
   ▼
4. The local supabase executable runs in your current folder:
   /home/sarakb/projects/Jeanius
   │
   ▼
5. Supabase CLI automatically searches for:
   ./supabase/config.toml
   │
   ▼
6. It parses config.toml:
   - Reads [studio] port = 54323
   - Reads [db] port = 54322
   - Reads [api] port = 54321
   - Reads [storage.buckets]
   │
   ▼
7. It sends API commands to your local Docker daemon (/var/run/docker.sock)
   telling Docker to start the 12 containers with those exact ports.
```

Because `supabase` is now located directly at `./supabase/config.toml`, the CLI discovers the config file natively with zero configuration.

Viewed config.toml:17-41

### Part 1: How Step 6 & Step 7 Work Behind the Scenes

#### Deep Dive into Step 6: How the CLI Parses `config.toml`

The `supabase` CLI is a Go program. When you run `supabase start`:
1. It opens and parses `./supabase/config.toml` using a TOML parser.
2. It extracts configuration into variables:
   - `project_id = "jeanius-local"` ➔ This string becomes the Docker namespace. Every container, network, and storage volume Docker creates will be tagged with `_jeanius-local` to prevent collisions with other projects on your machine.
   - `[db] port = 54322` ➔ Tells Docker to forward port `54322` on your laptop to port `5432` inside the PostgreSQL container.
   - `[studio] port = 54323` ➔ Tells Docker to forward port `54323` on your laptop to port `3000` inside the Next.js Studio container.
   - `[api] port = 54321` ➔ Tells Docker to forward port `54321` on your laptop to port `8000` inside the Kong API Gateway container.
   - `[auth] site_url = "http://localhost:3000"` ➔ Transformed into an environment variable (`GOTRUE_SITE_URL=http://localhost:3000`) injected into the GoTrue Auth container.
   - `[storage.buckets.product-media]` ➔ Tells the CLI to execute an automated post-start SQL command that inserts `product-media` into the PostgreSQL `storage.buckets` table.

---

#### Deep Dive into Step 7: How the CLI Talks to Docker

How does a CLI tool on your terminal make Docker containers appear?

```
┌───────────────────────────┐
│       supabase start      │
└─────────────┬─────────────┘
              │ 
              │ Sends REST API requests via UNIX socket
              ▼
┌───────────────────────────┐
│    /var/run/docker.sock   │  (The local Docker daemon socket)
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│     Docker Daemon Engine  │
└─────────────┬─────────────┘
              ├── 1. Creates Docker Network ("supabase_network_jeanius-local")
              ├── 2. Creates Named Volumes for data persistence
              ├── 3. Spawns 12 Isolated Linux Containers
              └── 4. Sets up Linux iptables Port Forwarding
```

1. **Talking via `/var/run/docker.sock`:**
   In Linux, Docker runs as a background system daemon (`dockerd`). Applications communicate with Docker by sending standard HTTP REST commands over a Unix domain socket located at `/var/run/docker.sock`. The Supabase CLI uses the official Docker Go SDK to send these commands.
2. **Creating the Virtual Network:**
   The CLI tells Docker: `POST /networks/create`. This creates a private internal virtual bridge network (`supabase_network_jeanius-local`). Inside this network, containers can talk to each other using their container names (Docker DNS). For example:
   - Kong reaches Auth at `http://supabase_auth_jeanius-local:9999`
   - Studio reaches Postgres at `supabase_db_jeanius-local:5432`
3. **Container Creation & Volume Mounting:**
   The CLI calls Docker's container creation API, passing:
   - Environment variables (database passwords, JWT secrets)
   - Volume mounts (local `./supabase/migrations` and `./supabase/seed.sql`)
4. **Port Binding:**
   The CLI tells Docker to map host ports to container ports. When your browser opens `localhost:54323`, the Linux kernel forwards the TCP packets directly into the Studio container.

---

### Part 2: Step-by-Step Hands-On Reset & Rebuild Guide

Follow these exact steps in your terminal to wipe the entire local Supabase cluster and rebuild it from scratch yourself.

---

#### Step A: Stop and Completely Delete Existing Containers & Volumes

Run this command in your terminal:

```bash
pnpm exec supabase stop --no-backup
```

> **What this does:**
> The `--no-backup` flag tells the Supabase CLI to not only stop the 12 containers, but to **completely delete their Docker containers and database volumes**. Your local database will be wiped clean.

To verify that all Supabase containers are completely gone:

```bash
docker ps -a --filter "name=supabase_"
```
*(This should return an empty list with only the column headers).*

---

#### Step B: (Optional) Delete Downloaded Docker Images to Test Full Download

If you also want to delete the cached images so you can see Docker download them again from scratch:

```bash
docker rmi $(docker images -q "public.ecr.aws/supabase/*")
```

Verify that the images are removed:
```bash
docker images | grep supabase
```

---

#### Step C: Start Supabase From Scratch

Now, launch the cluster using our root script:

```bash
pnpm run db:start
```

**What you will observe in the terminal:**
1. If you deleted the images in Step B, you will see Docker pull each layer from AWS ECR.
2. You will see:
   ```
   Starting database...
   Initialising schema...
   Applying migration 20261001162500_initial_schema.sql...
   Applying migration 20261003002000_jewellery_vertical.sql...
   Applying migration 20261004143900_enable_rls.sql...
   Seeding data from supabase/seed.sql...
   ```
3. Once ready, it prints the green summary block containing:
   - `STUDIO_URL: http://127.0.0.1:54323`
   - `API_URL: http://127.0.0.1:54321`
   - `DB_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres`

---

#### Step D: Verify the Running Containers

Inspect the newly created containers:

```bash
docker ps
```
You will see all 12 containers running and `healthy`.

Check the connection status at any time:
```bash
pnpm run db:status
```

---

#### Step E: Push Drizzle Schema & Seed TypeScript Data

Sync the latest Drizzle schemas (including atelier measurements and craft preferences) and populate the database:

```bash
# 1. Push Drizzle schema to PostgreSQL
pnpm run db:push

# 2. Run the TypeScript database seed script
pnpm run db:seed
```

---

#### Step F: Start the Next.js Dev Servers

Start Storefront and Admin in parallel:

```bash
pnpm run dev
```

---

#### Step G: Open and Explore in Your Browser

1. Open **Supabase Studio Dashboard:**
   👉 **[http://localhost:54323](http://localhost:54323)**
   - Click **Table Editor** on the left menu.
   - Click `users_profile` to see the atelier users.
   - Click `products` to see the OM & DROP collections.
   - Click `fabric_bolts` to see Kurabo & Kuroki denim inventory.
2. Open **Storefront App:**
   👉 **[http://localhost:3000](http://localhost:3000)**
3. Open **Admin App:**
   👉 **[http://localhost:3001](http://localhost:3001)**
4. Open **Local Email Server (Inbucket):**
   👉 **[http://localhost:54324](http://localhost:54324)** (captures test signup/auth emails)