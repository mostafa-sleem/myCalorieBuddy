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

:: Tag section
echo.
set /p tagYN=Tag this version? (y/n) 
if /i "%tagYN%"=="y" (
    echo.
    set /p tagName=Enter tag name (e.g. v1.3.2): 
    if "%tagName%"=="" (
        echo ⚠️  Tag name cannot be empty. Skipping tagging.
    ) else (
        echo Creating tag "%tagName%" ...
        git tag -a "%tagName%" -m "Version %tagName%"
        git push origin "%tagName%"
        if errorlevel 1 (
            echo ⚠️  Tag push failed.
        ) else (
            echo ✅ Tag "%tagName%" created and pushed!
        )
    )
) else (
    echo Skipping tagging.
)
echo.

:: Push to main branch
set /p mainYN=Push to main? (y/n): 
if /i "%mainYN%"=="y" (
    echo.
    echo Switching to main branch...
    git checkout main
    git merge %branch%
    git push origin main
    git checkout %branch%
    echo ✅ Main branch updated.
) else (
    echo Skipping push to main.
)
echo.

:: Create new branch
set /p newYN=Create new branch? (y/n) 
if /i "%newYN%"=="y" (
    echo.
    set /p newBranch=Enter new branch name: 
    if "%newBranch%"=="" (
        echo ⚠️  No branch name entered. Skipping.
    ) else (
        git checkout -b "%newBranch%"
        git push -u origin "%newBranch%"
        echo ✅ Created and pushed new branch "%newBranch%".
    )
) else (
    echo Skipping new branch creation.
)
echo.

echo =====================================================
echo ✅  All done! Press any key to close.
echo =====================================================
pause >nul
exit /b
