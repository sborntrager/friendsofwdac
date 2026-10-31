param(
  [string]$WorkerBase = "https://api.friendsofwdac.org",
  [string]$Origin = "https://friendsofwdac.org",
  [string]$AdminEmail = "",
  [string]$AdminPassword = "",
  [string]$Page = "home",
  [int]$Phase = 0
)

$ErrorActionPreference = "Stop"

function Convert-SecureStringToPlainText {
  param([Security.SecureString]$Secure)
  if (-not $Secure) { return "" }
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

function Set-NestedValue {
  param(
    [hashtable]$Target,
    [string]$Path,
    $Value
  )

  $segments = $Path -split "\."
  $cursor = $Target

  for ($index = 0; $index -lt $segments.Length; $index += 1) {
    $segment = $segments[$index]
    $isLeaf = $index -eq ($segments.Length - 1)

    if ($isLeaf) {
      $cursor[$segment] = $Value
      return
    }

    if (-not $cursor.ContainsKey($segment) -or -not ($cursor[$segment] -is [hashtable])) {
      $cursor[$segment] = @{}
    }

    $cursor = $cursor[$segment]
  }
}

function Get-NestedValue {
  param(
    $Source,
    [string]$Path
  )

  $cursor = $Source
  foreach ($segment in ($Path -split "\.")) {
    if ($null -eq $cursor) {
      return $null
    }

    if ($cursor -is [System.Collections.IDictionary]) {
      if (-not $cursor.Contains($segment)) {
        return $null
      }
      $cursor = $cursor[$segment]
      continue
    }

    $property = $cursor.PSObject.Properties[$segment]
    if (-not $property) {
      return $null
    }
    $cursor = $property.Value
  }

  return $cursor
}

$pageConfigs = @{
  "home" = @{ Phase = 1; FieldPath = "home.hero.kicker"; Prefix = "Friends of the WDAC | Smoke Test" }
  "about" = @{ Phase = 1; FieldPath = "about.hero.title"; Prefix = "Friends of the WDAC Smoke Test" }
  "membership" = @{ Phase = 2; FieldPath = "membership.hero.title"; Prefix = "Become a Friend Smoke Test" }
  "donate" = @{ Phase = 2; FieldPath = "donate.hero.title"; Prefix = "Fund what matters now Smoke Test" }
  "history" = @{ Phase = 3; FieldPath = "history.hero.title"; Prefix = "History Smoke Test" }
  "docs" = @{ Phase = 3; FieldPath = "docs.hero.title"; Prefix = "Forms and PDFs Smoke Test" }
  "news" = @{ Phase = 3; FieldPath = "news.hero.title"; Prefix = "Advocacy and Impact Smoke Test" }
}

$Page = ($Page | ForEach-Object { "$_".Trim().ToLowerInvariant() })
if (-not $pageConfigs.ContainsKey($Page)) {
  throw "Unsupported page '$Page'. Valid values: $($pageConfigs.Keys -join ', ')"
}

$pageConfig = $pageConfigs[$Page]
if ($Phase -le 0) {
  $Phase = [int]$pageConfig.Phase
} elseif ($Phase -ne [int]$pageConfig.Phase) {
  throw "Page '$Page' is configured for phase $($pageConfig.Phase), not phase $Phase."
}

if (-not $AdminEmail) {
  $AdminEmail = Read-Host "Admin email"
}

if (-not $AdminPassword) {
  $secure = Read-Host "Admin password" -AsSecureString
  $AdminPassword = Convert-SecureStringToPlainText -Secure $secure
}

if (-not $AdminEmail -or -not $AdminPassword) {
  throw "Admin email and password are required."
}

$adminHeaders = @{
  "Origin" = $Origin
  "Content-Type" = "application/json"
}

Write-Host "1) Logging in..."
$loginBody = @{ email = $AdminEmail; password = $AdminPassword } | ConvertTo-Json -Depth 6
$login = Invoke-RestMethod -Method Post -Uri "$WorkerBase/admin/login" -Headers $adminHeaders -Body $loginBody
if (-not $login.token) {
  throw "Login failed: no token returned."
}
$token = $login.token
Write-Host "   Login OK"

$authHeaders = @{
  "Origin" = $Origin
  "Content-Type" = "application/json"
  "Authorization" = "Bearer $token"
}

Write-Host "2) Loading current $Page draft for phase $Phase..."
$draftBefore = Invoke-RestMethod -Method Get -Uri "$WorkerBase/admin/content/pages/$Page?phase=$Phase&view=draft" -Headers $authHeaders
Write-Host "   Draft load OK"

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$newValue = "$($pageConfig.Prefix) $timestamp"
$draftRoot = @{}
Set-NestedValue -Target $draftRoot -Path $pageConfig.FieldPath -Value $newValue

$draftPayload = @{
  page = $Page
  phase = $Phase
  saveMode = "draft"
  draft = $draftRoot
} | ConvertTo-Json -Depth 12

Write-Host "3) Saving draft update..."
$draftSaved = Invoke-RestMethod -Method Put -Uri "$WorkerBase/admin/content/pages/$Page?phase=$Phase" -Headers $authHeaders -Body $draftPayload
Write-Host "   Draft save OK"

$publishPayload = @{
  page = $Page
  phase = $Phase
} | ConvertTo-Json -Depth 6

Write-Host "4) Publishing $Page page..."
$published = Invoke-RestMethod -Method Post -Uri "$WorkerBase/admin/content/pages/$Page/publish?phase=$Phase" -Headers $authHeaders -Body $publishPayload
Write-Host "   Publish OK"

Write-Host "5) Fetching public published content..."
$publicHeaders = @{ "Origin" = $Origin }
$public = Invoke-RestMethod -Method Get -Uri "$WorkerBase/content/pages/$Page?view=published&phase=$Phase" -Headers $publicHeaders

$publishedValue = Get-NestedValue -Source $public.page.published.content -Path $pageConfig.FieldPath
if ($publishedValue -ne $newValue) {
  throw "Published field mismatch. Expected '$newValue' but got '$publishedValue'."
}

Write-Host "   Public fetch OK"
Write-Host ""
Write-Host "Smoke test passed."
Write-Host "Page: $Page"
Write-Host "Phase: $Phase"
Write-Host "Field: $($pageConfig.FieldPath)"
Write-Host "Published value: $publishedValue"
