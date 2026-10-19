@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ========================================
echo      CAMPOVIVO - Gestao Rural
echo ========================================
echo.
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js nao encontrado. Instale o Node.js 20.9 ou mais recente em https://nodejs.org
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo Instalando dependencias (apenas na primeira vez)...
  call npm install
  if errorlevel 1 (
    echo Falha ao instalar dependencias. Verifique sua internet.
    pause
    exit /b 1
  )
)
echo.
echo Acesse http://localhost:3000 no navegador.
echo Para encerrar, pressione Ctrl + C nesta janela.
echo.
call npm run dev
pause
