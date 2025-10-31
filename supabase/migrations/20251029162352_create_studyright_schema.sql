/*
  # StudyRight (WCMS Edition) - Initial Schema

  1. New Tables
    - `User` - Students and parents with role-based access
      - `id` (cuid, primary key)
      - `email` (text, unique)
      - `name` (text, optional)
      - `role` (enum: STUDENT, PARENT)
      - `createdAt` (timestamp)
    
    - `Skill` - 8th grade learning objectives across subjects
      - `id` (cuid, primary key)
      - `subject` (enum: SCIENCE, MATH, STEM_FLIGHT_SPACE, SOCIAL_STUDIES, LANGUAGE_ARTS)
      - `grade` (integer)
      - `key` (text, unique identifier)
      - `title` (text)
      - `description` (text)
      - `createdAt` (timestamp)
    
    - `Session` - Learning sessions tracking student progress
      - `id` (cuid, primary key)
      - `userId` (foreign key to User)
      - `skillId` (foreign key to Skill)
      - `mode` (enum: STUDY, ASSESSMENT)
      - `startedAt` (timestamp)
      - `completedAt` (timestamp, optional)
      - `status` (enum: ACTIVE, COMPLETED, ABANDONED)
    
    - `Turn` - Conversation turns between student and tutor
      - `id` (cuid, primary key)
      - `sessionId` (foreign key to Session)
      - `actor` (enum: STUDENT, TUTOR)
      - `content` (text, markdown)
      - `type` (enum: QUESTION, HINT, ATTEMPT, SOLUTION, FEEDBACK)
      - `createdAt` (timestamp)
    
    - `Attempt` - Student attempt tracking with reflection requirement
      - `id` (cuid, primary key)
      - `sessionId` (foreign key to Session)
      - `status` (enum: INCOMPLETE, SOLVED, GAVE_UP)
      - `accuracy` (float, 0-1 range)
      - `timeSec` (integer)
      - `reflection` (text, required before solution reveal)
      - `imagePath` (text, uploaded scratch work)
      - `createdAt` (timestamp)
    
    - `Event` - Activity logging for analytics
      - `id` (cuid, primary key)
      - `sessionId` (foreign key to Session)
      - `name` (text: start, hint, reveal, solve, abandon)
      - `meta` (jsonb)
      - `createdAt` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Students can only view/modify their own sessions
    - Parents can view all sessions for students they manage (future enhancement)
    - Public read access to Skills table
    
  3. Important Notes
    - Uses cuid() for all primary keys (requires extension)
    - Gatekeeping logic enforced at API level
    - Reflection required before solution reveal
    - Image uploads stored locally in dev, ready for R2/Supabase swap
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom CUID generator function
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
DECLARE
  timestamp_part TEXT;
  counter_part TEXT;
  random_part TEXT;
BEGIN
  timestamp_part := LPAD(TO_HEX(FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT), 12, '0');
  counter_part := LPAD(TO_HEX(FLOOR(RANDOM() * 1679616)::INT), 4, '0');
  random_part := LPAD(TO_HEX(FLOOR(RANDOM() * 4294967296)::BIGINT), 8, '0');
  RETURN 'c' || SUBSTRING(timestamp_part || counter_part || random_part, 1, 24);
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Create enums
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('STUDENT', 'PARENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "Subject" AS ENUM ('SCIENCE', 'MATH', 'STEM_FLIGHT_SPACE', 'SOCIAL_STUDIES', 'LANGUAGE_ARTS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "Mode" AS ENUM ('STUDY', 'ASSESSMENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "Actor" AS ENUM ('STUDENT', 'TUTOR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TurnType" AS ENUM ('QUESTION', 'HINT', 'ATTEMPT', 'SOLUTION', 'FEEDBACK');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "AttemptStatus" AS ENUM ('INCOMPLETE', 'SOLVED', 'GAVE_UP');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT generate_cuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role "Role" NOT NULL DEFAULT 'STUDENT',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Skill table
CREATE TABLE IF NOT EXISTS "Skill" (
  id TEXT PRIMARY KEY DEFAULT generate_cuid(),
  subject "Subject" NOT NULL,
  grade INT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Session table
CREATE TABLE IF NOT EXISTS "Session" (
  id TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "skillId" TEXT NOT NULL REFERENCES "Skill"(id) ON DELETE CASCADE,
  mode "Mode" NOT NULL DEFAULT 'STUDY',
  "startedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "completedAt" TIMESTAMPTZ,
  status "SessionStatus" NOT NULL DEFAULT 'ACTIVE'
);

-- Create Turn table
CREATE TABLE IF NOT EXISTS "Turn" (
  id TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "sessionId" TEXT NOT NULL REFERENCES "Session"(id) ON DELETE CASCADE,
  actor "Actor" NOT NULL,
  content TEXT NOT NULL,
  type "TurnType" NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Attempt table
CREATE TABLE IF NOT EXISTS "Attempt" (
  id TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "sessionId" TEXT NOT NULL REFERENCES "Session"(id) ON DELETE CASCADE,
  status "AttemptStatus" NOT NULL DEFAULT 'INCOMPLETE',
  accuracy FLOAT,
  "timeSec" INT,
  reflection TEXT,
  "imagePath" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Event table
CREATE TABLE IF NOT EXISTS "Event" (
  id TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "sessionId" TEXT NOT NULL REFERENCES "Session"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  meta JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "Session_skillId_idx" ON "Session"("skillId");
CREATE INDEX IF NOT EXISTS "Turn_sessionId_idx" ON "Turn"("sessionId");
CREATE INDEX IF NOT EXISTS "Attempt_sessionId_idx" ON "Attempt"("sessionId");
CREATE INDEX IF NOT EXISTS "Event_sessionId_idx" ON "Event"("sessionId");

-- Enable Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Skill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Turn" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User table
CREATE POLICY "Users can view own profile"
  ON "User" FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON "User" FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- RLS Policies for Skill table (public read)
CREATE POLICY "Anyone can view skills"
  ON "Skill" FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for Session table
CREATE POLICY "Users can view own sessions"
  ON "Session" FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own sessions"
  ON "Session" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own sessions"
  ON "Session" FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- RLS Policies for Turn table
CREATE POLICY "Users can view turns in own sessions"
  ON "Turn" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Session"
      WHERE "Session".id = "Turn"."sessionId"
      AND "Session"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can create turns in own sessions"
  ON "Turn" FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Session"
      WHERE "Session".id = "Turn"."sessionId"
      AND "Session"."userId" = auth.uid()::text
    )
  );

-- RLS Policies for Attempt table
CREATE POLICY "Users can view attempts in own sessions"
  ON "Attempt" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Session"
      WHERE "Session".id = "Attempt"."sessionId"
      AND "Session"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can create attempts in own sessions"
  ON "Attempt" FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Session"
      WHERE "Session".id = "Attempt"."sessionId"
      AND "Session"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can update attempts in own sessions"
  ON "Attempt" FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Session"
      WHERE "Session".id = "Attempt"."sessionId"
      AND "Session"."userId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Session"
      WHERE "Session".id = "Attempt"."sessionId"
      AND "Session"."userId" = auth.uid()::text
    )
  );

-- RLS Policies for Event table
CREATE POLICY "Users can view events in own sessions"
  ON "Event" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Session"
      WHERE "Session".id = "Event"."sessionId"
      AND "Session"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can create events in own sessions"
  ON "Event" FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Session"
      WHERE "Session".id = "Event"."sessionId"
      AND "Session"."userId" = auth.uid()::text
    )
  );
