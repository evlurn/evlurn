@echo off
cd /d "%~dp0"
echo Evlurn - previa local com dados de demonstracao
echo Abra http://127.0.0.1:4173/preview no navegador.
echo Mantenha esta janela aberta. Ctrl+C encerra a previa.
node scripts/preview.cjs
pause
