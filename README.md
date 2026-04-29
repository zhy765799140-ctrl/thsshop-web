# T-Shirt Shop

A full-stack e-commerce app for selling T-shirts, built with React, TypeScript, Vite, and Supabase.

## Features

- Product browsing and detail pages
- Shopping cart
- User authentication (login/logout)
- Order management
- Admin panel
- Supabase backend (database + auth)

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router DOM
- **Backend/DB**: Supabase (PostgreSQL + Auth)
- **Styling**: CSS Modules

## Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd tshirt-shop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set up the database

Run the SQL in `supabase-schema.sql` in your Supabase SQL editor to create the required tables.

### 5. Start the dev server

```bash
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
