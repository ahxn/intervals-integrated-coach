-- CreateEnum
CREATE TYPE "RaceType" AS ENUM ('HALF', 'MARATHON', 'TEN_K');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('EASY', 'SUB_THRESHOLD', 'LONG', 'REST', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkoutSource" AS ENUM ('AI', 'MANUAL');

-- CreateEnum
CREATE TYPE "Soreness" AS ENUM ('NONE', 'MILD', 'MODERATE', 'SEVERE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "raceDate" TIMESTAMP(3),
    "raceType" "RaceType" NOT NULL DEFAULT 'HALF',
    "longRunDay" "DayOfWeek" NOT NULL DEFAULT 'SUNDAY',
    "maxQualityDays" INTEGER NOT NULL DEFAULT 2,
    "maxSubThresholdDays" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingStateDaily" (
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

-- CreateTable
CREATE TABLE "PlannedWorkout" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannedWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStartDate" DATE NOT NULL,
    "planJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeekPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "TrainingStateDaily_userId_date_idx" ON "TrainingStateDaily"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingStateDaily_userId_date_key" ON "TrainingStateDaily"("userId", "date");

-- CreateIndex
CREATE INDEX "PlannedWorkout_userId_date_idx" ON "PlannedWorkout"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PlannedWorkout_userId_date_key" ON "PlannedWorkout"("userId", "date");

-- CreateIndex
CREATE INDEX "WeekPlan_userId_weekStartDate_idx" ON "WeekPlan"("userId", "weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "WeekPlan_userId_weekStartDate_key" ON "WeekPlan"("userId", "weekStartDate");

-- CreateIndex
CREATE INDEX "Feedback_userId_date_idx" ON "Feedback"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_userId_date_key" ON "Feedback"("userId", "date");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingStateDaily" ADD CONSTRAINT "TrainingStateDaily_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedWorkout" ADD CONSTRAINT "PlannedWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekPlan" ADD CONSTRAINT "WeekPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
