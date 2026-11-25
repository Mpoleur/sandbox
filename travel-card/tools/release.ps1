# Builds a release APK of Travel Card on this PC and checks it (Technical Analysis 13.4 and DR-14).
# Usage: powershell -File tools\release.ps1 [-Variant public|review] [-SkipTests]
# It stops at the first failure. It changes no system setting: ANDROID_HOME is set for this process only.
# It never creates a signing key: the project's default signing is used (decision DR-03).
param(
  [ValidateSet('public', 'review')][string]$Variant = 'public',
  [switch]$SkipTests
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)   # travel-card/
$app = Join-Path $root 'app'
$dist = Join-Path $root 'dist'
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$env:APP_VARIANT = $Variant
Set-Location $app

function Step($m) { Write-Host "`n== $m" -ForegroundColor Cyan }
function Run($exe, $argList) { & $exe @argList; if ($LASTEXITCODE -ne 0) { throw "$exe failed with exit code $LASTEXITCODE" } }

# Version rule: every release raises versionCode (Architecture 9.1)
Step 'Read version from app.config.ts'
$pkg = & npx expo config --json --type public 2>$null | ConvertFrom-Json
$version = $pkg.version
$code = [int]$pkg.android.versionCode
$package = $pkg.android.package
Write-Host "variant=$Variant package=$package version=$version versionCode=$code"
$logPath = Join-Path $app 'releases.json'
$log = if (Test-Path $logPath) { @(Get-Content $logPath -Raw | ConvertFrom-Json) } else { @() }
$last = $log | Where-Object { $_.variant -eq $Variant } | Sort-Object { [int]$_.versionCode } | Select-Object -Last 1
if ($last -and $code -le [int]$last.versionCode) { throw "versionCode $code is not higher than the last $Variant release ($($last.versionCode)). Raise android.versionCode in app.config.ts." }

if (-not $SkipTests) {
  Step 'Tests and type check'
  Run 'npm' @('test', '--silent')
  Run 'npx' @('tsc', '--noEmit')
}
Step 'Generated drawings up to date?'
Run 'python' @('-I', (Join-Path $root 'tools\build_symbols.py'))
$changed = & git -C $root status --porcelain -- app/src/generated
if ($changed) { Write-Host "note: generated symbols changed ($changed). Commit them." }

# Windows limit (found in check C1): the C++ build tool cannot handle file paths longer than 260 characters, and some
# libraries of Expo SDK 58 (gesture handler, safe area) need about 40 characters more than the real folder
# C:\Users\Matth\Documents\sandbox\travel-card\app allows. So the native build runs in a copy of the app on a short path.
# The copy holds sources only (no secrets), is refreshed from the real folder every time, and can be deleted at any time.
$mirror = if ($env:TC_BUILD_DIR) { $env:TC_BUILD_DIR } else { 'C:\b' }
Step "Copy the app to the short build folder $mirror"
New-Item -ItemType Directory -Force $mirror | Out-Null
& robocopy $app $mirror /MIR /XD node_modules android .expo /XF releases.json .lock-hash /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }
$lockHash = (Get-FileHash (Join-Path $app 'package-lock.json') -Algorithm SHA256).Hash
$stamp = Join-Path $mirror '.lock-hash'
Set-Location $mirror
if (-not (Test-Path (Join-Path $mirror 'node_modules')) -or -not (Test-Path $stamp) -or ((Get-Content $stamp -Raw).Trim() -ne $lockHash)) {
  Step 'npm ci in the short build folder'
  Run 'npm' @('ci', '--no-audit', '--no-fund')
  Set-Content $stamp $lockHash
}
Step 'Prebuild (generates android\ from app.config.ts)'
Run 'npx' @('expo', 'prebuild', '--platform', 'android', '--clean')
Step 'Gradle assembleRelease'
Push-Location (Join-Path $mirror 'android')
try { Run '.\gradlew.bat' @('assembleRelease', '--console=plain') } finally { Pop-Location }

$built = Join-Path $mirror 'android\app\build\outputs\apk\release\app-release.apk'
if (-not (Test-Path $built)) { throw "APK not found at $built" }
New-Item -ItemType Directory -Force $dist | Out-Null
$tag = $out = Join-Path $dist "TravelCard-$Variant$tag-$version-$code.apk"
Copy-Item $built $out -Force

Step 'APK checks'
$checkOut = & powershell -NoProfile -File (Join-Path $root 'tools\check-apk.ps1') -Apk $out -ExpectPackage $package -AllowedPermissions 'android.permission.CAMERA' 2>&1
$checkOut | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) { throw 'APK checks failed' }
$fp = ($checkOut | Where-Object { $_ -like 'Signature SHA-256 fingerprint:*' }) -replace '.*: ', ''
$first = $log | Select-Object -First 1
if ($first -and $first.signatureSha256 -ne $fp) { throw "Signature fingerprint $fp differs from the first release ($($first.signatureSha256)). Updates would not keep the cards." }

$entry = [ordered]@{
  variant = $Variant; package = $package; version = $version; versionCode = $code
  file = (Split-Path $out -Leaf); bytes = (Get-Item $out).Length
  sha256 = (Get-FileHash $out -Algorithm SHA256).Hash.ToLower(); signatureSha256 = $fp
  built = (Get-Date).ToString('yyyy-MM-dd HH:mm')
}
$log = @($log) + [pscustomobject]$entry
[System.IO.File]::WriteAllText($logPath, (ConvertTo-Json -InputObject @($log) -Depth 4), (New-Object System.Text.UTF8Encoding $false))
Write-Host "`nDone: $out" -ForegroundColor Green
