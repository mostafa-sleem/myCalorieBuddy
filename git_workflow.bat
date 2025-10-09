@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MyCalorieBuddy Git Workflow Script
color 0A

echo =====================================================
echo             MyCalorieBuddy Git Workflow Script
echo =====================================================
echo.

:: --- Detect current branch ---
for /f "tokens=*" %%b in ('git rev-parse --abbrev-ref HEAD') do set "branch=%%b"
echo Current branch: !branch!
echo.

:: --- Commit ---
set /p commitMsg=Commit message: 
if "!commitMsg!"=="" set "commitMsg=update"
git add . ":!env!" >nul 2>&1
git reset HEAD .env >nul 2>&1
git commit -m "!commitMsg!"
echo.

:: --- Push to current branch ---
echo Pushing to !branch! ...
git push origin !branch!
echo.

:: --- Tag flow (uses CHOICE to avoid input parsing bugs) ---
choice /M "Tag this version?" /C YN
if errorlevel 2 (
  echo Skipping tagging.
) else (
  set /p tagName=Enter tag name 
  :: Trim surrounding quotes/spaces if any
  for /f "delims=" %%A in ("!tagName!") do set "tagName=%%~A"
  if "!tagName!"=="" (
    echo ^>^> ⚠  Tag name cannot be empty. Skipping tagging.
  ) else (
    echo Creating tag "!tagName!" ...
    git tag -a "!tagName!" -m "Version !tagName!"
    if errorlevel 1 (
      echo ^>^> ⚠  Tag creation failed. Leaving window open.
      goto end
    )
    git push origin "!tagName!"
    if errorlevel 1 (
      echo ^>^> ⚠  Tag push failed. Leaving window open.
      goto end
    )
    echo Tag "!tagName!" created and pushed!
  )
)
echo.

:: --- Push to main ---
choice /M "Push to main?" /C YN
if errorlevel 2 (
  echo Skipping push to main.
) else (
  echo.
  echo Switching to main branch...
  git checkout main
  git merge !branch!
  git push origin main
  git checkout !branch!
  echo Main branch updated.
)
echo.

:: --- New branch ---
choice /M "Create new branch?" /C YN
if errorlevel 2 (
  echo Skipping new branch creation.
) else (
  set /p newBranch=Enter new branch name 
  for /f "delims=" %%A in ("!newBranch!") do set "newBranch=%%~A"
  if "!newBranch!"=="" (
    echo ^>^> ⚠  No branch name entered. Skipping.
  ) else (
    git checkout -b "!newBranch!"
    git push -u origin "!newBranch!"
    echo Created and pushed new branch "!newBranch!".
  )
)
echo.

:end
echo =====================================================
echo  All done! Press any key to close.
echo =====================================================
pause >nul
endlocal
exit /b
