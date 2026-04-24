@echo off
REM Install and launch HR Portal app on Android phone

setlocal enabledelayedexpansion

set ADB_PATH=C:\Android\platform-tools\adb.exe
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
set PACKAGE_NAME=com.ifb.hrportal
set ACTIVITY_NAME=.MainActivity

echo.
echo ====================================
echo HR Portal - Install on Phone Script
echo ====================================
echo.
echo This will uninstall the old app and install the fixed version.
echo.

REM Check if adb exists
if not exist "%ADB_PATH%" (
    echo ERROR: adb not found at %ADB_PATH%
    exit /b 1
)

REM Check if APK exists
if not exist "%APK_PATH%" (
    echo ERROR: APK not found at %APK_PATH%
    echo Have you run: npm run build:apk yet?
    exit /b 1
)

REM Check devices
echo Checking for connected devices...
"%ADB_PATH%" devices
echo.

REM Uninstall old app first
echo Uninstalling old app (if exists)...
"%ADB_PATH%" uninstall "%PACKAGE_NAME%"
echo.

REM Install new app
echo Installing updated app...
"%ADB_PATH%" install -r "%APK_PATH%"

if !errorlevel! equ 0 (
    echo.
    echo ✓ Installation successful!
    echo.
    echo Launching app...
    "%ADB_PATH%" shell am start -n "%PACKAGE_NAME%/%PACKAGE_NAME%%ACTIVITY_NAME%"
    echo.
    echo ✓ App should now be running on your phone!
    echo.
    echo If it still crashes, check the phone logs:
    echo adb logcat | findstr "ERROR"
    echo.
) else (
    echo.
    echo ERROR: Installation failed
    echo Make sure phone is connected and USB Debugging is enabled
    exit /b 1
)

pause
