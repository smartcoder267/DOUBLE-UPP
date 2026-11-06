@echo off
:: ============================================================
::  PulaPay — Run / Build Launcher
::  Place this in: pulapay-mobile\
::  Usage: pulapay.bat [run|build|install|device]
:: ============================================================

FOR %%I IN ("%~dp0..") DO SET "APP_DIR=%%~fI"
SET JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot
SET ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
SET PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%PATH%

IF "%1"=="" GOTO MENU

IF /I "%1"=="run"     GOTO RUN
IF /I "%1"=="build"   GOTO BUILD
IF /I "%1"=="install" GOTO INSTALL
IF /I "%1"=="device"  GOTO DEVICE
IF /I "%1"=="help"    GOTO HELP
GOTO MENU

:: ============================================================
:MENU
echo.
echo  =============================================
echo   PulaPay Dev Launcher
echo  =============================================
echo   [1] run      - Start Metro + run on device/emulator
echo   [2] build    - EAS cloud build (new APK)
echo   [3] install  - Push latest APK to connected device
echo   [4] device   - List connected Android devices
echo   [5] help     - Show full usage
echo  =============================================
echo.
SET /P CHOICE=Choose option (1-5): 
IF "%CHOICE%"=="1" GOTO RUN
IF "%CHOICE%"=="2" GOTO BUILD
IF "%CHOICE%"=="3" GOTO INSTALL
IF "%CHOICE%"=="4" GOTO DEVICE
IF "%CHOICE%"=="5" GOTO HELP
GOTO MENU

:: ============================================================
:RUN
echo.
echo [PulaPay] Starting Metro bundler and launching on device...
echo [PulaPay] Make sure an emulator is running or a device is connected via USB.
echo.
cd /d "%APP_DIR%"
npx expo start --android
GOTO END

:: ============================================================
:BUILD
echo.
echo [PulaPay] Triggering EAS cloud build (Android preview)...
echo [PulaPay] This uploads your code and builds on Expo servers.
echo [PulaPay] You will receive an APK download link when done.
echo.
cd /d "%APP_DIR%"
eas build --platform android --profile preview --non-interactive
GOTO END

:: ============================================================
:INSTALL
echo.
echo [PulaPay] Installing APK on connected device...
cd /d "%APP_DIR%"

:: Try the most recent APK in the directory
IF EXIST "artifacts\apk\PulaPay-Demo.apk" (
    echo [PulaPay] Found PulaPay-Demo.apk — installing...
    adb install -r "artifacts\apk\PulaPay-Demo.apk"
) ELSE (
    echo [PulaPay] No local APK found.
    echo [PulaPay] Run option [2] to build a new one, then download it here.
    echo [PulaPay] Or download the latest APK from:
    echo            https://expo.dev/accounts/loagorantao/projects/pulapay/builds
)
GOTO END

:: ============================================================
:DEVICE
echo.
echo [PulaPay] Connected Android devices:
adb devices -l
echo.
echo [PulaPay] Running emulators:
adb emu avd name 2>nul || echo   (no emulator running)
GOTO END

:: ============================================================
:HELP
echo.
echo  Usage: pulapay.bat [command]
echo.
echo  Commands:
echo    run      Start Metro bundler and open on Android device or emulator
echo    build    Trigger EAS cloud build — produces a downloadable APK
echo    install  Push a local APK file to a connected device via adb
echo    device   List all connected Android devices and emulators
echo.
echo  EAS Builds page:
echo    https://expo.dev/accounts/loagorantao/projects/pulapay/builds
echo.
echo  Latest build:
echo    https://expo.dev/accounts/loagorantao/projects/pulapay/builds/714e324e-75b4-4d61-8950-d8148b1ebe8a
echo.
GOTO END

:END
echo.
pause

