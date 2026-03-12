-- ============================================================
-- NutriTrack — Sample Seed Data
-- ============================================================
-- Run AFTER schema.sql
-- The sample user password is "password123" (bcrypt hash)

-- Sample user
INSERT INTO users (email, password, age, height, weight, gender, activity_level)
VALUES (
  'demo@nutritrack.com',
  '$2a$10$8KzaNdKIMyOkASCimq3WNOxMlFT3BnxM6YGGnLuDglaQEnh6yOlMa',
  25, 175, 70, 'male', 'moderate'
) ON CONFLICT (email) DO NOTHING;

-- Sample foods
INSERT INTO foods (name, calories, protein, carbs, fat) VALUES
  ('White Rice (100g)',       130,  2.7,  28.2, 0.3),
  ('Chicken Breast (100g)',   165, 31.0,   0.0, 3.6),
  ('Banana',                   89,  1.1,  22.8, 0.3),
  ('Egg (boiled)',              78,  6.3,   0.6, 5.3),
  ('Whole Wheat Bread (1 slice)', 82, 4.0, 13.8, 1.1),
  ('Salmon (100g)',           208, 20.4,   0.0, 13.4),
  ('Broccoli (100g)',           34,  2.8,   7.0, 0.4),
  ('Oatmeal (100g)',           68,  2.4,  12.0, 1.4),
  ('Apple',                     52,  0.3,  13.8, 0.2),
  ('Milk (250ml)',             149,  8.1,  11.7, 7.9)
ON CONFLICT DO NOTHING;
