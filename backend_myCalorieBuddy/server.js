import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const timer = () => {
  const start = Date.now();
  return () => ((Date.now() - start) / 1000).toFixed(2);
};

// 🔍 Detect if user wants to log food
function wantsLogging(message) {
  const triggers = ["ate", "had", "eat", "add", "log", "breakfast", "lunch", "dinner", "snack"];
  return triggers.some((t) => message.toLowerCase().includes(t));
}

// 🍎 Local calorie DB
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
};

// 🧠 Buddy’s friendly personality
const replySys = `
You are Buddy — a warm, supportive calorie-tracking assistant. 
You focus on food, hydration, and emotional connection between eating and mood.
If the user says something emotional, acknowledge kindly and gently guide back to food.

Keep responses short (1–2 sentences), positive, and human. 
Use emojis occasionally for warmth but never every line.
Avoid politics or religion.
`;

// 🍳 Parser prompt with inline calorie reference
const parserSys = `
You are a nutrition data parser.
You ALWAYS return a single valid JSON:
{"food":"", "quantity": number|null, "unit":"", "calories": number|null}

If you find a food from this table, use its calories:
apple:72, banana:89, orange:62, egg:68, falafel sandwich:350,
rice:206, chicken:165, bread:80, coffee:2, yogurt:59, salad:120, pasta:220.

If food not in list, estimate a typical portion size and calories.
If nothing found, return {"food":null}.
`;

// 🍎 Parser function
async function extractFood(userInput) {
  const endTimer = timer();
  try {
    const r = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: parserSys },
        { role: "user", content: userInput },
      ],
      temperature: 0.1,
      max_tokens: 150,
    });

    const text = r.choices[0].message.content || "";
    const match = text.match(/{[\s\S]*}/);
    const obj = match ? JSON.parse(match[0]) : { food: null };

    // ✅ Fallback from local DB
    if (obj.food && !obj.calories) {
      const normalized = obj.food.toLowerCase().trim();
      obj.calories = foodDB[normalized] ?? null;
    }

    obj.quantity = obj.quantity ?? 1;
    obj.unit = obj.unit || "piece";

    console.log("🍽️ Parsed:", obj);
    return obj;
  } catch (err) {
    console.error("❌ Parser error:", err);
    return { food: null, quantity: null, unit: null, calories: null };
  }
}

// 💬 Chat route
app.post("/chat", async (req, res) => {
  const user = String(req.body.message ?? "").trim();
  console.log("🟢 User:", user);
  const endTimer = timer();

  try {
    const loggingIntent = wantsLogging(user);

    // 🧠 Step 1: Friendly reply
    const replyRes = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: replySys },
        { role: "user", content: user },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    let reply = replyRes.choices[0].message.content || "Got it!";
    const usage = replyRes.usage || {};
    console.log(`💬 Buddy reply (${usage.total_tokens} tokens): ${reply}`);

    // 🍎 Step 2: Extract structured food data if user wants logging
    let data = { food: null };
    if (loggingIntent) {
      data = await extractFood(user);
      if (data.food) {
        const kcalText = data.calories ? `(${data.calories} kcal)` : "(unknown kcal)";
        reply = `✅ Logged "${data.food}" ${kcalText}\n\n${reply}`;
      }
    }

    res.json({ reply, data });
  } catch (err) {
    console.error("🔥 Chat route error:", err);
    res.status(500).json({
      reply: "Oops! Something went wrong 😅. Let’s try again in a sec.",
      data: { food: null },
    });
  }

  console.log("⏱️ Total duration:", endTimer(), "s");
});

app.listen(3000, () =>
  console.log("🚀 Buddy Server v5 running on http://localhost:3000")
);
