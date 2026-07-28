<div align="center">

# 🏡 Porchlight

**A full-stack real estate platform with saved searches, role-based dashboards, and a real SQL search engine.**

*Built for the Devloria Web Development Internship — Full Stack Track*
*Project: Full Stack Real Estate Platform with Saved Searches*

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![sql.js](https://img.shields.io/badge/sql.js-WASM_SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sql.js.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#)

</div>

---

> **Note on inspiration:** Zillow's listing/search flow was used only as a *functional* reference point. All branding, layout, color system, and typography in Porchlight are original — see [Design](#-design-language) below.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Why sql.js Instead of Prisma?](#-why-sqljs-instead-of-prisma)
- [Getting Started](#-getting-started)
- [Demo Accounts](#-demo-accounts)
- [Project Structure](#-project-structure)
- [Design Language](#-design-language)
- [Scope & Trade-offs](#-scope--trade-offs)
- [Roadmap Ideas](#-roadmap-ideas)

---

## 🔎 Overview

Porchlight is a role-aware real estate marketplace where **agents** list and manage properties, **buyers** search, favorite, and save searches with live match counts, and **admins** oversee the platform. Every search and filter is executed as real parameterized SQL — nothing is faked with in-memory JavaScript filtering.

## ✨ Features

| Area | Details |
|---|---|
| 🔐 **Role-Based Auth** | Buyer / Agent / Admin roles, JWT sessions stored in httpOnly cookies |
| 🏘️ **Property CRUD** | Agents can create, edit, publish, mark pending/sold, or delete listings |
| 🔍 **Real Search Engine** | Location, price range, property type, beds/baths, status, and sort — all run as parameterized SQL, not client-side filtering |
| ❤️ **Buyer Accounts** | Favorites and named saved searches with a **live count** of current matches |
| 📩 **Inquiry System** | Buyer messages are stored on the listing and trigger a notification to the agent |
| 📊 **Agent Dashboard** | Stats (active listings, portfolio value, inquiry counts), listings table, and an inquiries inbox with read/responded status |

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| **Framework** | Next.js 14 (App Router), TypeScript |
| **Styling** | Tailwind CSS, self-hosted fonts (`@fontsource`) |
| **Database** | `sql.js` (SQLite compiled to WASM) via a hand-written repository layer (`src/lib/queries.ts`) |
| **Auth** | `jsonwebtoken` + `bcryptjs`, httpOnly cookie sessions |
| **Validation** | `zod` on every API route |
| **Notifications** | Console-logged dev transport, swappable for Resend/SMTP |

## 🤔 Why `sql.js` Instead of Prisma?

Prisma and native drivers like `better-sqlite3` require downloading a platform-specific binary at install/build time. In a network-restricted environment, that download isn't always available.

Porchlight instead uses **`sql.js`** — SQLite compiled to WebAssembly and shipped as a plain npm package. It's queried with real parameterized SQL (`src/lib/db.ts` + `src/lib/queries.ts`), so the data layer behaves exactly like a normal SQL backend. The on-disk database lives at `data/porchlight.sqlite3`.

> **Going to production?** (Vercel/Railway with full internet access) — swap `src/lib/db.ts` for Prisma or Drizzle against Postgres. `src/lib/schema.sql` translates directly, and nothing above the repository layer needs to change.

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env      # set JWT_SECRET to a random string

# 3. Seed the database
npm run seed               # creates data/porchlight.sqlite3 with demo data

# 4. Run the dev server
npm run dev
```

Then visit **[http://localhost:3000](http://localhost:3000)**.

> 💡 Re-running `npm run seed` is safe — it skips users that already exist and simply adds more listings.

## 👤 Demo Accounts

All demo accounts share the password `password123`.

| Email | Role |
|---|---|
| `agent@porchlight.dev` | Agent (own listings) |
| `theo@porchlight.dev` | Agent (own listings) |
| `buyer@porchlight.dev` | Buyer (sample favorites + saved searches) |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # Route handlers — auth, properties, favorites,
│   │                           # saved searches, inquiries, agent dashboard
│   ├── listings/               # Search page + [id] detail page
│   ├── dashboard/
│   │   ├── buyer/              # Favorites + saved searches
│   │   └── agent/              # Stats, listings table, inquiries, new/edit forms
│   ├── login/
│   └── register/
├── components/                 # Navbar, PropertyCard, SearchFilters, PropertyForm, ...
├── context/
│   └── AuthContext.tsx         # Client-side session state
└── lib/
    ├── db.ts                   # sql.js singleton + query helpers
    ├── queries.ts              # The repository layer — every SQL query lives here
    ├── schema.sql
    ├── auth.ts                 # JWT + bcrypt + session helpers
    ├── email.ts                # Inquiry notification service
    ├── types.ts
    ├── format.ts
    └── ids.ts

scripts/
└── seed.ts

data/
└── porchlight.sqlite3          # Created by `npm run seed` (gitignored)
```

## 🎨 Design Language

The **Porchlight** brand is a warm, quiet counterpoint to the typical real-estate-portal blue.

- **Palette** — parchment backgrounds, deep charcoal ink, and a signature **amber "beacon" accent**
- **Motif** — a small glowing dot recurring throughout the app (nav, badges, empty states), echoing the house-with-a-lit-door logo mark
- **Typography** — `Fraunces` (serif display) paired with `Inter` (UI text) and `IBM Plex Mono` (prices and data)

## ⚖️ Scope & Trade-offs

- **Images** are added by URL (Unsplash links, your own hosting, etc.) rather than file upload, keeping the project runnable without a storage provider. Swapping in Cloudinary or Supabase Storage would only touch the image field in `PropertyForm.tsx`.
- **Email notifications** log to the server console by default and are always recorded in-app on the `Inquiry` row. See `src/lib/email.ts` for the Resend integration point.

## 🗺️ Roadmap Ideas

- [ ] File-based image uploads (Cloudinary / Supabase Storage)
- [ ] Real email transport via Resend or SMTP
- [ ] Postgres + Prisma/Drizzle migration for production
- [ ] Map-based search view
- [ ] Admin moderation panel

---

<div align="center">

Made with 🕯️ for the Devloria Web Development Internship

</div>
