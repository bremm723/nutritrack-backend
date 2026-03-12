-- ============================================================
-- NutriTrack — PostgreSQL Schema (Supabase-compatible)
-- ============================================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL,
  age           INTEGER,
  height        NUMERIC(5,1),        -- cm
  weight        NUMERIC(5,1),        -- kg
  gender        VARCHAR(10) CHECK (gender IN ('male', 'female')),
  activity_level VARCHAR(20) CHECK (activity_level IN (
                    'sedentary', 'light', 'moderate', 'active', 'very_active'
                 )),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Foods table
CREATE TABLE IF NOT EXISTS foods (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      VARCHAR(255) NOT NULL,
  calories  NUMERIC(7,1) NOT NULL,   -- kcal per serving
  protein   NUMERIC(6,1) DEFAULT 0,  -- grams
  carbs     NUMERIC(6,1) DEFAULT 0,  -- grams
  fat       NUMERIC(6,1) DEFAULT 0   -- grams
);

-- 3. Food logs table
CREATE TABLE IF NOT EXISTS food_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id    UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  quantity   NUMERIC(5,2) NOT NULL DEFAULT 1,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_food_logs_food      ON food_logs(food_id);
