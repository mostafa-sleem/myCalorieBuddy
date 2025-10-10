// 🧠 MyCalorieBuddy — Server v10.2 (Precision + Context Guard)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* -------------------------------------------------------------
   ⏱️ Timer
------------------------------------------------------------- */
const timer = () => {
  const start = Date.now();
  return () => ((Date.now() - start) / 1000).toFixed(2);
};

/* -------------------------------------------------------------
   🧠 Intent Detection with Continuation
------------------------------------------------------------- */
function wantsLogging(message, lastIntent = "none") {
  const lower = message.toLowerCase();
  const verbs = [
    "ate", "had", "got", "ordered", "cooked", "made", "grabbed", "prepared",
    "took", "drank", "consumed", "finished", "snacked on", "devoured",
    "enjoyed", "tried", "bought", "log", "logged"
  ];
  /*const foods = [
    "apple", "banana", "orange", "egg", "falafel", "rice", "chicken", "bread",
    "coffee", "yogurt", "salad", "pasta", "sandwich", "potato", "pizza", "tomato",
    "fish", "burger", "milk", "soup", "meat", "tea", "juice", "cheese", "chocolate",
    "cake", "cookie", "steak", "fries", "vegetable", "fruit", "combo", "meal", "almond", "nuts"
  ];*/

  const hasVerb = verbs.some(v => lower.includes(v));
  //const hasFood = foods.some(f => lower.includes(f));

  if (hasVerb) return true;
  if (!hasVerb && lastIntent === "log") return true;
  if (lower.includes("log it")) return true;
  return false;
}

/* -------------------------------------------------------------
   🍎 Local Calorie DB
------------------------------------------------------------- */
const foodDB = {
  /*apple: 72,
  banana: 89,
  orange: 62,
  egg: 68,
  "falafel sandwich": 350,
  rice: 206,
  chicken: 165,
  bread: 80,
  coffee: 2,
  yogurt: 59,
  salad: 120,
  pasta: 220,
  pizza: 285,
  potato: 161,
  tomato: 22,
  burger: 500,
  almonds: 7,
  almond: 7,
  "big tasty": 1300,*/
};

/* -------------------------------------------------------------
   💬 Buddy Personality
------------------------------------------------------------- */
const replySys = `
You are Buddy — a warm, supportive calorie-tracking assistant.
Focus on food, hydration, and mood.
If user sounds emotional, respond kindly and bring it back to food.
Short (1–2 sentences), positive, and human.
Use emojis sparingly.
Avoid politics or religion.
`;

/* -------------------------------------------------------------
   🍳 Parser — Strict JSON Mode
------------------------------------------------------------- */
const parserSys = `
You are a nutrition data parser.
Output valid JSON only:
{"food":"", "quantity": number|null, "unit":"", "calories": number|null}

Rules:
- Return ONE object only, never arrays.
- Accept plural forms ("5 almonds" → {"food":"almonds","quantity":5,"calories":35}).
- Never duplicate or guess multiple foods.
- Use realistic human quantities (1–5 unless grams/ml given).
- If not listed, estimate 100–600 kcal.
- If no food detected, return {"food":null}.
`;

/* -------------------------------------------------------------
   🍎 Extract Food Info (deterministic)
------------------------------------------------------------- */
async function extractFood(userInput) {
  const endTimer = timer();
  try {
    const r = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: parserSys },
        { role: "user", content: userInput }
      ],
      temperature: 0.15,
      max_tokens: 5000
    });

    // Try to capture JSON inside text safely
    const text = r.choices[0].message.content || "";
    const match = text.match(/{[\s\S]*}/);
    const obj = match ? JSON.parse(match[0]) : { food: null };

    // Fill missing calories from DB
    if (obj.food && !obj.calories) {
      const normalized = obj.food.toLowerCase().trim();
      obj.calories = foodDB[normalized] ?? null;
    }

    // Defaults
    obj.quantity = obj.quantity ?? 1;
    obj.unit = obj.unit || "piece";

    // Safety clamps
    if (obj.quantity > 10) obj.quantity = 10;
    if (obj.calories > 1000) obj.calories = 1000;

    console.log("🍽️ Parsed:", obj, "⏱️", endTimer(), "s");
    return obj;
  } catch (err) {
    console.error("❌ Parser error:", err);
    return { food: null, quantity: null, unit: null, calories: null };
  }
}


