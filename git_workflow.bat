@echo off
color 0A
title MyCalorieBuddy Git Workflow

echo ===============================================
echo        MyCalorieBuddy Git Workflow Script
echo ===============================================
echo.

rem 1. Make sure we're inside a git repo
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo This is not a Git repository.
    pause
    exit /b
)

rem 2. Show current branch
for /f %%a in ('git branch --show-current') do set branch=%%a
echo Current branch: %branch%
echo.

rem 3. Commit
set /p msg=Commit message: 
if "%msg%"=="" set msg=Update
git add .
git commit -m "%msg%"
echo.

rem 4. Push
echo Pushing to %branch%...
git push origin %branch%
if errorlevel 1 (
    echo Push failed. Check errors above.
    pause
    exit /b
)
echo Done.
echo.

rem 5. Tag (optional)
set /p tagYN=Tag this version? (y/n): 
if /i "%tagYN%"=="y" (
    set /p tagName=Tag name (v1.3): 
    set /p tagMsg=Tag message: 
    git tag -a "%tagName%" -m "%tagMsg%"
    git push origin "%tagName%"
)

echo.
rem 6. Push to main (optional)
set /p mainYN=Push to main? (y/n): 
if /i "%mainYN%"=="y" (
    git push origin %branch%:main --force
)

echo.
rem 7. Create new branch (optional)
set /p newYN=Create new branch? (y/n): 
if /i "%newYN%"=="y" (
    set /p newBranch=New branch name: 
    if "%newBranch%"=="" set newBranch=wip-next
    git checkout -b %newBranch%
    echo Switched to %newBranch%.
)

echo ===============================================
echo Workflow complete.
echo ===============================================
pause
