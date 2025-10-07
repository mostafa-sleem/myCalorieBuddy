\# 🍎 MyCalorieBuddy

\*\*MyCalorieBuddy\*\* is a friendly AI-powered calorie tracking assistant that helps users log meals, track nutrition, and stay motivated on their health journey. Built with \*\*React Native (Expo)\*\* for the frontend and \*\*Node.js / Express\*\* for the backend, it uses \*\*OpenAI\*\* to make calorie tracking feel personal and conversational.

---

\## 🚀 Features

\- 🧠 \*\*AI Chat Coach\*\* — Talk naturally with Buddy to log meals or snacks (text or voice)

\- 🍽️ \*\*Smart Food Recognition\*\* — Detects common foods and logs approximate calories

\- 🔄 \*\*Real-time Sync\*\* — Local + server data sync for reliable tracking

\- 📊 \*\*Progress Dashboard\*\* — Visual insights on calories and nutrition over time

\- 🎯 \*\*User Personalization\*\* — Tracks preferences and offers gentle suggestions

---

\## 🧩 Project Structure

MS\_2/

│

├── backend\_myCalorieBuddy/      # Node.js + Express backend

│   ├── server.js                # Backend entry point

│   ├── package.json             # Backend dependencies

│   ├── .env                     # Environment variables

│

├── frontend\_myCalorieBuddy/     # React Native (Expo) frontend

│   ├── app/                     # Screens and navigation

│   ├── components/              # Reusable UI components

│   ├── assets/                  # Images, icons, and media

│   ├── utils/                   # Helper functions

│   ├── package.json             # Frontend dependencies

│

├── start\_backend.bat            # Launches backend + ngrok

├── start\_expo.bat               # Launches Expo development app

└── README.md                    # Project documentation

---

\## ⚙️ Setup Instructions

\### 1. Clone the Repository

git clone https://github.com/mostafa-sleem/myCalorieBuddy.git

cd myCalorieBuddy

\### 2. Install Dependencies

Frontend:

cd frontend\_myCalorieBuddy

npm install

Backend:

cd ../backend\_myCalorieBuddy

npm install

\### 3. Environment Variables

Create a `.env` file inside `backend\_myCalorieBuddy/`:

OPENAI\_API\_KEY=your\_api\_key\_here

PORT=3000

\### 4. Start the App

Backend:

start\_backend.bat

(This starts both Node server and ngrok)

Frontend:

start\_expo.bat

Scan the QR code in Expo Go to launch the app.

---

\## 🧠 Tech Stack

Frontend:

\- React Native (Expo)

\- TypeScript

\- TailwindCSS (NativeWind)

Backend:

\- Node.js + Express

\- OpenAI API

\- dotenv

Utilities:

\- Ngrok (tunneling for local API)

\- AsyncStorage (local data caching)

---

\## 📘 Future Plans

\- Add voice + image food input

\- Introduce macronutrient tracking (protein, carbs, fats)

\- Enable user profiles + cloud storage

\- Add offline mode with intelligent sync

---

\## 💡 Developer Notes

This version is part of MVP 1.2, featuring unified frontend-backend integration and conversational logging improvements. All startup scripts are automated for quick testing.

---

\## 🧑‍💻 Author

\*\*Mostafa Ayman Seleem\*\*

Architect • Designer • Developer

📍 Munich, Germany

\[LinkedIn](https://linkedin.com/in/mostafa-seleem) | \[GitHub](https://github.com/mostafa-sleem)

---

\## 🪄 License

This project is released under the \*\*MIT License\*\* — feel free to modify and improve it.

---

> “A calorie tracker that actually talks to you — because motivation should feel human.”



