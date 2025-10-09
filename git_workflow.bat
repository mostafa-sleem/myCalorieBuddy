@echo off
title MyCalorieBuddy Git Workflow Script
color 0A
echo =====================================================
echo             MyCalorieBuddy Git Workflow Script
echo =====================================================
echo.

:: Get current branch
for /f "tokens=*" %%b in ('git rev-parse --abbrev-ref HEAD') do set "branch=%%b"
echo Current branch: %branch%
echo.

:: Commit changes
set /p commitMsg=Commit message: 
if "%commitMsg%"=="" set commitMsg=update
git add .
git commit -m "%commitMsg%"
echo.

:: Push to current branch
echo Pushing to %branch% ...
git push origin %branch%
echo.

:: Tagging
setlocal enabledelayedexpansion
set /p tagYN=Tag this version? (y/n): 
if /i "!tagYN!"=="y" (
    set /p tagName=Enter tag name (e.g. v1.3.2): 
    if not "!tagName!"=="" (
        git tag -a "!tagName!" -m "Version !tagName!"
        git push origin "!tagName!"
        echo ✅ Tag "!tagName!" created and pushed!
    ) else (
        echo ⚠️ Tag name cannot be empty. Skipping tagging.
    )
)
endlocal
echo.

:: Push to main
set /p mainYN=Push to main? (y/n): 
if /i "%mainYN%"=="y" (
    git checkout main
    git merge %branch%
    git push origin main
    git checkout %branch%
)
echo.

:: Create new branch
set /p newYN=Create new branch? (y/n): 
if /i "%newYN%"=="y" (
    set /p newBranch=Enter new branch name: 
    if not "%newBranch%"=="" (
        git checkout -b "%newBranch%"
        git push -u origin "%newBranch%"
    ) else (
        echo ⚠️ No branch name entered. Skipping.
    )
)
echo.

echo ✅ Done!
pause
