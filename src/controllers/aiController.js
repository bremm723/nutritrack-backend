const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../config/db');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a professional nutritionist AI embedded in a health tracking app called NutriTrack.

Your job is to analyze food images and return ONLY a valid JSON object with nutritional estimates.

STRICT RULES:
- Return ONLY raw JSON. No markdown, no backticks, no explanation text whatsoever.
- Estimate nutrition based on the TOTAL PORTION visible in the image, not per 100g.
- If the image shows Indonesian food, use Indonesian food nutrition references.
- If multiple foods are on the plate, analyze the entire meal as one entry and list each component under "items".
- Estimate portion weight visually using context clues (plate size, utensils, hands, packaging).

RESPONSE FORMAT (exact, no deviation):
{
  "detected": true,
  "confidence": "high",
  "meal_name": "Nasi Goreng Ayam",
  "estimated_portion_g": 350,
  "nutrition": {
    "calories": 520,
    "protein_g": 18,
    "carbs_g": 72,
    "fat_g": 16
  },
  "items": [
    {
      "name": "Nasi goreng",
      "portion_g": 250,
      "calories": 380,
      "protein_g": 8,
      "carbs_g": 68,
      "fat_g": 10
    },
    {
      "name": "Ayam goreng",
      "portion_g": 100,
      "calories": 140,
      "protein_g": 10,
      "carbs_g": 4,
      "fat_g": 6
    }
  ],
  "notes": "Estimated based on standard Indonesian nasi goreng portion with chicken"
}

If no food is detected:
{
  "detected": false,
  "confidence": "high",
  "meal_name": null,
  "estimated_portion_g": 0,
  "nutrition": null,
  "items": [],
  "notes": "No food detected in the image."
}`;

// POST /ai/analyze-food
exports.analyzeFood = async (req, res) => {
    try {
        const { image_base64, media_type = 'image/jpeg' } = req.body;

        if (!image_base64) {
            return res.status(400).json({ error: 'image_base64 is required.' });
        }

        const response = await client.messages.create({
            model: 'claude-opus-4-5',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: media_type,
                                data: image_base64,
                            },
                        },
                        {
                            type: 'text',
                            text: 'Analyze this food image and return the nutritional information as JSON.',
                        },
                    ],
                },
            ],
        });

        const rawText = response.content[0].text.trim();

        let nutrition;
        try {
            nutrition = JSON.parse(rawText);
        } catch {
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                nutrition = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('AI did not return valid JSON');
            }
        }

        res.json({ success: true, data: nutrition });
    } catch (err) {
        console.error('AI analyze food error:', err);
        res.status(500).json({ error: 'Failed to analyze food image.' });
    }
};

// POST /ai/log-detected-food
exports.logDetectedFood = async (req, res) => {
    try {
        const {
            meal_name,
            calories,
            protein_g,
            carbs_g,
            fat_g,
            estimated_portion_g = 100,
            meal_type = 'snack',
        } = req.body;

        if (!meal_name || calories == null) {
            return res.status(400).json({ error: 'meal_name and calories are required.' });
        }

        // Hitung nilai per 100g untuk disimpan di tabel foods
        const portion = estimated_portion_g || 100;
        const per100g = (val) => Math.round((val / portion) * 100);

        // Cek apakah makanan sudah ada
        let foodId;
        const existing = await pool.query(
            'SELECT id FROM foods WHERE name ILIKE $1 AND created_by = $2 LIMIT 1',
            [meal_name, req.user.id]
        );

        if (existing.rows.length > 0) {
            foodId = existing.rows[0].id;
        } else {
            // Insert makanan baru ke tabel foods
            const foodResult = await pool.query(
                `INSERT INTO foods (name, calories, protein, carbs, fat, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
                [
                    meal_name,
                    per100g(calories),
                    per100g(protein_g || 0),
                    per100g(carbs_g || 0),
                    per100g(fat_g || 0),
                    req.user.id,
                ]
            );
            foodId = foodResult.rows[0].id;
        }

        // Insert ke food_logs
        await pool.query(
            `INSERT INTO food_logs (user_id, food_id, quantity, date, meal_type)
       VALUES ($1, $2, $3, CURRENT_DATE, $4)`,
            [req.user.id, foodId, portion, meal_type]
        );

        res.status(201).json({ success: true, message: 'Food logged successfully.' });
    } catch (err) {
        console.error('Log detected food error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};