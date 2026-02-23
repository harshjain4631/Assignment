# Smart Recipe Generator

> A web app that suggests recipes based on available ingredients (text or photo input).
> Built with Next.js 16, shadcn/ui, Tailwind CSS, Vercel AI SDK 6, and Firebase.

## Features

- **Ingredient Input** — type ingredients as text or upload a photo for AI recognition
- **AI Recipe Generation** — Gemini 3 Flash generates recipes from your ingredients
- **Recipe Database** — 23 hand-curated seed recipes across 11 cuisines
- **Smart Filters** — filter by difficulty, cooking time, cuisine, dietary tags
- **Serving Adjuster** — scale quantities and nutrition by serving size
- **Ratings & Favorites** — star ratings and save your favorite recipes
- **Personalized Suggestions** — recommendations based on your rating history
- **Substitution Suggestions** — ingredient alternatives for dietary needs

## Tech Stack

| Layer | Technology |
| --------- | -------------------------------------- |
| Framework | Next.js 16 (App Router + Turbopack) |
| UI | shadcn/ui + Tailwind CSS 4 |
| AI | Vercel AI SDK 6 + Google Gemini 3 Flash |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Google + Anonymous) |
| Storage | Firebase Storage |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore, Authentication (Google + Anonymous), and Storage
3. Generate a service account key for the Admin SDK

### 3. Set up Gemini AI

1. Get an API key from [aistudio.google.com](https://aistudio.google.com)

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`.

### 5. Seed the database

```bash
npx tsx scripts/seed-db.ts
```

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/                    # Next.js 16 App Router pages + API routes
  api/                  # Backend API routes
  recipes/              # Recipe listing + detail pages
  favorites/            # Saved favorites page
components/             # Reusable UI components
  ui/                   # shadcn/ui base components
lib/                    # Utilities, types, Firebase/AI setup
data/                   # Seed recipe JSON
scripts/                # Database seeding script
```

## Approach

Smart Recipe Generator uses AI-powered image recognition and natural language
generation to help users discover recipes from ingredients they already have.

**Architecture:** Built with Next.js 16 (App Router + Turbopack) for
server-rendered performance, shadcn/ui + Tailwind CSS for a clean responsive UI,
and Firebase Firestore for real-time data storage. The Vercel AI SDK 6 abstracts
AI provider calls, making it easy to swap models.

**Ingredient Recognition:** Users upload a photo of their ingredients. The image
is sent to Gemini 3 Flash via `generateObject()`, which returns a structured
list of detected ingredients with confidence scores.

**Recipe Generation:** The app combines a seeded Firestore database of 23 curated
recipes with AI-generated recipes using `streamObject()` for real-time streaming.
Each recipe includes nutrition info, step-by-step instructions, and substitution
suggestions.

**Personalization:** User ratings and favorites are stored per-user in Firestore.
A suggestions API analyzes rating patterns to recommend similar recipes.
