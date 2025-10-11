// 🧠 MyCalorieBuddy — Server v10.6 (Improved Multi-Food Split + Smart Merge)

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
   🧠 Intent Detection
------------------------------------------------------------- */
function wantsLogging(message, lastIntent = "none") {
  const lower = message.toLowerCase();
  const verbs = [
    "ate", "had", "got", "ordered", "cooked", "made", "grabbed", "prepared",
    "took", "drank", "consumed", "finished", "snacked on", "devoured",
    "enjoyed", "tried", "bought", "log", "logged"
  ];
  const hasVerb = verbs.some(v => lower.includes(v));
  if (hasVerb) return true;
  if (!hasVerb && lastIntent === "log") return true;
  if (lower.includes("log it")) return true;
  return false;
}

function wantsRemoval(message) {
  const lower = message.toLowerCase();
  const keywords = ["remove", "delete", "undo", "erase", "cancel",
    "remove all", "clear all", "delete all", "start fresh", "reset day", "reset log", "reset today"];
  return keywords.some(k => lower.includes(k));
}

function wantsFullReset(message) {
  const lower = message.toLowerCase();
  const patterns = [
    /(?:remove|delete|clear)\s+(?:all|everything)/,
    /start\s*fresh/,
    /reset\s*(?:day|today|log)/,
    /wipe\s*(?:all|everything)/,
    /clear\s*(?:today|my log|the log)/
  ];
  return patterns.some(p => (p instanceof RegExp ? p.test(lower) : lower.includes(p)));
}

/* -------------------------------------------------------------
   🍎 Local Calorie DB
------------------------------------------------------------- */
const foodDB = {
  apple: 72, banana: 89, orange: 62, egg: 68, rice: 206, chicken: 165,
  yogurt: 59, salad: 120, pasta: 220, pizza: 285, bread: 80, potato: 130,
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
   🍎 Extract Food Info
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
      temperature: 0.25,
      max_tokens: 5000
    });

    const text = r.choices[0].message.content || "";
    const match = text.match(/{[\s\S]*}/);
    const obj = match ? JSON.parse(match[0]) : { food: null };

    if (obj.food && !obj.calories) {
      const normalized = obj.food.toLowerCase().trim();
      obj.calories = foodDB[normalized] ?? null;
    }

    obj.quantity = obj.quantity ?? 1;
    obj.unit = obj.unit || "piece";

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
let foodLog = [];
let lastResetDate = new Date().toDateString();
const MAX_HISTORY = 25;

/* -------------------------------------------------------------
   🗓️ Daily Reset
------------------------------------------------------------- */
function ensureDailyReset() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    foodLog = [];
    lastResetDate = today;
    console.log("🧹 Daily reset — new day, fresh log!");
  }
}

/* -------------------------------------------------------------
   🧮 Food Log Helpers
------------------------------------------------------------- */
function updateFoodLog(action, foodName, calories = 0) {
  if (action === "add") {
    foodLog.push({ food: foodName, calories });
  } else if (action === "remove") {
    const index = foodLog.findIndex(f => f.food.toLowerCase() === foodName.toLowerCase());
    if (index !== -1) return foodLog.splice(index, 1)[0];
  }
  return null;
}
function totalCalories() {
  return foodLog.reduce((sum, f) => sum + (f.calories || 0), 0);
}

