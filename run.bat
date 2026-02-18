@echo off
set PORT=8000

start /min cmd /c "python -m http.server %PORT%"

timeout /t 1 >nul

start http://localhost:%PORT%/index.html

exit
