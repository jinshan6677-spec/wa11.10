@echo off
echo Starting WhatsApp Desktop Translation...
echo.

if exist "dist\win-unpacked\WhatsApp Desktop Translation.exe" (
    echo Found packaged application
    start "" "dist\win-unpacked\WhatsApp Desktop Translation.exe"
) else (
    echo Packaged application not found. Running in development mode...
    npm start
)
