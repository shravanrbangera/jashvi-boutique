@echo off
echo ====================================================
echo   Starting Jashvi Boutique Full-Stack Application
echo ====================================================
echo.
echo [1/2] Launching Backend Server (Node.js/Express) on port 5000...
start "Jashvi Boutique - Backend" cmd /k "cd /d "%~dp0server" && node src/server.js"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Frontend Client (React/Vite) on port 5173...
start "Jashvi Boutique - Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Application successfully launched!
echo - Customer Storefront: http://localhost:5173
echo - Admin Portal:        http://localhost:5173/admin/login
echo - Backend API:         http://localhost:5000
echo.
echo Opening Jashvi Boutique in default browser...
start http://localhost:5173
