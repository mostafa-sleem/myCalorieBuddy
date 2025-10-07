@echo off
title MyCalorieBuddy Git Workflow
color 0A

echo ====================================================
echo     MyCalorieBuddy Automated Git Workflow Script
echo ====================================================
echo.

:: Step 1 - Detect current branch cleanly
for /f %%a in ('git symbolic-ref --short HEAD') do set "branch=%%a"

echo Current branch detected: %branch%
echo.

:: Step 2 - Get commit message
set /p commitMsg=Enter commit message: 
echo.
echo Adding and committing changes...
git add .
git commit -m "%commitMsg%"
echo.

:: Step 3 - Push to current branch
echo Pushing changes to branch: %branch%
git push origin %branch%
echo.

:: Step 4 - Tag version (optional)
set /p tagChoice=Do you want to tag this version? (y/n): 
if /i "%tagChoice%"=="y" (
    set /p tagName=Enter tag name (e.g. v1.3): 
    set /p tagMsg=Enter tag message: 
    git tag -a "%tagName%" -m "%tagMsg%"
    git push origin "%tagName%"
    echo Tag %tagName% created and pushed successfully.
) else (
    echo Skipping tagging step.
)
echo.

:: Step 5 - Push to main (optional)
set /p mainChoice=Do you want to push this branch to main? (y/n): 
if /i "%mainChoice%"=="y" (
    echo Pushing current branch (%branch%) to main...
    git push origin %branch%:main --force
    echo Main branch updated successfully.
) else (
    echo Skipping push to main.
)
echo.

:: Step 6 - Create new branch (optional)
set /p branchChoice=Do you want to create a new branch? (y/n): 
if /i "%branchChoice%"=="y" (
    call :CreateBranch
) else (
    echo Skipping branch creation.
)
echo.

echo ====================================================
echo Workflow completed successfully.
echo ====================================================
pause
exit /b

:: ---------- Subroutine for branch creation ----------
:CreateBranch
set "prefix="
set "version="

for /f "tokens=1,2 delims=-" %%a in ("%branch%") do (
    set "prefix=%%a"
    set "version=%%b"
)

for /f "tokens=1,2 delims=." %%a in ("%version%") do (
    set "major=%%a"
    set "minor=%%b"
)

set /a nextMinor=%minor%+1
set "suggestedBranch=%prefix%-%major%.%nextMinor%"

set /p customBranch=Enter new branch name (or press Enter to use "%suggestedBranch%"): 
if "%customBranch%"=="" (
    set "finalBranch=%suggestedBranch%"
) else (
    set "finalBranch=%customBranch%"
)

git checkout -b "%finalBranch%"
echo Switched to new branch: %finalBranch%
exit /b
