# LearnHub

A free e-learning platform where students and educators share resources, ask questions, and help each other learn — no paywalls, no file hosting, completely free.

## What it does

- **Resource sharing** — users share external download links (Google Drive, Mega, Dropbox, etc.). No files are stored on the server.
- **Q&A Forum** — subject-organised discussion board with answers, comments, upvotes, and accepted answers.
- **Reputation system** — earn points for answering questions and having your answers accepted.
- **Bookmarks** — save resources and questions for later.
- **Notifications** — get notified when someone answers your question.
- **Search** — full-text search across resources and questions.
- **Leaderboard** — top contributors ranked by reputation.

## Tech stack

| Layer    | Technology |
|----------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend  | Node.js, Express |
| Database | JSON files (temporary — swap in any DB later) |
| Auth     | JWT Bearer tokens |

## Features

- Subject categories: Science, Math, History, Technology, Arts, Language
- Markdown support in questions, answers, and resource descriptions
- Sort & filter: newest, most upvoted, most viewed, unanswered, solved
- Pagination on all list views
- Real-time notification polling
- Auto-backup of JSON data files (hourly, keeps last 5)
- Rate limiting and input sanitisation on all API routes
- Soft deletes (data is never permanently lost)
- Fully responsive — mobile hamburger menu, desktop sidebar

## Project structure

```
ELearning/
├── client/          # Next.js frontend (port 3000)
│   └── src/
│       ├── app/     # Pages (App Router)
│       ├── components/
│       └── lib/     # API client, auth, utils
└── server/          # Express backend (port 5000)
    ├── data/        # JSON database files
    ├── db/          # Data access layer
    ├── middleware/  # Auth, rate limit, sanitise, validate
    └── routes/      # API route handlers
```

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Seed demo data

```bash
cd server
node seed.js
```

This sets proper bcrypt password hashes on the three demo accounts.

### Run

```bash
# Terminal 1 — backend
cd server
node index.js

# Terminal 2 — frontend
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

| Name         | Email            | Password  |
|--------------|------------------|-----------|
| Alice Mwangi | alice@demo.com   | demo123   |
| Bob Kariuki  | bob@demo.com     | demo123   |
| Carol Osei   | carol@demo.com   | demo123   |

## API overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/resources` | List resources (sort, search, paginate) |
| POST | `/api/resources` | Submit a resource |
| GET | `/api/posts` | List questions (sort, filter, paginate) |
| POST | `/api/posts` | Ask a question |
| POST | `/api/answers` | Post an answer |
| PATCH | `/api/answers/:id/accept` | Accept an answer |
| GET | `/api/search?q=` | Search resources + questions |
| GET | `/api/bookmarks` | Get user bookmarks |
| GET | `/api/notifications` | Get user notifications |
| GET | `/api/leaderboard` | Top contributors |
| GET | `/api/stats` | Platform counts |
| GET | `/api/comments?targetId=` | Comments on a post or answer |
| POST | `/api/comments` | Add a comment |

## Connecting a real database

All data access is in `server/db/*.js`. Each file is a thin wrapper around a `DataStore` instance in `server/lib/store.js`. To swap in MongoDB, PostgreSQL, or any other database, replace the `DataStore` calls in those files with your ORM/query calls — the route handlers don't need to change.

## Roadmap

- [ ] Connect a real database (PostgreSQL / MongoDB)
- [ ] Email verification on register
- [ ] Password reset flow
- [ ] Rich text editor (images in posts)
- [ ] Resource rating system
- [ ] User avatars
- [ ] Admin dashboard

## License

MIT
