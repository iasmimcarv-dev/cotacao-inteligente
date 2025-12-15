@echo off
echo.
echo ================================
echo   Iniciando Backend e Frontend
echo ================================
echo.

REM Iniciar o Backend em uma nova janela
echo [Backend] Iniciando FastAPI na porta 8000...
start "Backend FastAPI" cmd /k "cd /d %~dp0 && echo === Backend FastAPI === && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

REM Aguardar 3 segundos
timeout /t 3 /nobreak >nul

REM Iniciar o Frontend em uma nova janela
echo [Frontend] Iniciando React + Vite na porta 5173...
start "Frontend React" cmd /k "cd /d %~dp0 && echo === Frontend React + Vite === && npm run dev"

echo.
echo ================================
echo   Servicos iniciados!
echo ================================
echo   Backend:  http://127.0.0.1:8000
echo   Frontend: http://localhost:5173
echo   Docs API: http://127.0.0.1:8000/docs
echo ================================
echo.
echo Para parar os servicos, feche as janelas abertas.
echo.
pause
