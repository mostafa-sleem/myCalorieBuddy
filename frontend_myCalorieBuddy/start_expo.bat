@echo off
echo Starting Expo tunnel...
cd /d "%~dp0"
npx expo start -c --tunnel
pause
