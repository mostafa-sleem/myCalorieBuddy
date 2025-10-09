// 🧠 myCalorieBuddy — Server v9 (MVP 1.4 Smart Context Edition)

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
   ⏱️ Utility timer
------------------------------------------------------------- */
const timer = () => {
  const start = Date.now();
  return () => ((Date.now() - start) / 1000).toFixed(2);
};

/* -------------------------------------------------------------
   🧠 Smarter intent detection with continuation
------------------------------------------------------------- */
function wantsLogging(message, lastIntent = "none") {
  const lower = message.toLowerCase();
  const verbs = [
    "ate","had","got","ordered","cooked","made","grabbed","prepared",
    "took","drank","consumed","finished","snacked on","devoured",
    "enjoyed","tried","bought","log","logged"
  ];
  const foods = [
    "apple","banana","orange","egg","falafel","rice","chicken","bread",
    "coffee","yogurt","salad","pasta","sandwich","potato","pizza","tomato",
    "fish","burger","milk","soup","meat","tea","juice","cheese","chocolate",
    "cake","cookie","steak","fries","vegetable","fruit","combo","meal"
  ];

  const hasVerb = verbs.some(v => lower.includes(v));
  const hasFood = foods.some(f => lower.includes(f));

  // ✅ Case 1: normal logging (verb + food)
  if (hasVerb && hasFood) return true;

  // ✅ Case 2: continuation (previous intent was logging)
  if (!hasVerb && hasFood && lastIntent === "log") return true;

  // ✅ Case 3: explicit “log it”
  if (lower.includes("log it")) return true;

  return false;
}

/* -------------------------------------------------------------
   🍎 Local calorie DB
------------------------------------------------------------- */
const foodDB = {
  apple: 72,
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
  "big tasty": 1300
};

/* -------------------------------------------------------------
   💬 Buddy personality prompt
------------------------------------------------------------- */
const replySys = `
You are Buddy — a warm, supportive calorie-tracking assistant.
Focus on food, hydration, and how meals connect with mood.
If the user says something emotional, acknowledge kindly and guide back to food.
Keep responses short (1–2 sentences), positive, and human.
Use emojis occasionally for warmth but never every line.
Avoid politics or religion.
`;

/* -------------------------------------------------------------
   🍳 Parser system prompt
------------------------------------------------------------- */
const parserSys = `
You are a nutrition data parser.
You ALWAYS return a single valid JSON:
{"food":"", "quantity": number|null, "unit":"", "calories": number|null}

If you find a food from this table, use its calories:
apple:72, banana:89, orange:62, egg:68, falafel sandwich:350,
rice:206, chicken:165, bread:80, coffee:2, yogurt:59, salad:120,
pasta:220, pizza:285, potato:161, tomato:22, burger:500, big tasty:1300.

If food not in list, estimate a typical portion size and calories.
If nothing found, return {"food":null}.
`;

/* -------------------------------------------------------------
   🍎 Extract structured food info
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
      temperature: 0.3,
      max_tokens: 150
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

    console.log("🍽️ Parsed:", obj, "⏱️", endTimer(), "s");
    return obj;
  } catch (err) {
    console.error("❌ Parser error:", err);
    return { food: null, quantity: null, unit: null, calories: null };
  }
}

/* -------------------------------------------------------------
   🧠 In-memory chat history with extended memory
------------------------------------------------------------- */
let history = [];
let lastIntent = "none";
const MAX_HISTORY = 25;

/* -------------------------------------------------------------
   💬 Main chat route with context & smart intent continuation
------------------------------------------------------------- */
app.post("/chat", async (req, res) => {
  const user = String(req.body.message ?? "").trim();
  console.log("🟢 User:", user);
  const endTimer = timer();

  try {
    // Append user message to history
    history.push({ role: "user", content: user });
    if (history.length > MAX_HISTORY) history.shift();

    // Detect if user wants to log something (with context)
    let loggingIntent = wantsLogging(user, lastIntent);

    // Fallback: user says “log it” after a food message
    if (!loggingIntent && user.toLowerCase().includes("log it")) {
      loggingIntent = true;
    }

    // Step 1 – generate Buddy’s friendly reply with context
    const replyRes = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: replySys },
        ...history
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    let reply = replyRes.choices[0].message.content || "Got it!";
    const usage = replyRes.usage || {};
    console.log(`💬 Buddy reply (${usage.total_tokens ?? "?"} tokens): ${reply}`);

    // Step 2 – detect and log food
    let data = { food: null };
    if (loggingIntent) {
      // Build combined text of last few messages for context
      const combined = history.slice(-3).map(m => m.content).join(" ");
      data = await extractFood(combined);

      if (data.food && data.food !== "null" && data.calories) {
        const kcalText = `(${data.calories} kcal)`;
        reply = `✅ Logged "${data.food}" ${kcalText}\n\n${reply}`;
      }
    }

    // Save Buddy reply into history
    history.push({ role: "assistant", content: reply });
    if (history.length > MAX_HISTORY) history.shift();

    // Update lastIntent for context continuation
    if (loggingIntent) lastIntent = "log";
    else lastIntent = "none";

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
   🚀 Launch server
------------------------------------------------------------- */
app.listen(3000, () =>
  console.log("🚀 Buddy Server v9 (MVP 1.4 Smart Context) running on http://localhost:3000")
);
