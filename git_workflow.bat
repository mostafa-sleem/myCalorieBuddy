@echo off
title Git Workflow Wizard
echo.
echo === GIT WORKFLOW WIZARD ===
echo.

rem --- Step 1: Add and commit changes ---
set /p commitMsg=Enter commit message: 
if "%commitMsg%"=="" set commitMsg=update
git add .
git commit -m "%commitMsg%"

rem --- Step 2: Push to current branch ---
echo.
set /p pushYN=Push changes to current branch? (y/n): 
if /i "%pushYN%"=="y" (
    git push
)

rem --- Step 3: Tag current version ---
echo.
set /p tagYN=Tag current version? (y/n): 
if /i "%tagYN%"=="y" (
    set /p tagName=Enter tag name (e.g. v1.3.2): 
    git tag -a "%tagName%" -m "Version %tagName%"
    git push origin "%tagName%"
    echo Tag "%tagName%" created and pushed!
    echo.
)

rem --- Step 4: Push to main branch ---
set /p mainYN=Push to main as well? (y/n): 
if /i "%mainYN%"=="y" (
    git checkout main
    git merge -
    git push origin main
    git checkout -
)

rem --- Step 5: Create new branch ---
echo.
set /p newYN=Create new branch? (y/n): 
if /i "%newYN%"=="y" (
    set /p newBranch=Enter new branch name: 
    if "%newBranch%"=="" (
        echo No branch name entered, skipping.
    ) else (
        git checkout -b "%newBranch%"
        git push -u origin "%newBranch%"
    )
)

echo.
echo ✅ All done!
pause
