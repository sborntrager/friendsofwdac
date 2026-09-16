param(
  [switch]$CheckOnly,
  [switch]$DeployPages,
  [string]$PagesProject = "wadc",
  [switch]$RotateSecrets
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host ("==> " + $Message) -ForegroundColor Cyan
}

function Write-Info {
  param([string]$Message)
  Write-Host ("    " + $Message)
}

function Convert-SecureStringToPlainText {
  param([Security.SecureString]$SecureString)

  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

function ConvertFrom-JsonArray {
  param([string]$JsonText)

  if ([string]::IsNullOrWhiteSpace($JsonText)) {
    return @()
  }

  $parsed = $JsonText | ConvertFrom-Json
  return @($parsed)
}

function Get-RegexValue {
  param(
    [string]$Text,
    [string]$Pattern,
    [string]$Label
  )

  $match = [regex]::Match($Text, $Pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if (-not $match.Success) {
    throw "Could not find $Label."
  }

  return $match.Groups[1].Value
}

function New-RandomSecret {
  param([int]$ByteCount = 48)

  $bytes = New-Object byte[] $ByteCount
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $rng.GetBytes($bytes)
  }
  finally {
    $rng.Dispose()
  }

  return [Convert]::ToBase64String($bytes)
}

function Set-WranglerSecret {
  param(
    [string]$Name,
    [string]$Value
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    throw "Secret value for $Name cannot be empty."
  }

  Write-Info ("Setting secret " + $Name)
  $Value | & npx wrangler secret put $Name | Out-Host
}

function Get-HttpStatusCode {
  param(
    [string]$Uri,
    [string]$Body,
    [string]$Origin
  )

  $headers = @{
    Origin = $Origin
    "Content-Type" = "application/json"
  }

  try {
    $response = Invoke-WebRequest -Uri $Uri -Method Post -Headers $headers -ContentType "application/json" -Body $Body
    return [int]$response.StatusCode
  }
  catch {
    if ($_.Exception.Response) {
      return [int]$_.Exception.Response.StatusCode.value__
    }
    throw
  }
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
Set-Location $scriptRoot

Write-Step "Checking Wrangler authentication"
$whoamiOutput = & npx wrangler whoami
$whoamiOutput | Out-Host

Write-Step "Reading local project config"
$wranglerToml = Get-Content -Path ".\wrangler.toml" -Raw
$workerName = Get-RegexValue -Text $wranglerToml -Pattern 'name\s*=\s*"([^"]+)"' -Label "worker name"
$accountId = Get-RegexValue -Text $wranglerToml -Pattern 'account_id\s*=\s*"([^"]+)"' -Label "account ID"
$kvNamespaceId = Get-RegexValue -Text $wranglerToml -Pattern 'binding\s*=\s*"SUBSCRIBERS"\s*,\s*id\s*=\s*"([^"]+)"' -Label "SUBSCRIBERS KV namespace ID"
$allowedOrigins = Get-RegexValue -Text $wranglerToml -Pattern 'ALLOWED_ORIGIN\s*=\s*"([^"]+)"' -Label "allowed origins"
$primaryOrigin = ($allowedOrigins -split ",")[0].Trim()

Write-Info ("Worker name: " + $workerName)
Write-Info ("Account ID: " + $accountId)
Write-Info ("SUBSCRIBERS KV ID: " + $kvNamespaceId)
Write-Info ("Primary allowed origin: " + $primaryOrigin)

Write-Step "Checking Cloudflare KV namespaces"
$kvNamespaces = ConvertFrom-JsonArray (& npx wrangler kv namespace list | Out-String)
$configuredNamespace = $kvNamespaces | Where-Object { $_.id -eq $kvNamespaceId } | Select-Object -First 1
if (-not $configuredNamespace) {
  throw "Configured KV namespace ID $kvNamespaceId was not found in the current account."
}

Write-Info ("Matched KV namespace title: " + $configuredNamespace.title)

Write-Step "Checking Worker secrets"
$secrets = ConvertFrom-JsonArray (& npx wrangler secret list | Out-String)
$secretNames = @($secrets | ForEach-Object { $_.name })
$hasAdminSessionSecret = $secretNames -contains "ADMIN_SESSION_SECRET"

Write-Info ("ADMIN_SESSION_SECRET present: " + $hasAdminSessionSecret)

if ($CheckOnly) {
  Write-Step "Check-only summary"
  Write-Info "No secrets were changed."
  Write-Info "No deployments were run."
  Write-Info "Run .\\setup-forms-admin.ps1 to continue with setup."
  return
}

$shouldSetSecrets = $RotateSecrets -or -not $hasAdminSessionSecret

if ($shouldSetSecrets) {
  Write-Step "Setting admin secrets"
  if ($RotateSecrets -and $hasAdminSessionSecret) {
    Write-Info "Rotating existing admin secrets."
  }
  elseif (-not $hasAdminSessionSecret) {
    Write-Info "ADMIN_SESSION_SECRET is missing, so it will be created now."
  }

  $sessionSecret = New-RandomSecret
  Set-WranglerSecret -Name "ADMIN_SESSION_SECRET" -Value $sessionSecret

  Write-Info "Admin session secret has been updated."
}
else {
  Write-Step "Admin session secret already exists"
  Write-Info "Skipping secret creation. Use -RotateSecrets if you want to replace it."
}

Write-Step "Deploying Worker"
& npx wrangler deploy | Out-Host

if ($DeployPages) {
  Write-Step "Deploying Pages site"
  Push-Location $repoRoot
  try {
    & npx wrangler pages deploy .\site\public --project-name $PagesProject | Out-Host
  }
  finally {
    Pop-Location
  }
}
else {
  Write-Step "Skipping Pages deploy"
  Write-Info "Use -DeployPages if you also want to publish the static site."
}

Write-Step "Verifying live endpoints"
$adminHtml = Get-Content -Path ".\public\admin\index.html" -Raw
$membershipHtml = Get-Content -Path ".\public\forms\membership\index.html" -Raw
$homeHtml = Get-Content -Path ".\public\index.html" -Raw

$adminApiBase = Get-RegexValue -Text $adminHtml -Pattern 'data-admin-api-base="([^"]+)"' -Label "admin API base"
$formsEndpoint = Get-RegexValue -Text $membershipHtml -Pattern 'data-json-endpoint="([^"]+)"' -Label "forms endpoint"
$signupEndpoint = Get-RegexValue -Text $homeHtml -Pattern 'data-endpoint="([^"]+)"' -Label "signup endpoint"

$adminStatusUri = $adminApiBase.TrimEnd("/") + "/status"
$adminHeaders = @{
  Origin = $primaryOrigin
  "Content-Type" = "application/json"
}

$adminResponse = Invoke-WebRequest -Uri $adminStatusUri -Method Get -Headers $adminHeaders
$adminPayload = $null
if (-not [string]::IsNullOrWhiteSpace($adminResponse.Content)) {
  $adminPayload = $adminResponse.Content | ConvertFrom-Json
}

$formsStatus = Get-HttpStatusCode -Uri $formsEndpoint -Body '{"formType":"membership","fields":{}}' -Origin $primaryOrigin
$signupStatus = Get-HttpStatusCode -Uri $signupEndpoint -Body '{"email":"not-an-email"}' -Origin $primaryOrigin

Write-Info ("Admin status check: " + $adminResponse.StatusCode)
if ($adminPayload) {
  Write-Info ("Admin signup enabled: " + [string]$adminPayload.signupEnabled)
  Write-Info ("Allowed admin emails configured: " + [string]$adminPayload.allowedAdminCount)
  Write-Info ("Admin accounts already created: " + [string]$adminPayload.configuredAdminCount)
}
Write-Info ("Forms endpoint invalid-payload status: " + $formsStatus)
Write-Info ("Signup endpoint invalid-email status: " + $signupStatus)

Write-Step "Done"
Write-Info "Forms/admin backend setup flow completed."
if (-not $DeployPages) {
  Write-Info "If you changed public HTML and want those changes live too, rerun with -DeployPages."
}
