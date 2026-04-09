@echo off
echo ========================================
echo Creating React Project Folder Structure
echo ========================================
echo.

cd /d "%~dp0src"

echo Creating main folders...
mkdir components 2>nul
mkdir pages 2>nul
mkdir services 2>nul
mkdir hooks 2>nul
mkdir context 2>nul
mkdir utils 2>nul
mkdir layouts 2>nul

echo Creating component subfolders...
mkdir components\common 2>nul
mkdir components\auth 2>nul
mkdir components\school 2>nul
mkdir components\ngo 2>nul
mkdir components\startup 2>nul
mkdir components\marketplace 2>nul

echo Creating page folders...
mkdir pages\auth 2>nul
mkdir pages\dashboard 2>nul
mkdir pages\school 2>nul
mkdir pages\ngo 2>nul
mkdir pages\startup 2>nul
mkdir pages\marketplace 2>nul
mkdir pages\search 2>nul

echo Creating placeholder files...

REM Components
echo // Common reusable components > components\common\.gitkeep
echo // Authentication components > components\auth\.gitkeep
echo // School-specific components > components\school\.gitkeep
echo // NGO-specific components > components\ngo\.gitkeep
echo // Startup-specific components > components\startup\.gitkeep
echo // Marketplace components > components\marketplace\.gitkeep

REM Pages
echo // Authentication pages > pages\auth\.gitkeep
echo // Dashboard pages > pages\dashboard\.gitkeep
echo // School pages > pages\school\.gitkeep
echo // NGO pages > pages\ngo\.gitkeep
echo // Startup pages > pages\startup\.gitkeep
echo // Marketplace pages > pages\marketplace\.gitkeep
echo // Search page > pages\search\.gitkeep

REM Services
echo // API service files > services\.gitkeep

REM Hooks
echo // Custom React hooks > hooks\.gitkeep

REM Context
echo // React Context for state management > context\.gitkeep

REM Utils
echo // Utility functions > utils\.gitkeep

REM Layouts
echo // Layout components > layouts\.gitkeep

echo.
echo ========================================
echo Folder Structure Created Successfully!
echo ========================================
echo.
echo Created folders:
echo   - components/ (with subfolders: common, auth, school, ngo, startup, marketplace)
echo   - pages/ (with subfolders: auth, dashboard, school, ngo, startup, marketplace, search)
echo   - services/
echo   - hooks/
echo   - context/
echo   - utils/
echo   - layouts/
echo.
echo You can now proceed to Step 3: Setup React Router
echo.
pause
