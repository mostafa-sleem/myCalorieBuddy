@echo off
title Starting MyCalorieBuddy Backend

:: Go to backend directory
cd backend_myCalorieBuddy

:: Start Node server in a new window
echo Starting Node server...
start cmd /k "node server.js"

:: Wait 5 seconds to ensure the server starts before ngrok
timeout /t 5 /nobreak >nul

:: Start ngrok tunnel in a new window
echo Starting ngrok tunnel...
start cmd /k "ngrok http 3000"

:: Return to main folder
cd ..
echo Backend and ngrok started successfully!
exit
