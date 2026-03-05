-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "RaceType" AS ENUM ('HALF', 'MARATHON', 'TEN_K');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "WorkoutType" AS ENUM ('EASY', 'SUB_THRESHOLD', 'LONG', 'REST', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "WorkoutSource" AS ENUM ('AI', 'MANUAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Soreness" AS ENUM ('NONE', 'MILD', 'MODERATE', 'SEVERE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "raceDate" TIMESTAMP(3),
    "raceType" "RaceType" NOT NULL DEFAULT 'HALF',
    "longRunDay" "DayOfWeek" NOT NULL DEFAULT 'SUNDAY',
    "maxQualityDays" INTEGER NOT NULL DEFAULT 2,
    "maxSubThresholdDays" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TrainingStateDaily" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "ctl" DOUBLE PRECISION,
    "atl" DOUBLE PRECISION,
    "tsb" DOUBLE PRECISION,
    "volume7d" DOUBLE PRECISION,
    "volume14d" DOUBLE PRECISION,
    "volume28d" DOUBLE PRECISION,
    "lastLongRunDate" DATE,
    "lastQualityDate" DATE,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingStateDaily_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PlannedWorkout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" "WorkoutType" NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "targets" JSONB NOT NULL,
    "rationale" TEXT,
    "alternates" JSONB,
    "source" "WorkoutSource" NOT NULL DEFAULT 'AI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlannedWorkout_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WeekPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStartDate" DATE NOT NULL,
    "planJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeekPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "rpe" INTEGER NOT NULL,
    "soreness" "Soreness" NOT NULL DEFAULT 'NONE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "UserSettings_userId_key" ON "UserSettings"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "TrainingStateDaily_userId_date_key" ON "TrainingStateDaily"("userId", "date");
CREATE INDEX IF NOT EXISTS "TrainingStateDaily_userId_date_idx" ON "TrainingStateDaily"("userId", "date");
CREATE UNIQUE INDEX IF NOT EXISTS "PlannedWorkout_userId_date_key" ON "PlannedWorkout"("userId", "date");
CREATE INDEX IF NOT EXISTS "PlannedWorkout_userId_date_idx" ON "PlannedWorkout"("userId", "date");
CREATE UNIQUE INDEX IF NOT EXISTS "WeekPlan_userId_weekStartDate_key" ON "WeekPlan"("userId", "weekStartDate");
CREATE INDEX IF NOT EXISTS "WeekPlan_userId_weekStartDate_idx" ON "WeekPlan"("userId", "weekStartDate");
CREATE UNIQUE INDEX IF NOT EXISTS "Feedback_userId_date_key" ON "Feedback"("userId", "date");
CREATE INDEX IF NOT EXISTS "Feedback_userId_date_idx" ON "Feedback"("userId", "date");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "TrainingStateDaily" ADD CONSTRAINT "TrainingStateDaily_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "PlannedWorkout" ADD CONSTRAINT "PlannedWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "WeekPlan" ADD CONSTRAINT "WeekPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
