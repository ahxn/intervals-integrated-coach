# Intervals Integrated Coach Setup Guide

## Overview
A full-stack AI-powered running coach app with Intervals.icu integration, built with Next.js 16, Prisma, PostgreSQL, and AI SDK 6.

## Prerequisites
- Node.js 18+
- PostgreSQL database (Neon or self-hosted)
- OpenAI API key

## Installation

### 1. Install Dependencies
```bash
pnpm install
# or npm install / yarn install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_URL`: Your app's URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `OPENAI_API_KEY`: Your OpenAI API key

### 3. Initialize Database
```bash
pnpm run build  # This runs Prisma migrations
```

Or manually:
```bash
npx prisma migrate dev --name init
```

### 4. Run Development Server
```bash
pnpm run dev
```

Visit `http://localhost:3000` to start using the app.

## Features

### User Authentication
- Email/password registration and login
- Secure session management with NextAuth.js
- Password hashing with bcryptjs

### Training Plan Generation
- AI-powered weekly training plan generation
- Constraints: weekly mileage, training focus areas
- Automatic plan validation

### Daily Workouts
- View today's scheduled workout
- Log workout feedback with rating
- Track all historical feedback

### Coach Chat
- Real-time streaming chat with AI coach
- Uses AI SDK 6 with streaming support
- Coach persona optimized for running advice

### Settings & Integration
- Manage Intervals.icu API integration
- Set training preferences (weekly mileage, long run day)
- Store integration credentials securely

### Data Sync (Optional)
- Cron-triggered Intervals.icu sync
- Automatic workout data import
- Call `/api/sync/intervals` with `CRON_SECRET` header

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/chat` | POST | Streaming chat with AI coach |
| `/api/plans/generate` | POST | Generate weekly plan |
| `/api/plans/current` | GET | Get current week plan |
| `/api/workouts/today` | GET | Get today's workout |
| `/api/feedback` | GET/POST | Manage workout feedback |
| `/api/settings` | GET/POST | User settings |
| `/api/sync/intervals` | POST | Sync Intervals.icu data |
| `/api/health` | GET | Health check |

## Database Schema

### Key Tables
- `User`: User accounts
- `UserSettings`: Training preferences & integrations
- `TrainingStateDaily`: Daily training data
- `WeekPlan`: Weekly training plans
- `PlannedWorkout`: Individual workouts
- `Feedback`: Workout feedback & ratings

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Database migrations run automatically on build

### Other Platforms
Ensure:
- Node.js runtime
- Environment variables configured
- Database migrations run: `npx prisma migrate deploy`
- Build command: `pnpm run build`
- Start command: `pnpm run start`

## Cron Jobs

### Intervals.icu Sync
Set up a cron service (e.g., EasyCron) to call:
```
POST /api/sync/intervals
Header: Authorization: Bearer {CRON_SECRET}
```

Recommended: Daily at 2 AM UTC

## Development

### Database Migrations
```bash
npx prisma migrate dev --name migration_name
npx prisma studio  # Visual database editor
```

### Type Generation
```bash
npx prisma generate  # Auto-generate Prisma client types
```

## Troubleshooting

### Database Connection
- Verify `DATABASE_URL` format
- Check firewall/network access
- For Neon: use connection pooling URL for serverless

### AI/LLM Issues
- Verify `OPENAI_API_KEY` is valid
- Check API usage and billing
- Ensure model name is correct in code

### Auth Issues
- Clear cookies and session storage
- Regenerate `NEXTAUTH_SECRET`
- Check `NEXTAUTH_URL` matches your domain

## Next Steps
- Set up Intervals.icu integration in Settings
- Generate your first training plan
- Chat with the AI coach for personalized advice
- Check `/api/health` to verify system status

## Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon/self-hosted)
- **ORM**: Prisma
- **Auth**: NextAuth.js v4
- **AI**: Vercel AI SDK 6, OpenAI
- **Styling**: Tailwind CSS, shadcn/ui
- **Data Fetching**: SWR
