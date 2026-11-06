# ============================================================
#  PulaPay Dev Launcher
#  Usage:  .\pulapay.ps1 [run | build | install | device | help]
# ============================================================

param([string]$Command = "menu")

$AppDir   = Split-Path -Parent $PSScriptRoot
$JavaHome = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$AndroidSdk = "$env:LOCALAPPDATA\Android\Sdk"

# Inject paths
$env:JAVA_HOME    = $JavaHome
$env:ANDROID_HOME = $AndroidSdk
$env:Path         = "$JavaHome\bin;$AndroidSdk\platform-tools;$AndroidSdk\tools;$env:Path"

function Show-Banner {
    Write-Host ""
    Write-Host "  =============================================" -ForegroundColor DarkGreen
    Write-Host "   PulaPay Dev Launcher" -ForegroundColor Green
    Write-Host "  =============================================" -ForegroundColor DarkGreen
    Write-Host "   run      - Start Metro + run on device" -ForegroundColor Cyan
    Write-Host "   build    - EAS cloud build (new APK)" -ForegroundColor Cyan
    Write-Host "   install  - Push APK to connected device" -ForegroundColor Cyan
    Write-Host "   device   - List connected Android devices" -ForegroundColor Cyan
    Write-Host "  =============================================" -ForegroundColor DarkGreen
    Write-Host ""
}

function Start-Run {
    Write-Host "[PulaPay] Starting Expo Metro bundler..." -ForegroundColor Green
    Write-Host "[PulaPay] Make sure an emulator or USB device is connected." -ForegroundColor Yellow
    Write-Host ""
    Set-Location $AppDir
    npx expo start --android
}

function Start-Build {
    Write-Host "[PulaPay] Triggering EAS cloud build (Android preview profile)..." -ForegroundColor Green
    Write-Host "[PulaPay] This uploads your workspace and builds on Expo servers." -ForegroundColor Yellow
    Write-Host "[PulaPay] You will get an APK link when the build finishes (~5-10 min)." -ForegroundColor Yellow
    Write-Host ""
    Set-Location $AppDir
    eas build --platform android --profile preview --non-interactive
}

function Start-Install {
    Write-Host "[PulaPay] Pushing APK to connected Android device..." -ForegroundColor Green
    Set-Location $AppDir

    $apkPath = Join-Path $AppDir "artifacts\apk\PulaPay-Demo.apk"
    if (Test-Path $apkPath) {
        Write-Host "[PulaPay] Found: PulaPay-Demo.apk" -ForegroundColor Cyan
        adb install -r $apkPath
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[PulaPay] Install successful!" -ForegroundColor Green
            Write-Host "[PulaPay] Launching app on device..." -ForegroundColor Cyan
            adb shell am start -n "com.loagorantao.pulapay/.MainActivity" 2>$null
        } else {
            Write-Host "[PulaPay] Install failed. Check device connection." -ForegroundColor Red
        }
    } else {
        Write-Host "[PulaPay] No local APK found at: $apkPath" -ForegroundColor Red
        Write-Host "[PulaPay] Download latest APK from:" -ForegroundColor Yellow
        Write-Host "  https://expo.dev/accounts/loagorantao/projects/pulapay/builds" -ForegroundColor Cyan
        Write-Host "[PulaPay] Save it as PulaPay-Demo.apk in this folder, then run install again." -ForegroundColor Yellow
    }
}

function Show-Devices {
    Write-Host "[PulaPay] Connected Android devices:" -ForegroundColor Green
    adb devices -l
    Write-Host ""
    Write-Host "[PulaPay] Tip: Enable USB Debugging on your phone under Developer Options." -ForegroundColor Yellow
}

function Show-Help {
    Write-Host ""
    Write-Host "  PulaPay Dev Launcher — Commands" -ForegroundColor Green
    Write-Host ""
    Write-Host "  .\pulapay.ps1 run      - Launch app on device via Metro" -ForegroundColor Cyan
    Write-Host "  .\pulapay.ps1 build    - Build new APK via EAS cloud" -ForegroundColor Cyan
    Write-Host "  .\pulapay.ps1 install  - Install PulaPay-Demo.apk via adb" -ForegroundColor Cyan
    Write-Host "  .\pulapay.ps1 device   - List connected devices" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  EAS Builds:" -ForegroundColor Yellow
    Write-Host "  https://expo.dev/accounts/loagorantao/projects/pulapay/builds" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Latest APK (current build):" -ForegroundColor Yellow
    Write-Host "  https://expo.dev/accounts/loagorantao/projects/pulapay/builds/714e324e-75b4-4d61-8950-d8148b1ebe8a" -ForegroundColor Cyan
    Write-Host ""
}

# ---- Main dispatcher ----
switch ($Command.ToLower()) {
    "run"     { Start-Run }
    "build"   { Start-Build }
    "install" { Start-Install }
    "device"  { Show-Devices }
    "help"    { Show-Help }
    "menu"    {
        Show-Banner
        $choice = Read-Host "  Enter command"
        switch ($choice.ToLower()) {
            "run"     { Start-Run }
            "build"   { Start-Build }
            "install" { Start-Install }
            "device"  { Show-Devices }
            "help"    { Show-Help }
            default   { Write-Host "Unknown command. Try: run, build, install, device" -ForegroundColor Red }
        }
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Show-Help
    }
}

