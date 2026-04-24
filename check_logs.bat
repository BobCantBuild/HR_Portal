@echo off
REM Check Android logs for HR Portal app errors

echo.
echo ====================================
echo HR Portal - Check App Logs
echo ====================================
echo.
echo This will show recent logs from your phone.
echo Look for any ERROR messages related to the app.
echo.

set ADB_PATH=C:\Android\platform-tools\adb.exe

if not exist "%ADB_PATH%" (
    echo ERROR: adb not found at %ADB_PATH%
    exit /b 1
)

echo Checking device connection...
"%ADB_PATH%" devices
echo.

echo Showing recent logs (press Ctrl+C to stop)...
echo.
"%ADB_PATH%" logcat -d | findstr /i "hrportal\|error\|fatal\|exception" | findstr /v "chromium\|webview" | tail -20

echo.
echo If you see errors, copy them and share for debugging.
echo.
pause