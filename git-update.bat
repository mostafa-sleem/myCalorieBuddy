@echo off
echo Starting Git automation for myCalorieBuddy...

REM Commit and tag current version
set /p TAG="Enter version tag (e.g., v1.2): "
git add .
git commit -m "Auto commit for %TAG%"
git tag %TAG%
git push origin main --tags

REM Ask to create new branch
set /p BRANCH="Enter new branch name (e.g., wip-1.3): "
git checkout -b %BRANCH%

echo  Done! You are now on branch: %BRANCH%
pause
