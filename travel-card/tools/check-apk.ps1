# Checks a built APK with Android's own tools (Technical Analysis 13.4, steps 6 to 9).
# Usage: powershell -File tools\check-apk.ps1 -Apk dist\TravelCard-public-0.1.0-1.apk [-ExpectPackage com.poleur.cards]
# Prints package, version, SDK levels, permissions, allowBackup and the signature fingerprint. Exit code 1 on any failed rule.
# Nothing here changes system settings: ANDROID_HOME is read, or defaulted for this process only.
param(
  [Parameter(Mandatory = $true)][string]$Apk,
  [string]$ExpectPackage = 'com.poleur.cards',
  [string[]]$AllowedPermissions = @()   # extra permissions allowed (milestone 2 adds android.permission.CAMERA)
)
$ErrorActionPreference = 'Stop'
$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$bt = Get-ChildItem (Join-Path $sdk 'build-tools') | Sort-Object { [version]($_.Name -replace '[^0-9.]', '') } | Select-Object -Last 1
$aapt2 = Join-Path $bt.FullName 'aapt2.exe'
$apksigner = Join-Path $bt.FullName 'apksigner.bat'
$Apk = (Resolve-Path $Apk).Path
$fail = @()

$badging = & $aapt2 dump badging $Apk
$pkgLine = $badging | Where-Object { $_ -like 'package:*' } | Select-Object -First 1
$sdkLine = $badging | Where-Object { $_ -like 'sdkVersion:*' }
$tgtLine = $badging | Where-Object { $_ -like 'targetSdkVersion:*' }
Write-Host "APK:        $Apk"
Write-Host "Size:       $([math]::Round((Get-Item $Apk).Length / 1MB, 2)) MB ($((Get-Item $Apk).Length) bytes)"
Write-Host "SHA-256:    $((Get-FileHash $Apk -Algorithm SHA256).Hash.ToLower())"
Write-Host $pkgLine
Write-Host $sdkLine
Write-Host $tgtLine
if ($pkgLine -notmatch "name='$([regex]::Escape($ExpectPackage))'") { $fail += "package is not $ExpectPackage" }

# Permissions: nothing except what is allowed. INTERNET and WRITE_SETTINGS must never appear.
$perms = (& $aapt2 dump permissions $Apk) | Where-Object { $_ -like 'uses-permission*' } |
  ForEach-Object { if ($_ -match "name='([^']+)'") { $Matches[1] } }
$allowed = @("$ExpectPackage.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION") + $AllowedPermissions
Write-Host "Permissions: $(if ($perms) { $perms -join ', ' } else { '(none)' })"
foreach ($p in $perms) { if ($allowed -notcontains $p) { $fail += "unexpected permission $p" } }
if ($perms -contains 'android.permission.INTERNET') { $fail += 'INTERNET present' }
if ($perms -contains 'android.permission.WRITE_SETTINGS') { $fail += 'WRITE_SETTINGS present' }

# allowBackup must be false; the APK must not be debuggable. aapt2 prints booleans as true / false.
$tree = (& $aapt2 dump xmltree --file AndroidManifest.xml $Apk) -join "`n"
if ($tree -match 'allowBackup\([^)]*\)=(\w+)') {
  Write-Host "allowBackup: $($Matches[1])"
  if ($Matches[1] -ne 'false') { $fail += 'allowBackup is not false' }
} else { Write-Host 'allowBackup: not found in manifest'; $fail += 'allowBackup not found' }
if ($tree -match 'debuggable\([^)]*\)=(\w+)') { Write-Host "debuggable: $($Matches[1])"; if ($Matches[1] -eq 'true') { $fail += 'APK is debuggable' } }
else { Write-Host 'debuggable: not set (false)' }

# Signature. The label of the lines differs between apksigner versions ("Signer #1" or "V2 Signer").
$certs = (& $apksigner verify --verbose --print-certs $Apk) -join "`n"
$sha = if ($certs -match '(?:Signer #1|V\d(?:\.\d)? Signer):? certificate SHA-256 digest: (\w+)') { $Matches[1] } else { '' }
$dn = if ($certs -match '(?:Signer #1|V\d(?:\.\d)? Signer):? certificate DN: ([^\n]+)') { $Matches[1].Trim() } else { '' }
Write-Host "Signature:  verified=$($certs -match 'Verifies')  DN=$dn"
Write-Host "Signature SHA-256 fingerprint: $sha"
if (-not $sha -or $certs -notmatch 'Verifies') { $fail += 'signature not verified' }

if ($fail.Count) { Write-Host "FAILED: $($fail -join '; ')" -ForegroundColor Red; exit 1 }
Write-Host 'All APK checks passed.' -ForegroundColor Green
