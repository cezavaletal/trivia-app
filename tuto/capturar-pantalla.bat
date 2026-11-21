@echo off
title Capturador de Pantalla - Antigravity Tutorial
echo ==========================================================
echo Capturando pantalla del IDE de Antigravity...
echo ==========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0capturar-pantalla.ps1" -Nombre "antigravity_ide"
echo.
echo Presiona cualquier tecla para salir...
pause >nul
