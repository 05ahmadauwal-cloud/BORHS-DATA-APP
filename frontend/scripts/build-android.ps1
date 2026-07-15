$ErrorActionPreference = 'Stop'

if (-not $env:JAVA_HOME) {
  $bundledJdk = Join-Path $env:ProgramFiles 'Android\Android Studio\jbr'
  if (Test-Path (Join-Path $bundledJdk 'bin\java.exe')) {
    $env:JAVA_HOME = $bundledJdk
  } else {
    throw 'JDK not found. Install Android Studio or set JAVA_HOME to JDK 21.'
  }
}

if (-not $env:ANDROID_HOME) {
  $defaultSdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
  if (Test-Path $defaultSdk) {
    $env:ANDROID_HOME = $defaultSdk
  } else {
    throw 'Android SDK not found. Install SDK 36 in Android Studio or set ANDROID_HOME.'
  }
}

Write-Host "Using JAVA_HOME=$env:JAVA_HOME"
Write-Host "Using ANDROID_HOME=$env:ANDROID_HOME"

Push-Location (Join-Path $PSScriptRoot '..\android')
try {
  & .\gradlew.bat assembleDebug --console=plain
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}

$apk = Join-Path $PSScriptRoot '..\android\app\build\outputs\apk\debug\app-debug.apk'
Write-Host "APK created: $([System.IO.Path]::GetFullPath($apk))"