/* -------------------------------------------------------------
   💬 Chat Route
------------------------------------------------------------- */
app.post("/chat", async (req, res) => {
  ensureDailyReset();
  const user = String(req.body.message ?? "").trim();
  console.log("🟢 User:", user);
  const endTimer = timer();

  try {
    history.push({ role: "user", content: user });
    if (history.length > MAX_HISTORY) history.shift();

    const loggingIntent = wantsLogging(user, lastIntent);
    const removalIntent = wantsRemoval(user);
    const resetIntent = wantsFullReset(user);

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

    let data = { food: null };

    // ✅ FULL RESET — early return (fast)
    if (resetIntent) {
      foodLog = [];
      reply = "🧹 Removed all foods logged. Total is now 0 kcal. If you’re ready to eat again, I’m here to help! What are you thinking of having next?";
      history.push({ role: "assistant", content: reply });
      lastIntent = "reset";
      return res.json({ reply, data: { action: "reset" }, totalCalories: 0 });
    }


    // 🧹 Handle multi-remove (corrected)
    if (removalIntent) {
      const fragments = user
        .toLowerCase()
        .split(/\b(?:and|plus|with|,)\b/g)
        .map(f => f.trim())
        .filter(f => f && f.length > 1);

      const removedFoods = [];
      for (const frag of fragments) {
        const parsed = await extractFood(frag);
        if (parsed.food) {
          removedFoods.push(parsed.food);
          updateFoodLog("remove", parsed.food); // use your local helper
        }
      }

      const totalNow = totalCalories();

      if (removedFoods.length > 1) {
        const list = removedFoods.join(', ');
        reply = `🧹 Removed ${removedFoods.length} foods: ${list}. Total is now ${totalNow} kcal.`;
      } else if (removedFoods.length === 1) {
        reply = `🧹 Removed "${removedFoods[0]}". Total is now ${totalNow} kcal.`;
      } else {
        reply = "I couldn’t find any of those foods in your log. 😅";
      }

      history.push({ role: "assistant", content: reply });
      lastIntent = "remove";
      return res.json({ reply, data: { action: "remove" }, totalCalories: totalNow });
    }



    /* ---------------------------------------------------------
       🧩 ADD (improved multi-split)
    --------------------------------------------------------- */
    if (loggingIntent && !removalIntent) {
      const userOnly = user.toLowerCase();

      // ✨ New splitter logic
      const fragments = userOnly
        .split(/\b(?:and|with|plus)\b/g)
        .map(f => f.trim())
        .filter(f => f && f.length > 1);

      const results = [];
      const seen = new Set();
      for (const frag of fragments) {
        const parsed = await extractFood(frag);
        if (parsed.food && parsed.calories) {
          const key = parsed.food.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          results.push(parsed);
        }
      }

      if (results.length === 1) {
        data = results[0];
        updateFoodLog("add", data.food, data.calories);
        reply = `✅ Logged "${data.food}" (${data.calories} kcal)\n${reply}`;
      } else if (results.length > 1) {
        data = results;
        for (const r of results) updateFoodLog("add", r.food, r.calories);
        const totalKcal = results.reduce((s, r) => s + (r.calories || 0), 0);
        const foods = results.map(r => `${r.food} (${r.calories} kcal)`).join(", ");
        reply = `✅ Logged ${results.length} foods: ${foods} — ${totalKcal} kcal\n\n${reply}`;
      } else {
        reply = reply.replace(/^✅.*Logged.*\n*/i, "");
      }
    }




    // 🧹 Remove extra duplicate "✅ Logged" lines from GPT replies
    const lines = reply.split("\n").map(l => l.trim()).filter(Boolean);
    const cleaned = [];
    let loggedLine = null;

    for (const line of lines) {
      if (line.startsWith("✅ Logged")) {
        // keep only the first logged line (or the one that mentions multiple foods)
        if (!loggedLine) {
          loggedLine = line;
          cleaned.push(line);
        } else {
          // if a later one is longer and mentions multiple foods, replace the old one
          if ((line.match(/,/g) || []).length > (loggedLine.match(/,/g) || []).length) {
            cleaned[cleaned.length - 1] = line;
            loggedLine = line;
          }
        }
      } else {
        cleaned.push(line);
      }
    }
    reply = cleaned.join("\n");










    res.json({ reply, data, totalCalories: totalCalories() });
  } catch (err) {
    console.error("🔥 Chat route error:", err);
    res.status(500).json({
      reply: "Oops! Something went wrong 😅. Let’s try again in a sec.",
      data: { food: null },
      totalCalories: totalCalories()
    });
  }

  console.log("⏱️ Total duration:", endTimer(), "s");
});

/* -------------------------------------------------------------
   🚀 Launch Server
------------------------------------------------------------- */
app.listen(3000, () =>
  console.log("🚀 Buddy Server v10.6 (Improved Multi-Food Split + Smart Merge) running on http://localhost:3000")
);
