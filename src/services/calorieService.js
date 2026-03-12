/**
 * Calorie Service — Mifflin-St Jeor BMR + TDEE calculation
 */

const ACTIVITY_MULTIPLIERS = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor formula.
 * @param {{ weight: number, height: number, age: number, gender: string }} profile
 * @returns {number} BMR in kcal/day
 */
function calculateBMR({ weight, height, age, gender }) {
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Calculate Total Daily Energy Expenditure.
 * @param {{ weight: number, height: number, age: number, gender: string, activity_level: string }} profile
 * @returns {number} TDEE in kcal/day (rounded)
 */
function calculateTDEE(profile) {
  const bmr = calculateBMR(profile);
  const multiplier = ACTIVITY_MULTIPLIERS[profile.activity_level] || 1.2;
  return Math.round(bmr * multiplier);
}

module.exports = { calculateBMR, calculateTDEE, ACTIVITY_MULTIPLIERS };
