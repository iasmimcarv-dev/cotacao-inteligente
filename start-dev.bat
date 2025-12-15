@echo off
echo.
echo ================================
echo   Iniciando Backend e Frontend
echo ================================
echo.

REM Iniciar o Backend em uma nova janela
echo [Backend] Iniciando FastAPI na porta 8000...
start "Backend FastAPI" cmd /k "cd /d %~dp0backend && echo === Backend FastAPI === && %~dp0.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

REM Aguardar 2 segundos
timeout /t 2 /nobreak >nul

REM Iniciar o Frontend em uma nova janela
echo [Frontend] Iniciando React + Vite na porta 5173...
start "Frontend React" cmd /k "cd /d %~dp0frontend\react && echo === Frontend React + Vite === && npm run dev"

echo.
echo ================================
echo   Servicos iniciados!
echo ================================
echo   Backend:  http://127.0.0.1:8000
echo   Frontend: http://localhost:5173
echo ================================
echo.
echo Para parar os servicos, feche as janelas abertas.
echo.
pause