/* -------------------------------------------------------------
   🧠 Memory
------------------------------------------------------------- */
let history = [];
let lastIntent = "none";
const MAX_HISTORY = 25;

/* -------------------------------------------------------------
   💬 Chat Route — Precision + Context Guard
------------------------------------------------------------- */
app.post("/chat", async (req, res) => {
  const user = String(req.body.message ?? "").trim();
  console.log("🟢 User:", user);
  const endTimer = timer();

  try {
    history.push({ role: "user", content: user });
    if (history.length > MAX_HISTORY) history.shift();

    let loggingIntent = wantsLogging(user, lastIntent);
    if (!loggingIntent && user.toLowerCase().includes("log it")) loggingIntent = true;

    // Step 1 – Buddy reply
    const replyRes = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: replySys }, ...history],
      temperature: 0.7,
      max_tokens: 200
    });

    let reply = replyRes.choices[0].message.content || "Got it!";
    const usage = replyRes.usage || {};
    console.log(`💬 Buddy reply (${usage.total_tokens ?? "?"} tokens): ${reply}`);

    // Step 2 – Structured parsing
    let data = { food: null };

    if (loggingIntent) {
      const userOnly = user;

      // 🧩 Detect multiple foods (split by and/with/plus)
      const comboRegex = /\b(?:and|with|plus)\s+([\w\s\d]+)/gi;
      const foodsFound = [];
      let match;
      while ((match = comboRegex.exec(userOnly)) !== null) {
        foodsFound.push(match[1].trim());
      }
      if (!foodsFound.includes(userOnly.trim())) foodsFound.unshift(userOnly.trim());

      const results = [];
      const seen = new Set();

      for (const fragment of foodsFound) {
        const parsed = await extractFood(fragment);
        if (parsed.food && parsed.calories) {
          const key = parsed.food.toLowerCase();

          if (seen.has(key)) {
            // 🧩 Already found this food once → average or keep the higher calorie
            const existing = results.find(r => r.food.toLowerCase() === key);
            if (existing) {
              existing.calories = Math.round(
                (existing.calories + parsed.calories) / 2
              );
              // optional: pick the higher value instead
              // existing.calories = Math.max(existing.calories, parsed.calories);
            }
          } else {
            seen.add(key);
            results.push(parsed);
          }
        }
      }


      if (results.length === 1) {
        data = results[0];
        const kcalText = `(${data.calories} kcal)`;
        reply = `✅ Logged "${data.food}" (${data.calories} kcal)\n${reply}`;
        console.log(`💬 Buddy friendly message: ${reply}`);
      } else if (results.length > 1) {
        data = results;
        const totalKcal = results.reduce((sum, r) => sum + (r.calories || 0), 0);
        const foods = results.map(r => `${r.food} (${r.calories} kcal)`).join(", ");
        reply = `✅ Logged ${results.length} foods: ${foods} — ${totalKcal} kcal\n\n${reply}`;
      } else {
        reply = reply.replace(/^✅.*Logged.*\n*/i, "");
      }
    }

    history.push({ role: "assistant", content: reply });
    if (history.length > MAX_HISTORY) history.shift();
    lastIntent = loggingIntent ? "log" : "none";



    // 🧹 Temporary duplicate text cleaner
    const lines = reply.split("\n");
    const seenLines = new Set();
    reply = lines.filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return true; // keep empty lines
      if (seenLines.has(trimmed)) return false; // remove duplicate lines
      seenLines.add(trimmed);
      return true;
    }).join("\n");


    res.json({ reply, data });
  } catch (err) {
    console.error("🔥 Chat route error:", err);
    res.status(500).json({
      reply: "Oops! Something went wrong 😅. Let’s try again in a sec.",
      data: { food: null }
    });
  }

  console.log("⏱️ Total duration:", endTimer(), "s");
});

/* -------------------------------------------------------------
   🚀 Launch Server
------------------------------------------------------------- */
app.listen(3000, () =>
  console.log("🚀 Buddy Server v10.2 (Precision + Context Guard) running on http://localhost:3000")
);
