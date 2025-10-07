@echo off
color 0A
title MyCalorieBuddy Git Workflow (Final Stable)

echo ===============================================
echo        MyCalorieBuddy Git Workflow Script
echo ===============================================
echo.

rem 1. Verify git repo
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo This is not a Git repository.
    pause
    exit /b
)

rem 2. Detect branch
for /f %%a in ('git branch --show-current') do set branch=%%a
if "%branch%"=="" (
    echo Could not detect current branch.
    pause
    exit /b
)
echo Current branch: %branch%
echo.

rem 3. Commit changes
set /p msg=Commit message: 
if "%msg%"=="" set msg=Update
git add .
git commit -m "%msg%"
echo.

rem 4. Push to branch
echo Pushing to %branch% ...
git push origin %branch%
if errorlevel 1 (
    echo Push failed. See messages above.
    pause
    exit /b
)
echo Done.
echo.

rem 5. Optional tagging
set /p tagYN=Tag this version? (y/n) 
if /i "%tagYN%"=="y" (
    echo.
    set /p tagName=Enter tag name (e.g. V_1.3)
    if "%tagName%"=="" (
        echo Tag name cannot be empty. Skipping tagging.
    ) else (
        set /p tagMsg=Enter tag message: 
        echo Creating tag "%tagName%"...
        git tag -a "%tagName%" -m "%tagMsg%"
        git push origin "%tagName%"
        if errorlevel 1 (
            echo WARNING: Tag push failed.
        ) else (
            echo Tag "%tagName%" pushed successfully.
        )
    )
)
echo.

rem 6. Optional push to main
set /p mainYN=Push to main? (y/n) 
if /i "%mainYN%"=="y" (
    echo Pushing %branch% to main...
    git push origin %branch%:main --force
    if errorlevel 1 (
        echo Push to main failed. Check branch protection.
        pause
        exit /b
    )
    echo Main branch updated.
)
echo.

rem 7. Optional create new branch
set /p newYN=Create new branch? (y/n): 
if /i "%newYN%"=="y" (
    echo.
    echo --- Creating new branch ---
)

if /i "%newYN%"=="y" (
    rem Extract prefix and version
    for /f "tokens=1,2 delims=-" %%a in ("%branch%") do (
        call set prefix=%%a
        call set version=%%b
    )
)

if /i "%newYN%"=="y" (
    for /f "tokens=1,2 delims=." %%a in ("%version%") do (
        call set major=%%a
        call set minor=%%b
    )
)

if /i "%newYN%"=="y" (
    if "%minor%"=="" set minor=0
    set /a nextMinor=%minor%+1
    set suggested=%prefix%-%major%.%nextMinor%
    echo Suggested new branch name: %suggested%
    set /p name=Enter new branch name (press Enter to use suggested): 
    if "%name%"=="" set name=%suggested%
    echo Creating new branch "%name%" ...
    git checkout -b "%name%"
    if errorlevel 1 (
        echo Failed to create branch. Please check the name.
    ) else (
        echo Switched to new branch: %name%
    )
)
echo.
echo ===============================================
echo Workflow complete.
echo ===============================================
pause
exit /b
