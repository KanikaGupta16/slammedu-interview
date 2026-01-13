# SlammedU Interview Sandbox

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL via Supabase (local)
- **Storage**: Supabase Storage (local)
- **ORM**: Drizzle ORM
- **Auth**: Better Auth
- **UI**: shadcn/ui + Tailwind CSS v4
- **State**: TanStack Query

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed

### Setup

```bash
bunx supabase start
bun db:push
bun db:seed
bun i
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── app/                # Authenticated app routes
│   │   ├── feed/           # Feed page
│   │   ├── profile/        # Profile page
│   │   ├── layout.tsx      # App layout with sidebar
│   │   └── page.tsx        # App home page
│   ├── api/
│   │   ├── auth/           # Better Auth API routes
│   │   └── upload/         # Image upload API
│   └── page.tsx            # Sign in page
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── sidebar.tsx         # Main navigation
├── db/
│   ├── schema/             # Drizzle schema definitions
│   └── index.ts            # Database connection
├── hooks/                  # Custom React hooks
├── lib/
│   ├── auth.ts             # Better Auth server config
│   ├── auth-client.ts      # Better Auth client
│   ├── supabase.ts         # Supabase client
│   └── utils.ts            # Utilities
└── providers/              # React context providers
```

## API

### Upload Image

```
POST /api/upload
Content-Type: multipart/form-data

Body: file (File)

Response: { success: true, path: string, url: string }
```

## Commands

| Command        | Description                    |
| -------------- | ------------------------------ |
| `bun dev`      | Start development server       |
| `bun build`    | Production build               |
| `bun db:push`  | Push schema to database        |
| `bun db:studio`| Open Drizzle Studio            |

## Stopping Supabase

```bash
bunx supabase stop
```
